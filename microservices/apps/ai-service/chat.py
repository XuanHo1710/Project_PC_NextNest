"""
AI Chat service: uses Ollama (llama3.2) for conversational AI.
Loads product catalog context to answer questions about products.
No chat history persistence (in-memory only per session).
"""
import logging
import httpx
import json
from datetime import datetime

from config import get_settings
from database import get_mongo_db, get_qdrant_client
from hybrid_prediction import predictor
from embedding import generate_embedding
from recommendation import _fetch_product_cards

logger = logging.getLogger(__name__)
settings = get_settings()


def _build_product_catalog_context() -> str:
    """
    Build a compact product catalog summary for the AI system prompt.
    This gives the model knowledge about available products.
    Uses cached lookup maps for performance.
    """
    db = get_mongo_db()

    from recommendation import _lookup_maps
    brands_full, cats_full, attrs = _lookup_maps(db)
    brands = {k: v.get("name", "") for k, v in brands_full.items()}
    categories = {k: v.get("name", "") for k, v in cats_full.items()}

    products = list(
        db["products"]
        .find({"isDeleted": {"$ne": True}, "status": "ACTIVE"})
        .sort("createdAt", -1)
        .limit(100)
    )

    if not products:
        return "Hiện tại cửa hàng chưa có sản phẩm nào."

    # Batch-fetch all variants for the 100 products at once
    product_ids = [p["_id"] for p in products]
    all_variants = list(
        db["productvariants"].find(
            {"product": {"$in": product_ids}, "isDeleted": {"$ne": True}},
            {"price": 1, "discount": 1, "stock": 1, "combination": 1, "product": 1},
        )
    )
    variants_by_product = {}
    for v in all_variants:
        variants_by_product.setdefault(v["product"], []).append(v)

    lines = []
    for p in products:
        name = p.get("name", "")
        brand = brands.get(str(p.get("brand", "")), "")
        cat = categories.get(str(p.get("category", "")), "")
        min_price = p.get("minPrice", 0)
        max_price = p.get("maxPrice", 0)

        # Get variants from batch-fetched data (no per-product query)
        variants = variants_by_product.get(p["_id"], [])

        var_info = []
        for v in variants:
            combo = v.get("combination", {})
            combo_str = ", ".join(
                f"{attrs.get(k, k)}: {val}" for k, val in combo.items()
            ) if isinstance(combo, dict) else ""
            price = v.get("price", 0)
            discount = v.get("discount", 0)
            final = round(price * (1 - discount / 100))
            stock = v.get("stock", 0)
            var_info.append(f"  - {combo_str} | Giá: {final:,}đ (gốc {price:,}đ, giảm {discount}%) | Tồn kho: {stock}")

        line = f"• {name}"
        if brand:
            line += f" [{brand}]"
        if cat:
            line += f" ({cat})"
        line += f" - Giá: {min_price:,}đ ~ {max_price:,}đ"
        if var_info:
            line += "\n" + "\n".join(var_info[:5])  # Limit to 5 variants per product

        lines.append(line)

    return "\n".join(lines)


# Cache the catalog context (refreshed on reindex)
_catalog_context: str | None = None


def get_catalog_context() -> str:
    global _catalog_context
    if _catalog_context is None:
        try:
            _catalog_context = _build_product_catalog_context()
        except Exception as e:
            logger.warning(f"Failed to load product catalog: {e}")
            _catalog_context = "Hiện tại chưa tải được danh sách sản phẩm. Hãy trả lời chung về cửa hàng."
    return _catalog_context


def refresh_catalog_context():
    global _catalog_context
    _catalog_context = None
    # Also invalidate the lookup maps cache
    from recommendation import invalidate_lookup_cache
    invalidate_lookup_cache()
    logger.info("Product catalog context cache cleared")


SYSTEM_PROMPT = """Bạn là trợ lý AI của cửa hàng Arisu Store — chuyên bán PC Gaming, Laptop, Linh kiện máy tính và phụ kiện công nghệ.

Nhiệm vụ của bạn:
- Tư vấn sản phẩm phù hợp với nhu cầu khách hàng
- Trả lời câu hỏi về thông số kỹ thuật, giá cả, tồn kho
- So sánh sản phẩm khi được yêu cầu
- Hỗ trợ chính sách bảo hành, đổi trả, giao hàng
- Trả lời thân thiện, chuyên nghiệp, bằng tiếng Việt
- Nếu không biết câu trả lời, hãy nói rõ và gợi ý liên hệ hotline: 1800 2097

QUAN TRỌNG - Khi gợi ý sản phẩm:
- Luôn ghi TÊN SẢN PHẨM CHÍNH XÁC như trong danh sách sản phẩm bên dưới
- Dùng format: • TÊN_SẢN_PHẨM - GIÁ_TIỀN (ví dụ: • PC ULTRA GAMING i5 12400F - RTX 5060 8GB - 14,180,000đ)
- Hệ thống sẽ tự động hiển thị card sản phẩm với hình ảnh, giá, nút xem chi tiết
- KHÔNG cần ghi link hay URL, chỉ cần ghi đúng tên sản phẩm

Chính sách cửa hàng:
- Giao hàng miễn phí đơn từ 300,000đ
- Bảo hành chính hãng đầy đủ
- Đổi trả miễn phí trong 7 ngày
- Hỗ trợ trả góp 0%
- 4 showroom tại Hà Nội, Nghệ An, TP.HCM

Dưới đây là danh sách sản phẩm hiện có:

{catalog}

NẾU người dùng cung cấp thông tin (nghề nghiệp, thu nhập,...) để nhờ tư vấn cấu hình mua Laptop/PC, hãy thử phân tích và TRẢ LỜI DUY NHẤT chuỗi JSON sau (bắt đầu bằng PREDICT_JSON:):

PREDICT_JSON: {{"occupation": "...", "monthly_income": 0.0, "age": 20, "preferred_brand": "...", "usage_type": "...", "preferred_ram": "..."}}

Quy tắc điền JSON:
- occupation: sinh_vien, vp_ke_toan, giao_vien, lap_trinh_vien, ky_su, designer, gamer_streamer, quan_ly_doanh_nhan
- usage_type: van_phong_hoc_tap, gaming, do_hoa_ky_thuat, doanh_nhan_di_dong
- monthly_income: số triệu đồng (VD: 15.5). Nếu thiếu hãy để 10.
- preferred_brand: Dell, HP, Asus, Acer, Lenovo, MSI, Apple, Samsung (nếu user không nói thì để null)

Nếu KHÔNG PHẢI câu hỏi tư vấn cấu hình chi tiết (chỉ hỏi chung chung), hãy trả lời bình thường như nhân viên tư vấn.
Hãy trả lời ngắn gọn, chính xác và hữu ích. Sử dụng markdown nếu cần format. Trả lời bằng tiếng Việt."""


async def chat_with_ollama(
    message: str,
    conversation_history: list[dict] | None = None,
) -> dict:
    """
    Send a message to Ollama and get a response.
    conversation_history: list of { role: 'user'|'assistant', content: str }
    """
    catalog = get_catalog_context()
    system_prompt = SYSTEM_PROMPT.format(catalog=catalog)

    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (last 10 messages for context window management)
    if conversation_history:
        messages.extend(conversation_history[-10:])

    messages.append({"role": "user", "content": message})

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "num_predict": 1024,
                    },
                },
            )
            response.raise_for_status()
            data = response.json()

            assistant_message = data.get("message", {}).get("content", "")
            logger.info(f"RAW OLLAMA RESPONSE: {assistant_message}")

            # --- HYBRID AI PREDICTION INTEGRATION ---
            recommended_products = []
            if "PREDICT_JSON:" in assistant_message:
                try:
                    json_str = assistant_message.split("PREDICT_JSON:")[1].strip()
                    # Clean up markdown code blocks if present
                    if json_str.startswith("```"):
                        json_str = json_str.strip("`").replace("json", "").strip()
                    
                    user_profile = json.loads(json_str)
                    
                    # 1. Run prediction
                    prediction = predictor.predict(user_profile)
                    
                    if prediction:
                        # 2. Find real products
                        products = predictor.find_products(prediction)
                        
                        # 3. Build IProductCard-compatible results
                        if products:
                            product_ids = []
                            db = get_mongo_db()
                            for p in products:
                                name = p.get("name", "")
                                doc = db["products"].find_one(
                                    {"name": name, "isDeleted": {"$ne": True}, "status": "ACTIVE"},
                                    {"_id": 1}
                                )
                                if doc:
                                    product_ids.append(str(doc["_id"]))
                            if product_ids:
                                recommended_products = _fetch_product_cards(product_ids[:6])
                        
                        # 4. Re-generate response
                        assistant_message = (
                            f"🔍 **Phân tích nhu cầu của bạn:**\n"
                            f"- Nghề nghiệp: {user_profile.get('occupation')}\n"
                            f"- Thu nhập: ~{user_profile.get('monthly_income')} triệu/tháng\n"
                            f"- Nhu cầu: {prediction['recommended_category']} ({prediction['recommended_price_range']})\n\n"
                            f"🤖 **AI Đề Xuất Cấu Hình:**\n"
                            f"- Hãng: **{prediction['recommended_brand']}**\n"
                            f"- RAM: {prediction['recommended_ram']} | ROM: {prediction['recommended_rom']}\n"
                            f"- Tầm giá: {prediction['recommended_price_range']}\n\n"
                            f"💻 **Sản phẩm phù hợp tại cửa hàng:**\n"
                        )
                        
                        if products:
                            for p in products:
                                assistant_message += f"• {p['name']} - **{p['price']:,}đ**\n"
                        else:
                            assistant_message += "Hiện tại chưa tìm thấy sản phẩm khớp 100% tiêu chí, nhưng bạn có thể tham khảo các dòng tương đương tại cửa hàng."
                            
                except Exception as e:
                    logger.error(f"Failed to process prediction JSON: {e}")
                    # Fallback: Just return original text or generic msg
                    pass
            # ----------------------------------------

            # Search for relevant products via Qdrant vector similarity
            if not recommended_products:
                # Check if user message OR bot response mentions products
                product_keywords = [
                    "sản phẩm", "laptop", "pc", "máy tính", "linh kiện", "phụ kiện",
                    "ram", "cpu", "gpu", "ssd", "card", "màn hình", "bàn phím",
                    "chuột", "tai nghe", "tư vấn", "giá", "mua", "so sánh",
                    "gaming", "văn phòng", "sinh viên", "thiết kế", "lập trình",
                    "đề xuất", "gợi ý", "khuyến mãi", "giảm giá", "rẻ", "tốt",
                    "cấu hình", "build", "workstation", "rtx", "geforce", "ryzen",
                    "intel", "amd", "asus", "msi", "gigabyte", "corsair",
                ]
                msg_lower = message.lower()
                resp_lower = assistant_message.lower()
                is_product_query = any(kw in msg_lower for kw in product_keywords) or any(kw in resp_lower for kw in product_keywords)

                if is_product_query:
                    # Try searching with both user message and AI response combined for better matching
                    combined_query = f"{message} {assistant_message[:200]}"
                    recommended_products = search_products_for_chat(combined_query, limit=6)

                    # If Qdrant/vector search didn't find enough, also try extracting product names from AI response
                    if len(recommended_products) < 3:
                        extra = _extract_products_from_response(assistant_message, limit=6 - len(recommended_products))
                        existing_ids = {p["_id"] for p in recommended_products}
                        for ep in extra:
                            if ep["_id"] not in existing_ids:
                                recommended_products.append(ep)

            # Generate contextual suggestions
            suggestions = _generate_suggestions(message, assistant_message)

            return {
                "text": assistant_message,
                "timestamp": datetime.now().isoformat(),
                "suggestions": suggestions,
                "products": recommended_products,
            }

    except httpx.ConnectError:
        logger.error("Cannot connect to Ollama. Is it running?")
        return {
            "text": "Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau hoặc liên hệ hotline 1800 2097 để được hỗ trợ.",
            "timestamp": datetime.now().isoformat(),
            "suggestions": ["Liên hệ hỗ trợ", "Xem sản phẩm mới"],
            "products": [],
        }
    except Exception as e:
        logger.error(f"Ollama chat error: {e}")
        return {
            "text": "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
            "timestamp": datetime.now().isoformat(),
            "suggestions": [],
            "products": [],
        }


def search_products_for_chat(query: str, limit: int = 6) -> list[dict]:
    """
    Search for products relevant to the user's chat message.
    Tries Qdrant vector search first, falls back to MongoDB text search.
    Returns IProductCard-compatible dicts from MongoDB.
    """
    # 1. Try Qdrant vector search
    try:
        vector = generate_embedding(query)
        client = get_qdrant_client()

        search_result = client.query_points(
            collection_name=settings.COLLECTION_NAME,
            query=vector,
            limit=limit + 2,
            with_payload=True,
        )
        results = search_result.points

        # Collect mongo IDs from Qdrant results
        candidate_ids: list[str] = []
        for r in results:
            mongo_id = r.payload.get("_mongo_id", "")
            if mongo_id and r.score > 0.3:  # Only relevance above threshold
                candidate_ids.append(mongo_id)
            if len(candidate_ids) >= limit:
                break

        if candidate_ids:
            return _fetch_product_cards(candidate_ids)
    except Exception as e:
        logger.warning(f"Qdrant search failed: {e}, falling back to MongoDB text search")

    # 2. Fallback: MongoDB regex/text search
    try:
        return _mongo_fallback_search(query, limit)
    except Exception as e:
        logger.warning(f"MongoDB fallback search also failed: {e}")
        return []


def _mongo_fallback_search(query: str, limit: int = 6) -> list[dict]:
    """
    Fallback product search using MongoDB when Qdrant is unavailable.
    Uses regex matching on product name, brand name, and category name.
    """
    import re
    db = get_mongo_db()

    # Build regex from query keywords
    keywords = [w.strip() for w in query.split() if len(w.strip()) >= 2]
    if not keywords:
        return []

    # Build OR conditions for each keyword against product name
    regex_conditions = []
    for kw in keywords:
        escaped = re.escape(kw)
        regex_conditions.append({"name": {"$regex": escaped, "$options": "i"}})

    # Also search by brand/category names
    brand_ids = set()
    cat_ids = set()
    for kw in keywords:
        escaped = re.escape(kw)
        for b in db["brands"].find({"name": {"$regex": escaped, "$options": "i"}}, {"_id": 1}):
            brand_ids.add(b["_id"])
        for c in db["categories"].find({"name": {"$regex": escaped, "$options": "i"}}, {"_id": 1}):
            cat_ids.add(c["_id"])

    if brand_ids:
        regex_conditions.append({"brand": {"$in": list(brand_ids)}})
    if cat_ids:
        regex_conditions.append({"category": {"$in": list(cat_ids)}})

    products = list(
        db["products"]
        .find({
            "$or": regex_conditions,
            "isDeleted": {"$ne": True},
            "status": "ACTIVE",
        })
        .sort("createdAt", -1)
        .limit(limit)
    )

    if not products:
        return []

    product_ids = [str(p["_id"]) for p in products]
    return _fetch_product_cards(product_ids)


def _generate_suggestions(user_message: str, bot_response: str) -> list[str]:
    """Generate contextual quick-reply suggestions based on the conversation."""
    msg_lower = user_message.lower()

    if any(kw in msg_lower for kw in ["giá", "bao nhiêu", "giảm giá", "khuyến mãi"]):
        return ["So sánh với sản phẩm khác", "Có trả góp không?", "Còn hàng không?"]

    if any(kw in msg_lower for kw in ["laptop", "pc", "máy tính"]):
        return ["Tư vấn cấu hình", "Laptop cho sinh viên", "PC Gaming giá rẻ"]

    if any(kw in msg_lower for kw in ["bảo hành", "đổi trả", "hoàn tiền"]):
        return ["Chính sách giao hàng", "Liên hệ hotline", "Showroom gần nhất"]

    if any(kw in msg_lower for kw in ["ram", "cpu", "gpu", "ssd", "card"]):
        return ["So sánh cấu hình", "Nâng cấp được không?", "Tương thích không?"]

    # Default suggestions
    return ["Sản phẩm nổi bật", "Khuyến mãi hiện tại", "Tư vấn mua hàng"]


def _extract_products_from_response(response_text: str, limit: int = 6) -> list[dict]:
    """
    Extract product names mentioned in the AI response and match them to real
    products in MongoDB.  This catches cases where the LLM describes products
    inline (e.g. "• PC Gaming i5 12400F - RTX 3060") but the vector search
    didn't return them.
    """
    import re
    db = get_mongo_db()

    # Common patterns the LLM uses when listing products:
    #   • Product Name - **12,345,000đ**
    #   - Product Name
    #   1. Product Name
    pattern = re.compile(
        r"(?:^[•\-\*\d]+[\.\)]*\s*)"   # bullet / number prefix
        r"(.+?)(?:\s*[-–—]\s*\*{0,2}\d|$)",  # capture name before price
        re.MULTILINE,
    )
    candidates = [m.group(1).strip().strip("*").strip() for m in pattern.finditer(response_text)]
    # Also grab anything that looks like "PC ...", "Laptop ..."
    pc_pattern = re.compile(r"\b((?:PC|Laptop|Máy tính)\s[A-Za-z0-9\s\-\+]{10,60})", re.IGNORECASE)
    candidates += [m.group(1).strip() for m in pc_pattern.finditer(response_text)]

    if not candidates:
        return []

    # Deduplicate
    seen = set()
    unique = []
    for c in candidates:
        key = c.lower()[:30]
        if key not in seen and len(c) > 5:
            seen.add(key)
            unique.append(c)

    # Search MongoDB for each candidate name
    product_ids: list[str] = []
    for name in unique[:10]:  # cap iterations
        escaped = re.escape(name[:50])
        doc = db["products"].find_one(
            {
                "name": {"$regex": escaped, "$options": "i"},
                "isDeleted": {"$ne": True},
                "status": "ACTIVE",
            },
            {"_id": 1},
        )
        if doc and str(doc["_id"]) not in product_ids:
            product_ids.append(str(doc["_id"]))
        if len(product_ids) >= limit:
            break

    if not product_ids:
        return []

    return _fetch_product_cards(product_ids)
