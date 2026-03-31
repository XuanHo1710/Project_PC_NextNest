"""
Recommendation engine — v2 (fast & interaction-aware)

Speed:  Build IProductCard directly from Qdrant payload (NO MongoDB round-trip
        for result cards).  Only MongoDB calls are for building the user vector
        (views + interactions) — and those are cached in Qdrant.

Signals:
  1. ProductView.viewCount   — how many times user viewed a product
  2. ProductComment.rating   — user's star rating (1-5) on products
  3. Category affinity       — derived from views + ratings concentration

Architecture:
  preference_vector = weighted_average(product_embeddings)
    where weight = viewCount + (rating * RATING_BOOST)
  recommendation  = Qdrant.search(preference_vector) → IProductCard from payload
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

# ── Weight constants ──────────────────────────────────────────────
VIEW_WEIGHT = 1.0       # Per viewCount unit
RATING_WEIGHT = 3.0     # Per star (a 5-star review = 15.0 extra weight)
CATEGORY_BOOST = 1.3    # Multiplier for products matching user's top categories


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


# ── Qdrant payload → IProductCard (NO MongoDB) ───────────────────

def _qdrant_payload_to_card(payload: dict) -> dict:
    """Build an IProductCard-compatible dict directly from Qdrant payload.
    Eliminates the MongoDB round-trip that was the main bottleneck."""
    mongo_id = payload.get("_mongo_id", payload.get("product_id", ""))

    card: dict = {
        "_id": mongo_id,
        "name": payload.get("name", ""),
        "slug": payload.get("slug", ""),
        "minPrice": payload.get("min_price", 0),
        "maxPrice": payload.get("max_price", 0),
        "status": payload.get("status", "ACTIVE"),
    }

    # defaultVariant from Qdrant payload
    variant_image = payload.get("default_variant_image")
    card["defaultVariant"] = {
        "price": payload.get("default_variant_price", 0),
        "discount": payload.get("default_variant_discount", 0),
        "images": [variant_image] if variant_image else [],
        "stock": payload.get("default_variant_stock", 0),
        "combination": {},
    }

    # Brand
    brand_name = payload.get("brand_name", "")
    brand_id = payload.get("brand_id", "")
    if brand_name:
        card["brand"] = {"_id": brand_id, "name": brand_name}

    # Category
    cat_name = payload.get("category_name", "")
    cat_slug = payload.get("category_slug", "")
    cat_id = payload.get("category_id", "")
    if cat_name:
        card["category"] = {"_id": cat_id, "name": cat_name, "slug": cat_slug}

    return card


# ── user preference vector (views + interactions) ─────────────────

_user_collection_ok = False


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


def _build_interaction_fingerprint(guest_id: str, db) -> tuple[dict[str, float], dict[str, float]]:
    """
    Gather all interaction signals for a guest:
      1. ProductView.viewCount  (how many times they viewed each product)
      2. ProductComment.rating  (their star rating on products, depth=0 only)

    Returns:
      product_weights: { product_id_str: combined_weight }
      category_affinity: { category_id_str: total_weight }  (for re-ranking)
    """
    oid = ObjectId(guest_id)

    # ── Views ──
    views = list(
        db["productviews"]
        .find({"guest": oid}, {"product": 1, "viewCount": 1})
        .sort("viewCount", -1)
        .limit(30)
    )

    # ── Ratings (user's own root comments with rating) ──
    ratings = list(
        db["productcomments"].find(
            {"guest": oid, "depth": 0, "rating": {"$exists": True, "$gt": 0}, "isDeleted": {"$ne": True}},
            {"product": 1, "rating": 1},
        )
    )
    rating_map = {}  # product_id_str -> highest rating
    for r in ratings:
        pid = str(r["product"])
        rating_map[pid] = max(rating_map.get(pid, 0), r.get("rating", 0))

    # ── Combine weights ──
    product_weights: dict[str, float] = {}
    for v in views:
        pid = str(v["product"])
        view_w = float(v.get("viewCount", 1)) * VIEW_WEIGHT
        rate_w = float(rating_map.get(pid, 0)) * RATING_WEIGHT
        product_weights[pid] = view_w + rate_w

    # Add rated products that weren't in views (user rated but didn't track view)
    for pid, rating in rating_map.items():
        if pid not in product_weights:
            product_weights[pid] = float(rating) * RATING_WEIGHT

    if not product_weights:
        return {}, {}

    # ── Category affinity (which categories does user prefer?) ──
    product_oids = [ObjectId(pid) for pid in product_weights if ObjectId.is_valid(pid)]
    category_affinity: dict[str, float] = {}
    if product_oids:
        products = db["products"].find(
            {"_id": {"$in": product_oids}, "isDeleted": {"$ne": True}},
            {"category": 1},
        )
        for p in products:
            cat_id = str(p.get("category", ""))
            pid = str(p["_id"])
            if cat_id:
                category_affinity[cat_id] = category_affinity.get(cat_id, 0) + product_weights.get(pid, 0)

    return product_weights, category_affinity


def build_and_store_user_vector(guest_id: str) -> tuple[list[float] | None, set[str], dict[str, float]]:
    """
    Build a preference vector from views + interactions, store in Qdrant.
    Returns (vector, viewed_product_ids, category_affinity).
    Skips recomputation if interaction fingerprint hasn't changed.
    """
    db = get_mongo_db()

    if not ObjectId.is_valid(guest_id):
        return None, set(), {}

    product_weights, category_affinity = _build_interaction_fingerprint(guest_id, db)
    if not product_weights:
        return None, set(), {}

    viewed_ids = set(product_weights.keys())
    fingerprint_hash = sum(int(float(w) * 100) for w in product_weights.values())

    # ── Fast path: check if stored vector is still valid ──
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
            if stored.get("fingerprint_hash") == fingerprint_hash:
                logger.info(f"Reusing cached vector for guest {guest_id} (views unchanged)")
                return existing[0].vector, viewed_ids, category_affinity
    except Exception as e:
        logger.debug(f"Cache check failed (will rebuild): {e}")

    # ── Build new preference vector ──
    brands_full, cats_full, attrs = _lookup_maps(db)
    brands_simple = {k: v.get("name", "") for k, v in brands_full.items()}
    cats_simple = {k: v.get("name", "") for k, v in cats_full.items()}

    from product_index import build_product_text

    # Batch-fetch all interaction products at once
    product_oids = [ObjectId(pid) for pid in product_weights if ObjectId.is_valid(pid)]
    products_docs = {
        str(p["_id"]): p
        for p in db["products"].find({
            "_id": {"$in": product_oids},
            "isDeleted": {"$ne": True},
            "status": "ACTIVE",
        })
    }

    # Batch-fetch variants
    all_variants = list(
        db["productvariants"].find({
            "product": {"$in": product_oids},
            "isDeleted": {"$ne": True},
        })
    )
    variants_by_product = {}
    for v in all_variants:
        variants_by_product.setdefault(v["product"], []).append(v)

    texts: list[str] = []
    weights: list[float] = []

    for pid_str, weight in product_weights.items():
        product = products_docs.get(pid_str)
        if not product:
            continue

        brand_id = product.get("brand")
        cat_id = product.get("category")
        product["_brand_name"] = brands_simple.get(str(brand_id), "") if brand_id else ""
        product["_category_name"] = cats_simple.get(str(cat_id), "") if cat_id else ""

        variants = variants_by_product.get(product["_id"], [])
        text = build_product_text(product, variants, attrs)
        texts.append(text)
        weights.append(weight)

    if not texts:
        return None, viewed_ids, category_affinity

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
                    "fingerprint_hash": fingerprint_hash,
                    "category_affinity": category_affinity,
                },
            )
        ],
    )
    logger.info(f"Stored user vector for guest {guest_id} ({len(texts)} products, interaction-weighted)")
    return pref_list, viewed_ids, category_affinity


# ── public API ────────────────────────────────────────────────────

def get_recommendations(guest_id: str, limit: int = 8) -> list[dict]:
    """
    Fast personalised recommendations.
    1. Build/reuse user preference vector (views + ratings)
    2. Search Qdrant products collection (cosine similarity)
    3. Re-rank with category affinity boost
    4. Build IProductCard from Qdrant payload (NO MongoDB round-trip!)
    """
    viewed_ids: set[str] = set()
    category_affinity: dict[str, float] = {}
    try:
        preference_vector, viewed_ids, category_affinity = build_and_store_user_vector(guest_id)
    except Exception as e:
        logger.error(f"Failed to build user vector: {e}")
        preference_vector = None

    if preference_vector is None:
        return get_popular_products(limit)

    # Search Qdrant products collection
    try:
        client = get_qdrant_client()
        search_result = client.query_points(
            collection_name=settings.COLLECTION_NAME,
            query=preference_vector,
            limit=limit + len(viewed_ids) + 10,
            with_payload=True,
        )
        results = search_result.points
    except Exception as e:
        logger.error(f"Qdrant search failed: {e}")
        return get_popular_products(limit)

    if not results:
        return get_popular_products(limit)

    # ── Re-rank with category affinity boost ──
    max_affinity = max(category_affinity.values()) if category_affinity else 1.0

    scored_cards = []
    for r in results:
        mongo_id = r.payload.get("_mongo_id", r.payload.get("product_id", ""))
        if mongo_id in viewed_ids:
            continue

        base_score = r.score  # cosine similarity [0, 1]

        # Boost products whose category the user has strong affinity for
        cat_id = r.payload.get("category_id", "")
        if cat_id and cat_id in category_affinity and max_affinity > 0:
            affinity_ratio = category_affinity[cat_id] / max_affinity  # 0..1
            boosted_score = base_score * (1.0 + (CATEGORY_BOOST - 1.0) * affinity_ratio)
        else:
            boosted_score = base_score

        scored_cards.append((boosted_score, r.payload))

    # Sort by boosted score descending
    scored_cards.sort(key=lambda x: x[0], reverse=True)

    # Build IProductCard from Qdrant payload (NO MongoDB!)
    cards = [_qdrant_payload_to_card(payload) for _, payload in scored_cards[:limit]]

    return cards if cards else get_popular_products(limit)


# ── Popular products (cached) ─────────────────────────────────────

_popular_cache: dict = {"data": None, "expires": 0}
_POPULAR_TTL = 300  # 5 minutes


def get_popular_products(limit: int = 8) -> list[dict]:
    """
    Fallback: most-viewed products globally.
    Cached for 5 minutes. Builds cards from Qdrant payload when possible.
    """
    now = time.time()
    cached = _popular_cache["data"]
    if cached and now < _popular_cache["expires"] and len(cached) >= limit:
        return cached[:limit]

    try:
        db = get_mongo_db()
        pipeline = [
            {"$group": {"_id": "$product", "totalViews": {"$sum": "$viewCount"}}},
            {"$sort": {"totalViews": -1}},
            {"$limit": limit * 2},
        ]
        top_viewed = list(db["productviews"].aggregate(pipeline))

        if not top_viewed:
            # No views at all → newest active products from Qdrant
            return _popular_from_qdrant(limit)

        # Get the product IDs in popularity order
        popular_ids = [str(t["_id"]) for t in top_viewed]

        # Try to get cards from Qdrant payload (fast)
        cards = _fetch_cards_from_qdrant(popular_ids, limit)

        if not cards:
            cards = _fetch_product_cards(popular_ids[:limit])

        _popular_cache["data"] = cards
        _popular_cache["expires"] = now + _POPULAR_TTL
        return cards[:limit]

    except Exception as e:
        logger.error(f"get_popular_products failed: {e}")
        return []


def _popular_from_qdrant(limit: int) -> list[dict]:
    """Get newest products directly from Qdrant (no MongoDB)."""
    try:
        client = get_qdrant_client()
        results = client.scroll(
            collection_name=settings.COLLECTION_NAME,
            limit=limit,
            with_payload=True,
        )
        points = results[0] if results else []
        return [_qdrant_payload_to_card(p.payload) for p in points]
    except Exception:
        return []


def _fetch_cards_from_qdrant(product_ids: list[str], limit: int) -> list[dict]:
    """
    Fetch product cards from Qdrant by _mongo_id payload.
    Scrolls through the collection and matches by ID.
    Falls back gracefully if not all IDs found.
    """
    if not product_ids:
        return []

    try:
        client = get_qdrant_client()
        target_set = set(product_ids)
        found: dict[str, dict] = {}

        # Scroll through products collection (typically <2000 points)
        offset = None
        while len(found) < len(target_set):
            results, next_offset = client.scroll(
                collection_name=settings.COLLECTION_NAME,
                limit=200,
                offset=offset,
                with_payload=True,
            )
            for p in results:
                mid = p.payload.get("_mongo_id", p.payload.get("product_id", ""))
                if mid in target_set:
                    found[mid] = p.payload
            if next_offset is None or not results:
                break
            offset = next_offset

        # Preserve original order
        cards = []
        for pid in product_ids:
            if pid in found:
                cards.append(_qdrant_payload_to_card(found[pid]))
                if len(cards) >= limit:
                    break

        return cards
    except Exception as e:
        logger.warning(f"Qdrant card fetch failed: {e}")
        return []


# ── Legacy: MongoDB-based card fetching (kept for chat.py compat) ─

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
