"""
Product indexing: reads products from MongoDB, generates embeddings, upserts to Qdrant.
"""
import logging
from bson import ObjectId
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)

from config import get_settings
from database import get_mongo_db, get_qdrant_client
from embedding import generate_embeddings, get_embedding_dimension

logger = logging.getLogger(__name__)
settings = get_settings()


def build_product_text(product: dict, variants: list[dict], attributes: dict) -> str:
    """
    Build a rich text representation of a product for embedding.
    Includes name, description, brand, category, and all variant combinations.
    """
    parts = []

    # Product name (most important)
    name = product.get("name", "")
    if name:
        parts.append(name)

    # Description
    desc = product.get("description", "")
    if desc:
        # Strip HTML tags for cleaner text
        import re
        clean_desc = re.sub(r"<[^>]+>", " ", desc)
        clean_desc = re.sub(r"\s+", " ", clean_desc).strip()
        if clean_desc:
            parts.append(clean_desc[:500])  # Limit description length

    # Brand
    brand = product.get("_brand_name", "")
    if brand:
        parts.append(f"Thương hiệu: {brand}")

    # Category
    category = product.get("_category_name", "")
    if category:
        parts.append(f"Danh mục: {category}")

    # Price range
    min_price = product.get("minPrice", 0)
    max_price = product.get("maxPrice", 0)
    if min_price or max_price:
        parts.append(f"Giá: {min_price:,.0f}đ - {max_price:,.0f}đ")

    # Variant combinations (attribute name: value label)
    seen_combos = set()
    for v in variants:
        combo = v.get("combination", {})
        if isinstance(combo, dict):
            for code, value_label in combo.items():
                attr_name = attributes.get(code, code)
                key = f"{attr_name}: {value_label}"
                if key not in seen_combos:
                    seen_combos.add(key)
                    parts.append(key)

    return " | ".join(parts)


def fetch_all_products() -> list[dict]:
    """
    Fetch all active products from MongoDB with brand+category names resolved,
    plus their variants and attribute info.
    """
    db = get_mongo_db()

    # Build attribute code → name map
    attributes_cursor = db["productattributes"].find(
        {"isDeleted": {"$ne": True}}, {"code": 1, "name": 1}
    )
    attr_map = {}
    for a in attributes_cursor:
        if a.get("code"):
            attr_map[a["code"]] = a.get("name", a["code"])

    # Fetch brands and categories
    brands = {
        str(b["_id"]): b.get("name", "")
        for b in db["brands"].find({}, {"name": 1})
    }
    categories = {
        str(c["_id"]): {"name": c.get("name", ""), "slug": c.get("slug", "")}
        for c in db["categories"].find({}, {"name": 1, "slug": 1})
    }

    # Fetch all active products
    products_cursor = db["products"].find(
        {"isDeleted": {"$ne": True}, "status": "ACTIVE"}
    )
    products = list(products_cursor)

    results = []
    for p in products:
        pid = p["_id"]
        pid_str = str(pid)

        # Resolve brand/category names
        brand_id = p.get("brand")
        category_id = p.get("category")
        p["_brand_name"] = brands.get(str(brand_id), "") if brand_id else ""
        cat_info = categories.get(str(category_id), {}) if category_id else {}
        p["_category_name"] = cat_info.get("name", "")
        p["_category_slug"] = cat_info.get("slug", "")

        # Fetch variants for this product
        variants = list(
            db["productvariants"].find(
                {"product": pid, "isDeleted": {"$ne": True}}
            )
        )

        # Build text for embedding
        text = build_product_text(p, variants, attr_map)

        # Build default variant info
        default_variant = None
        default_variant_id = p.get("defaultProductVariantId")
        if default_variant_id:
            for v in variants:
                if v["_id"] == default_variant_id:
                    default_variant = v
                    break
        if not default_variant and variants:
            default_variant = variants[0]

        # Prepare payload (stored alongside vector in Qdrant)
        payload = {
            "product_id": pid_str,
            "name": p.get("name", ""),
            "slug": p.get("slug", ""),
            "description": p.get("description", "")[:300] if p.get("description") else "",
            "brand_name": p["_brand_name"],
            "brand_id": str(brand_id) if brand_id else "",
            "category_name": p["_category_name"],
            "category_slug": p["_category_slug"],
            "category_id": str(category_id) if category_id else "",
            "min_price": p.get("minPrice", 0),
            "max_price": p.get("maxPrice", 0),
            "status": p.get("status", "ACTIVE"),
            "default_variant_image": (
                (default_variant.get("images") or [None])[0]
                if default_variant
                else None
            ),
            "default_variant_price": (
                default_variant.get("price", 0) if default_variant else 0
            ),
            "default_variant_discount": (
                default_variant.get("discount", 0) if default_variant else 0
            ),
            "default_variant_stock": (
                default_variant.get("stock", 0) if default_variant else 0
            ),
            "variant_count": len(variants),
            "embedding_text": text,
        }

        results.append(
            {
                "id": pid_str,
                "text": text,
                "payload": payload,
            }
        )

    logger.info(f"Fetched {len(results)} products from MongoDB")
    return results


def ensure_collection():
    """Create the Qdrant collection if it doesn't exist."""
    try:
        client = get_qdrant_client()
        collection_name = settings.COLLECTION_NAME
        dim = get_embedding_dimension()

        collections = [c.name for c in client.get_collections().collections]
        if collection_name not in collections:
            logger.info(
                f"Creating Qdrant collection '{collection_name}' with dim={dim}"
            )
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
            )
            logger.info(f"Collection '{collection_name}' created")
        else:
            logger.info(f"Collection '{collection_name}' already exists")
    except Exception as e:
        error_msg = str(e)
        logger.warning(f"Failed to ensure Qdrant collection: {error_msg}")
        if "404" in error_msg or "Not Found" in error_msg:
            logger.warning(
                "Qdrant Cloud cluster may be expired or URL is invalid. "
                f"Current URL: {settings.QDRANT_URL} — "
                "Please create a new cluster at https://cloud.qdrant.io or run Qdrant locally: "
                "docker run -p 6333:6333 qdrant/qdrant"
            )
        logger.warning("Product vector search will be unavailable until Qdrant is fixed.")


def index_all_products() -> dict:
    """
    Full reindex: fetch all products from MongoDB, embed, upsert to Qdrant.
    Returns stats about the indexing.
    """
    ensure_collection()
    products = fetch_all_products()

    if not products:
        return {"message": "No products to index", "count": 0}

    # Generate embeddings in batch
    texts = [p["text"] for p in products]
    embeddings = generate_embeddings(texts)

    # Build Qdrant points
    points = []
    for i, product in enumerate(products):
        # Use a deterministic integer ID from the MongoDB ObjectId hex
        point_id = int(product["id"][-12:], 16) & 0x7FFFFFFFFFFFFFFF
        points.append(
            PointStruct(
                id=point_id,
                vector=embeddings[i],
                payload={
                    **product["payload"],
                    "_mongo_id": product["id"],
                },
            )
        )

    # Upsert in batches of 100
    batch_size = 100
    client = get_qdrant_client()
    for i in range(0, len(points), batch_size):
        batch = points[i : i + batch_size]
        client.upsert(
            collection_name=settings.COLLECTION_NAME,
            points=batch,
        )
        logger.info(f"Upserted batch {i // batch_size + 1}: {len(batch)} points")

    logger.info(f"Indexed {len(points)} products to Qdrant")
    return {"message": "Indexing complete", "count": len(points)}


def search_similar_products(
    product_id: str, limit: int = 20, exclude_ids: list[str] | None = None
) -> list[dict]:
    """
    Find products similar to the given product by vector similarity.
    """
    client = get_qdrant_client()
    db = get_mongo_db()

    # Get the product's text and generate embedding
    product = db["products"].find_one({"_id": ObjectId(product_id)})
    if not product:
        return []

    # Build attribute map
    attrs = {
        a["code"]: a.get("name", a["code"])
        for a in db["productattributes"].find(
            {"isDeleted": {"$ne": True}}, {"code": 1, "name": 1}
        )
        if a.get("code")
    }

    brands = {str(b["_id"]): b.get("name", "") for b in db["brands"].find({}, {"name": 1})}
    categories = {
        str(c["_id"]): {"name": c.get("name", ""), "slug": c.get("slug", "")}
        for c in db["categories"].find({}, {"name": 1, "slug": 1})
    }

    brand_id = product.get("brand")
    cat_id = product.get("category")
    product["_brand_name"] = brands.get(str(brand_id), "") if brand_id else ""
    cat_info = categories.get(str(cat_id), {}) if cat_id else {}
    product["_category_name"] = cat_info.get("name", "")

    variants = list(
        db["productvariants"].find(
            {"product": product["_id"], "isDeleted": {"$ne": True}}
        )
    )
    text = build_product_text(product, variants, attrs)

    from embedding import generate_embedding

    vector = generate_embedding(text)

    # Build exclude filter
    must_not = []
    all_exclude_ids = set(exclude_ids or [])
    all_exclude_ids.add(product_id)

    search_result = client.query_points(
        collection_name=settings.COLLECTION_NAME,
        query=vector,
        limit=limit + len(all_exclude_ids),  # fetch extra to compensate for exclusions
        with_payload=True,
    )
    results = search_result.points

    # Filter out excluded IDs
    filtered = []
    for r in results:
        mongo_id = r.payload.get("_mongo_id", "")
        if mongo_id not in all_exclude_ids:
            filtered.append(
                {
                    "score": r.score,
                    **{k: v for k, v in r.payload.items() if k != "_mongo_id"},
                    "product_id": mongo_id,
                }
            )
        if len(filtered) >= limit:
            break

    return filtered
