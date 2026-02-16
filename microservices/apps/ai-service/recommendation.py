"""
Recommendation engine:
- Maintains a per-user preference vector in Qdrant (user_preferences collection)
  built from ProductView.viewCount-weighted product embeddings.
- Queries the products collection with that preference vector to find similar items.
- Returns full IProductCard-compatible dicts fetched straight from MongoDB
  (real _id, sku, combination, brand._id, category._id …).
"""
import logging
import numpy as np
from bson import ObjectId
from qdrant_client.models import Distance, VectorParams, PointStruct

from config import get_settings
from database import get_mongo_db, get_qdrant_client
from embedding import generate_embeddings, get_embedding_dimension

logger = logging.getLogger(__name__)
settings = get_settings()


# ── helpers: shared lookups ───────────────────────────────────────

def _lookup_maps(db):
    """Return (brands_map, categories_map, attrs_map) keyed by str(_id)/code."""
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
    return brands, categories, attrs


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

def _ensure_user_collection():
    """Create the user_preferences Qdrant collection if missing."""
    client = get_qdrant_client()
    name = settings.USER_COLLECTION_NAME
    dim = get_embedding_dimension()

    existing = [c.name for c in client.get_collections().collections]
    if name not in existing:
        logger.info(f"Creating Qdrant collection '{name}' (dim={dim}, cosine)")
        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )


def _guest_point_id(guest_id: str) -> int:
    """Deterministic int64 point-id from a MongoDB ObjectId hex string."""
    return int(guest_id[-12:], 16) & 0x7FFFFFFFFFFFFFFF


def build_and_store_user_vector(guest_id: str) -> list[float] | None:
    """
    Build a preference vector for *guest_id* from their ProductView records
    (weighted by viewCount), then upsert it into the user_preferences collection.
    Returns the final vector, or None if there's no viewing history.
    """
    db = get_mongo_db()

    if not ObjectId.is_valid(guest_id):
        return None

    views = list(
        db["productviews"]
        .find({"guest": ObjectId(guest_id)})
        .sort("viewCount", -1)
        .limit(20)
    )
    if not views:
        return None

    _, _, attrs = _lookup_maps(db)
    brands_simple = {
        str(b["_id"]): b.get("name", "") for b in db["brands"].find({}, {"name": 1})
    }
    cats_simple = {
        str(c["_id"]): c.get("name", "") for c in db["categories"].find({}, {"name": 1})
    }

    from product_index import build_product_text

    texts: list[str] = []
    weights: list[float] = []

    for v in views:
        pid = v["product"]
        product = db["products"].find_one({"_id": pid})
        if not product or product.get("isDeleted") or product.get("status") != "ACTIVE":
            continue

        brand_id = product.get("brand")
        cat_id = product.get("category")
        product["_brand_name"] = brands_simple.get(str(brand_id), "") if brand_id else ""
        product["_category_name"] = cats_simple.get(str(cat_id), "") if cat_id else ""

        variants = list(
            db["productvariants"].find({"product": pid, "isDeleted": {"$ne": True}})
        )
        text = build_product_text(product, variants, attrs)
        texts.append(text)
        weights.append(float(v.get("viewCount", 1)))

    if not texts:
        return None

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

    view_summary = {str(v["product"]): v.get("viewCount", 1) for v in views}
    client.upsert(
        collection_name=settings.USER_COLLECTION_NAME,
        points=[
            PointStruct(
                id=_guest_point_id(guest_id),
                vector=pref_list,
                payload={
                    "guest_id": guest_id,
                    "viewed_products": view_summary,
                    "total_views": sum(view_summary.values()),
                },
            )
        ],
    )
    logger.info(f"Stored user vector for guest {guest_id} ({len(texts)} products, {sum(weights):.0f} views)")
    return pref_list


# ── public API ────────────────────────────────────────────────────

def get_recommendations(guest_id: str, limit: int = 20) -> list[dict]:
    """
    Personalised recommendations for *guest_id*.
    1. Build/update the user's preference vector from ProductView
    2. Search the products collection for nearest neighbours
    3. Exclude already-viewed products
    4. Fetch full product data from MongoDB (IProductCard shape)
    """
    try:
        preference_vector = build_and_store_user_vector(guest_id)
    except Exception as e:
        logger.error(f"Failed to build user vector: {e}")
        preference_vector = None

    if preference_vector is None:
        return get_popular_products(limit)

    # IDs to exclude
    viewed_ids: set[str] = set()
    try:
        db = get_mongo_db()
        viewed = list(
            db["productviews"]
            .find({"guest": ObjectId(guest_id)}, {"product": 1})
            .limit(50)
        )
        viewed_ids = {str(v["product"]) for v in viewed}
    except Exception as e:
        logger.warning(f"Cannot fetch viewed products from MongoDB: {e}")

    # Search Qdrant products collection (cosine similarity)
    client = get_qdrant_client()
    search_result = client.query_points(
        collection_name=settings.COLLECTION_NAME,
        query=preference_vector,
        limit=limit + len(viewed_ids) + 5,
        with_payload=True,
    )
    results = search_result.points

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

    return _fetch_product_cards(candidate_ids)


def get_popular_products(limit: int = 20) -> list[dict]:
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
    Preserves the input ordering.
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

    cards: list[dict] = []
    for pid in product_ids:
        p = products.get(pid)
        if not p:
            continue
        cards.append(_product_to_card(p, brands, categories, attrs, db))

    return cards
