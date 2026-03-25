"""
Recommendation engine:
- Maintains a per-user preference vector in Qdrant (user_preferences collection)
  built from ProductView.viewCount-weighted product embeddings.
- Queries the products collection with that preference vector to find similar items.
- Returns full IProductCard-compatible dicts fetched straight from MongoDB
  (real _id, sku, combination, brand._id, category._id …).
"""
import logging
import time
import numpy as np
from bson import ObjectId
from qdrant_client.models import Distance, VectorParams, PointStruct

from config import get_settings
from database import get_mongo_db, get_qdrant_client
from embedding import generate_embeddings, get_embedding_dimension

logger = logging.getLogger(__name__)
settings = get_settings()


# ── helpers: shared lookups with TTL cache ────────────────────────

_lookup_cache = {"data": None, "expires": 0}
_CACHE_TTL = 300  # 5 minutes


def _lookup_maps(db=None):
    """Return (brands_map, categories_map, attrs_map) keyed by str(_id)/code.
    Cached for 5 minutes to avoid redundant MongoDB queries."""
    now = time.time()
    if _lookup_cache["data"] and now < _lookup_cache["expires"]:
        return _lookup_cache["data"]

    if db is None:
        db = get_mongo_db()

    brands = {
        str(b["_id"]): {"_id": str(b["_id"]), "name": b.get("name", ""), "logo": b.get("logo")}
        for b in db["brands"].find({}, {"name": 1, "logo": 1})
    }
    categories = {
        str(c["_id"]): {"_id": str(c["_id"]), "name": c.get("name", ""), "slug": c.get("slug", "")}
        for c in db["categories"].find({}, {"name": 1, "slug": 1})
    }
    attrs = {
        a["code"]: a.get("name", a["code"])
        for a in db["productattributes"].find({"isDeleted": {"$ne": True}}, {"code": 1, "name": 1})
        if a.get("code")
    }
    result = (brands, categories, attrs)
    _lookup_cache["data"] = result
    _lookup_cache["expires"] = now + _CACHE_TTL
    return result


def invalidate_lookup_cache():
    """Clear the lookup cache (call after data changes)."""
    _lookup_cache["data"] = None
    _lookup_cache["expires"] = 0


def _resolve_default_variant(db, product: dict) -> dict | None:
    """Return the defaultProductVariant doc (or first variant) for a product."""
    default_vid = product.get("defaultProductVariantId")
    variant = None
    if default_vid:
        variant = db["productvariants"].find_one({"_id": default_vid, "isDeleted": {"$ne": True}})
    if not variant:
        variant = db["productvariants"].find_one(
            {"product": product["_id"], "isDeleted": {"$ne": True}},
            sort=[("createdAt", 1)],
        )
    return variant


def _variant_to_dict(variant: dict, attrs: dict) -> dict:
    """Convert a MongoDB variant doc to the IProductCard.defaultVariant shape."""
    combo_raw = variant.get("combination") or {}
    if hasattr(combo_raw, "items"):
        combination = dict(combo_raw)
    else:
        combination = {}
    return {
        "_id": str(variant["_id"]),
        "sku": variant.get("sku", ""),
        "price": variant.get("price", 0),
        "discount": variant.get("discount", 0),
        "images": variant.get("images", []),
        "combination": combination,
        "stock": variant.get("stock", 0),
    }


def _product_to_card(product: dict, brands: dict, categories: dict, attrs: dict, db) -> dict:
    """Convert a MongoDB product doc into an IProductCard-compatible dict."""
    pid = str(product["_id"])
    brand_id = product.get("brand")
    cat_id = product.get("category")

    variant = _resolve_default_variant(db, product)

    card: dict = {
        "_id": pid,
        "name": product.get("name", ""),
        "slug": product.get("slug", ""),
        "description": product.get("description"),
        "minPrice": product.get("minPrice", 0),
        "maxPrice": product.get("maxPrice", 0),
        "status": product.get("status", "ACTIVE"),
        "avgRating": product.get("avgRating", 0),
        "totalRatings": product.get("totalRatings", 0),
        "createdAt": str(product["createdAt"]) if product.get("createdAt") else None,
        "updatedAt": str(product["updatedAt"]) if product.get("updatedAt") else None,
    }

    if variant:
        card["defaultVariant"] = _variant_to_dict(variant, attrs)

    if brand_id and str(brand_id) in brands:
        card["brand"] = brands[str(brand_id)]

    if cat_id and str(cat_id) in categories:
        card["category"] = categories[str(cat_id)]

    return card


# ── user preference vector ────────────────────────────────────────

_user_collection_ok = False  # Track if collection has correct dimension


def _ensure_user_collection():
    """Create the user_preferences Qdrant collection if missing or dimension-mismatched."""
    global _user_collection_ok
    if _user_collection_ok:
        return

    client = get_qdrant_client()
    name = settings.USER_COLLECTION_NAME
    dim = get_embedding_dimension()

    existing_names = [c.name for c in client.get_collections().collections]
    if name in existing_names:
        info = client.get_collection(name)
        current_dim = info.config.params.vectors.size
        if current_dim != dim:
            logger.warning(f"Collection '{name}' has dim={current_dim}, expected {dim}. Recreating…")
            client.delete_collection(name)
        else:
            _user_collection_ok = True
            return

    logger.info(f"Creating Qdrant collection '{name}' (dim={dim}, cosine)")
    client.create_collection(
        collection_name=name,
        vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
    )
    _user_collection_ok = True


def _guest_point_id(guest_id: str) -> int:
    """Deterministic int64 point-id from a MongoDB ObjectId hex string."""
    return int(guest_id[-12:], 16) & 0x7FFFFFFFFFFFFFFF


def build_and_store_user_vector(guest_id: str) -> tuple[list[float] | None, set[str]]:
    """
    Build a preference vector for *guest_id* from their ProductView records
    (weighted by viewCount), then upsert it into the user_preferences collection.
    Returns (vector, viewed_product_ids) — vector is None if no viewing history.
    Skips recomputation if the view counts haven't changed since last build.
    """
    db = get_mongo_db()

    if not ObjectId.is_valid(guest_id):
        return None, set()

    views = list(
        db["productviews"]
        .find({"guest": ObjectId(guest_id)})
        .sort("viewCount", -1)
        .limit(20)
    )
    if not views:
        return None, set()

    viewed_ids = {str(v["product"]) for v in views}

    # Check if views haven't changed — reuse stored vector
    current_summary = {str(v["product"]): v.get("viewCount", 1) for v in views}
    current_total = sum(current_summary.values())
    try:
        _ensure_user_collection()
        client = get_qdrant_client()
        existing = client.retrieve(
            collection_name=settings.USER_COLLECTION_NAME,
            ids=[_guest_point_id(guest_id)],
            with_vectors=True,
            with_payload=True,
        )
        if existing:
            stored = existing[0].payload or {}
            if stored.get("total_views") == current_total and stored.get("viewed_products") == current_summary:
                logger.info(f"Reusing cached vector for guest {guest_id} (views unchanged)")
                return existing[0].vector, viewed_ids
    except Exception as e:
        logger.debug(f"Cache check failed (will rebuild): {e}")

    # Use cached lookup maps (avoids re-querying brands/categories/attrs every call)
    brands_full, cats_full, attrs = _lookup_maps(db)
    brands_simple = {k: v.get("name", "") for k, v in brands_full.items()}
    cats_simple = {k: v.get("name", "") for k, v in cats_full.items()}

    from product_index import build_product_text

    # Batch-fetch all viewed products at once (instead of N queries)
    product_ids = [v["product"] for v in views]
    products_docs = {
        p["_id"]: p
        for p in db["products"].find({
            "_id": {"$in": product_ids},
            "isDeleted": {"$ne": True},
            "status": "ACTIVE",
        })
    }

    # Batch-fetch all variants for those products at once
    all_variants = list(
        db["productvariants"].find({
            "product": {"$in": list(products_docs.keys())},
            "isDeleted": {"$ne": True},
        })
    )
    variants_by_product = {}
    for v in all_variants:
        pid = v["product"]
        variants_by_product.setdefault(pid, []).append(v)

    texts: list[str] = []
    weights: list[float] = []

    for v in views:
        pid = v["product"]
        product = products_docs.get(pid)
        if not product:
            continue

        brand_id = product.get("brand")
        cat_id = product.get("category")
        product["_brand_name"] = brands_simple.get(str(brand_id), "") if brand_id else ""
        product["_category_name"] = cats_simple.get(str(cat_id), "") if cat_id else ""

        variants = variants_by_product.get(pid, [])
        text = build_product_text(product, variants, attrs)
        texts.append(text)
        weights.append(float(v.get("viewCount", 1)))

    if not texts:
        return None, viewed_ids

    embeddings = generate_embeddings(texts)
    emb_np = np.array(embeddings, dtype=np.float64)
    w_np = np.array(weights, dtype=np.float64)
    w_np /= w_np.sum()

    pref = np.average(emb_np, axis=0, weights=w_np)
    norm = np.linalg.norm(pref)
    if norm > 0:
        pref = pref / norm
    pref_list = pref.tolist()

    # Upsert into user_preferences collection
    _ensure_user_collection()
    client = get_qdrant_client()

    client.upsert(
        collection_name=settings.USER_COLLECTION_NAME,
        points=[
            PointStruct(
                id=_guest_point_id(guest_id),
                vector=pref_list,
                payload={
                    "guest_id": guest_id,
                    "viewed_products": current_summary,
                    "total_views": current_total,
                },
            )
        ],
    )
    logger.info(f"Stored user vector for guest {guest_id} ({len(texts)} products, {sum(weights):.0f} views)")
    return pref_list, viewed_ids


# ── public API ────────────────────────────────────────────────────

def get_recommendations(guest_id: str, limit: int = 8) -> list[dict]:
    """
    Personalised recommendations for *guest_id*.
    1. Build/update the user's preference vector from ProductView
    2. Search the products collection for nearest neighbours
    3. Exclude already-viewed products
    4. Fetch full product data from MongoDB (IProductCard shape)
    """
    viewed_ids: set[str] = set()
    try:
        preference_vector, viewed_ids = build_and_store_user_vector(guest_id)
    except Exception as e:
        logger.error(f"Failed to build user vector: {e}")
        preference_vector = None

    if preference_vector is None:
        return get_popular_products(limit)

    # Search Qdrant products collection (cosine similarity)
    try:
        client = get_qdrant_client()
        search_result = client.query_points(
            collection_name=settings.COLLECTION_NAME,
            query=preference_vector,
            limit=limit + len(viewed_ids) + 5,
            with_payload=True,
        )
        results = search_result.points
    except Exception as e:
        logger.error(f"Qdrant search failed: {e}")
        return get_popular_products(limit)

    # Collect mongo IDs (excluding viewed)
    candidate_ids: list[str] = []
    for r in results:
        mongo_id = r.payload.get("_mongo_id", "")
        if mongo_id and mongo_id not in viewed_ids:
            candidate_ids.append(mongo_id)
        if len(candidate_ids) >= limit:
            break

    if not candidate_ids:
        return get_popular_products(limit)

    try:
        return _fetch_product_cards(candidate_ids)
    except Exception as e:
        logger.error(f"Failed to fetch product cards: {e}")
        return get_popular_products(limit)


def get_popular_products(limit: int = 8) -> list[dict]:
    """
    Fallback: most-viewed products globally.
    Returns full IProductCard dicts from MongoDB.
    """
    try:
        db = get_mongo_db()

        pipeline = [
            {"$group": {"_id": "$product", "totalViews": {"$sum": "$viewCount"}}},
            {"$sort": {"totalViews": -1}},
            {"$limit": limit * 2},
        ]
        top_viewed = list(db["productviews"].aggregate(pipeline))

        if top_viewed:
            product_ids = [t["_id"] for t in top_viewed]
            # Keep order
            ordered_ids = []
            products = {
                str(p["_id"]): p
                for p in db["products"].find(
                    {"_id": {"$in": product_ids}, "isDeleted": {"$ne": True}, "status": "ACTIVE"}
                )
            }
            for t in top_viewed:
                pid_str = str(t["_id"])
                if pid_str in products:
                    ordered_ids.append(pid_str)
                if len(ordered_ids) >= limit:
                    break

            if ordered_ids:
                return _fetch_product_cards(ordered_ids)

        # Nothing in views at all → newest active products
        products = list(
            db["products"]
            .find({"isDeleted": {"$ne": True}, "status": "ACTIVE"})
            .sort("createdAt", -1)
            .limit(limit)
        )
        return _fetch_product_cards([str(p["_id"]) for p in products])
    except Exception as e:
        logger.error(f"get_popular_products failed (MongoDB may be down): {e}")
        return []


def _fetch_product_cards(product_ids: list[str]) -> list[dict]:
    """
    Given a list of MongoDB product _id strings, return a list of
    IProductCard-compatible dicts with real _id, sku, combination, brand, category …
    Preserves the input ordering. Uses batch queries for performance.
    """
    if not product_ids:
        return []

    db = get_mongo_db()
    brands, categories, attrs = _lookup_maps(db)

    oids = [ObjectId(pid) for pid in product_ids if ObjectId.is_valid(pid)]
    products = {
        str(p["_id"]): p
        for p in db["products"].find({"_id": {"$in": oids}})
    }

    # Batch-fetch all variants for these products at once
    all_variants = list(
        db["productvariants"].find({
            "product": {"$in": oids},
            "isDeleted": {"$ne": True},
        }).sort("createdAt", 1)
    )
    variants_by_product = {}
    for v in all_variants:
        variants_by_product.setdefault(str(v["product"]), []).append(v)

    cards: list[dict] = []
    for pid in product_ids:
        p = products.get(pid)
        if not p:
            continue

        # Resolve default variant from batch data
        product_variants = variants_by_product.get(pid, [])
        default_vid = p.get("defaultProductVariantId")
        variant = None
        if default_vid and product_variants:
            variant = next(
                (v for v in product_variants if str(v["_id"]) == str(default_vid)), None
            )
        if not variant and product_variants:
            variant = product_variants[0]

        card = _product_to_card_with_variant(p, variant, brands, categories, attrs)
        cards.append(card)

    return cards


def _product_to_card_with_variant(
    product: dict, variant: dict | None, brands: dict, categories: dict, attrs: dict
) -> dict:
    """Convert a MongoDB product doc into an IProductCard-compatible dict using a pre-resolved variant."""
    pid = str(product["_id"])
    brand_id = product.get("brand")
    cat_id = product.get("category")

    card: dict = {
        "_id": pid,
        "name": product.get("name", ""),
        "slug": product.get("slug", ""),
        "description": product.get("description"),
        "minPrice": product.get("minPrice", 0),
        "maxPrice": product.get("maxPrice", 0),
        "status": product.get("status", "ACTIVE"),
        "avgRating": product.get("avgRating", 0),
        "totalRatings": product.get("totalRatings", 0),
        "createdAt": str(product["createdAt"]) if product.get("createdAt") else None,
        "updatedAt": str(product["updatedAt"]) if product.get("updatedAt") else None,
    }

    if variant:
        card["defaultVariant"] = _variant_to_dict(variant, attrs)

    if brand_id and str(brand_id) in brands:
        card["brand"] = brands[str(brand_id)]

    if cat_id and str(cat_id) in categories:
        card["category"] = categories[str(cat_id)]

    return card
