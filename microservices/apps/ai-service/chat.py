"""
AI Chat service: uses Groq (llama-3.1-8b-instant) for conversational AI.
Loads product catalog context to answer questions about products.
No chat history persistence (in-memory only per session).

Architecture: RAG + LLM + ML (3-in-1)
  1. RAG: Embed user query → Qdrant vector search → retrieve similar products
  2. LLM: Groq with enriched prompt (catalog + RAG context)
  3. ML:  Price prediction from Colab-trained models when triggered
"""
import asyncio
import logging
import httpx
import json
import uuid
from datetime import datetime
from typing import AsyncGenerator

from config import get_settings
from database import get_mongo_db, get_qdrant_client
from price_predictor import tech_price_predictor
from embedding import generate_embedding
from recommendation import _fetch_product_cards

logger = logging.getLogger(__name__)
settings = get_settings()
GROQ_CHAT_COMPLETIONS_URL = f"{settings.GROQ_API_BASE_URL.rstrip('/')}/chat/completions"


def _groq_headers(session_id: str | None = None) -> dict[str, str]:
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not configured")
    return {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "python-httpx/0.27.0",
        "x-session-id": session_id or str(uuid.uuid4()),
    }


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
        .limit(10)
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


SYSTEM_PROMPT = """Bạn là trợ lý AI của cửa hàng Arisu Store — chuyên bán PC Gaming, Laptop, Linh kiện máy tính, Điện thoại và phụ kiện công nghệ.

Nhiệm vụ của bạn:
- Tư vấn sản phẩm phù hợp với nhu cầu khách hàng
- DỰ ĐOÁN GIÁ sản phẩm dựa trên thông số kỹ thuật (Laptop, Smartphone)
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

═══ SẢN PHẨM LIÊN QUAN (RAG Context) - Kết quả tìm kiếm từ câu hỏi người dùng ═══

{rag_context}

═══ TÍNH NĂNG DỰ ĐOÁN GIÁ (AI PRICE PREDICTION — ML Models trained on Kaggle) ═══

NẾU người dùng hỏi DỰ ĐOÁN GIÁ / ƯỚC TÍNH GIÁ một sản phẩm dựa trên thông số kỹ thuật, hãy trích xuất thông số và TRẢ LỜI DUY NHẤT chuỗi JSON sau:

PRICE_PREDICT_JSON: {{"category": "...", "specs": {{...}} }}

Danh mục hỗ trợ dự đoán giá (category):
- "laptop": Laptop / Notebook — model XGBoost R²=0.846 (dữ liệu 1,657 laptops từ Kaggle)
- "smartphone": Điện thoại — model Random Forest R²=0.848 (dữ liệu 3,114 smartphones từ Kaggle)

Specs CỤ THỂ theo category (CHỈ điền các trường mà user cung cấp):

LAPTOP specs:
- brand: Tên hãng (Acer/Apple/Asus/Dell/HP/Lenovo/MSI/Toshiba/Samsung/...)
- type_name: Loại (Notebook/Ultrabook/Gaming/Workstation/2 in 1 Convertible/Netbook)
- cpu_brand: Hãng CPU (Intel/AMD)
- gpu_brand: Hãng GPU (Intel/AMD/Nvidia)
- os: Hệ điều hành (Windows/Mac/Linux/Other)
- inches: Kích thước màn hình (13.3, 14, 15.6, 17.3...)
- ram_gb: Dung lượng RAM (4/8/16/32/64)
- cpu_freq_ghz: Xung nhịp CPU GHz (2.0-5.0)
- ssd_gb: Dung lượng SSD (0/128/256/512/1024/2048)
- hdd_gb: Dung lượng HDD (0/500/1000/2000)
- touchscreen: Màn hình cảm ứng (0 hoặc 1)
- ips: Tấm nền IPS (0 hoặc 1)
- ppi: Mật độ điểm ảnh (100-300, ví dụ FHD 15.6"=141, 4K 15.6"=282)

SMARTPHONE specs:
- brand: Hãng (SAMSUNG/Apple/Xiaomi/Nokia/OPPO/Realme/vivo/OnePlus/Motorola/Google Pixel/...)
- ram_gb: RAM (2/3/4/6/8/12/16)
- storage_gb: Bộ nhớ trong (16/32/64/128/256/512)
- rating: Đánh giá trung bình (1.0-5.0)
- has_camera: Có camera (0 hoặc 1)
- discount_pct: Phần trăm giảm giá (0-50)

VÍ DỤ:
- User: "Laptop Dell i7 16GB RAM RTX giá bao nhiêu?" →
  PRICE_PREDICT_JSON: {{"category": "laptop", "specs": {{"brand": "Dell", "cpu_brand": "Intel", "gpu_brand": "Nvidia", "ram_gb": 16}} }}

- User: "Samsung 8GB 128GB giá khoảng bao nhiêu?" →
  PRICE_PREDICT_JSON: {{"category": "smartphone", "specs": {{"brand": "SAMSUNG", "ram_gb": 8, "storage_gb": 128}} }}

LƯU Ý: Với các sản phẩm khác (CPU, RAM, GPU, SSD) mà chưa có model dự đoán, hãy tư vấn dựa trên kiến thức và danh sách sản phẩm cửa hàng bên trên, KHÔNG dùng PRICE_PREDICT_JSON.

Nếu KHÔNG PHẢI câu hỏi dự đoán giá, hãy trả lời bình thường như nhân viên tư vấn.
Hãy sử dụng thông tin từ RAG Context ở trên để đề xuất sản phẩm chính xác nhất.
Hãy trả lời ngắn gọn, chính xác và hữu ích. Sử dụng markdown nếu cần format. Trả lời bằng tiếng Việt."""


def _build_rag_context(user_message: str) -> str:
    """
    RAG: Embed user query → search Qdrant → return relevant product context.
    This enriches the LLM prompt with semantically similar products.
    All data comes directly from Qdrant payload (no extra MongoDB calls).
    """
    try:
        vector = generate_embedding(user_message)
        client = get_qdrant_client()

        search_result = client.query_points(
            collection_name=settings.COLLECTION_NAME,
            query=vector,
            limit=8,
            with_payload=True,
        )

        if not search_result.points:
            return "Không tìm thấy sản phẩm liên quan trong cơ sở dữ liệu."

        lines = []
        for point in search_result.points:
            if point.score < 0.25:
                continue
            payload = point.payload or {}
            name = payload.get("name", "")
            brand = payload.get("brand_name", "")
            category = payload.get("category_name", "")
            min_price = payload.get("min_price", 0)
            max_price = payload.get("max_price", 0)
            desc = payload.get("description", "")
            score = point.score

            line = f"• [{score:.0%}] {name}"
            if brand:
                line += f" [{brand}]"
            if category:
                line += f" ({category})"
            if min_price:
                line += f" — {min_price:,.0f}đ"
                if max_price and max_price != min_price:
                    line += f" ~ {max_price:,.0f}đ"
            if desc:
                line += f"\n  {desc[:150]}"

            lines.append(line)

        if not lines:
            return "Không tìm thấy sản phẩm có độ tương đồng cao."

        return "\n".join(lines)

    except Exception as e:
        logger.warning(f"RAG context retrieval failed: {e}")
        return "Chưa thể tìm kiếm sản phẩm liên quan. Vui lòng tham khảo danh sách sản phẩm ở trên."


async def chat_with_groq(
    message: str,
    conversation_history: list[dict] | None = None,
) -> dict:
    """
    3-in-1 AI Chat: RAG + LLM + ML
    1. RAG: Embed user query → Qdrant vector search → retrieve relevant products
    2. LLM: Send enriched prompt (catalog + RAG context) to Groq
    3. ML: If LLM detects price prediction intent → run ML model → format response

    conversation_history: list of { role: 'user'|'assistant', content: str }
    """
    catalog = get_catalog_context()

    # ── Step 1: RAG — Embed user message and retrieve relevant products ──
    # Run in thread to avoid blocking the async event loop
    rag_context = await asyncio.to_thread(_build_rag_context, message)

    system_prompt = SYSTEM_PROMPT.format(catalog=catalog, rag_context=rag_context)

    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (last 10 messages for context window management)
    if conversation_history:
        messages.extend(conversation_history[-10:])

    messages.append({"role": "user", "content": message})

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                GROQ_CHAT_COMPLETIONS_URL,
                headers=_groq_headers(),
                json={
                    "model": settings.GROQ_MODEL,
                    "messages": messages,
                    "stream": False,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_completion_tokens": 1024,
                },
            )
            response.raise_for_status()
            data = response.json()

            assistant_message = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            logger.info(f"RAW GROQ RESPONSE: {assistant_message}")

            # --- PRICE PREDICTION INTEGRATION ---
            recommended_products = []
            if "PRICE_PREDICT_JSON:" in assistant_message:
                try:
                    json_str = assistant_message.split("PRICE_PREDICT_JSON:")[1].strip()
                    # Clean up markdown code blocks if present
                    if json_str.startswith("```"):
                        json_str = json_str.strip("`").replace("json", "").strip()
                    # Handle trailing text after JSON
                    brace_count = 0
                    end_idx = 0
                    for i, ch in enumerate(json_str):
                        if ch == '{':
                            brace_count += 1
                        elif ch == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end_idx = i + 1
                                break
                    if end_idx > 0:
                        json_str = json_str[:end_idx]

                    price_data = json.loads(json_str)
                    category = price_data.get("category", "laptop")
                    specs = price_data.get("specs", {})

                    # 1. Run price prediction
                    result = tech_price_predictor.predict_price(category, specs)

                    if result:
                        predicted = result["predicted_price"]
                        low = result["price_range"]["low"]
                        high = result["price_range"]["high"]
                        confidence = result["confidence"]

                        # 2. Build specs display
                        specs_display = ", ".join(
                            f"{k}: {v}" for k, v in specs.items() if v is not None
                        )

                        # 3. Build price factors display
                        factors_str = ""
                        for i, f in enumerate(result.get("price_factors", [])[:4], 1):
                            factors_str += f"{i}. {f['feature']} ({f['impact']*100:.0f}%)\n"

                        # 4. Re-generate response
                        cat_names = {
                            "laptop": "Laptop", "cpu": "CPU", "ram": "RAM",
                            "gpu": "Card đồ họa", "smartphone": "Điện thoại", "ssd": "Ổ cứng SSD",
                        }
                        assistant_message = (
                            f"🔍 **Dự đoán giá {cat_names.get(category, category)}:**\n"
                            f"- Thông số: {specs_display}\n\n"
                            f"💰 **Giá dự đoán: {predicted:,}₫**\n"
                            f"📊 Khoảng giá: {low:,}₫ ~ {high:,}₫\n"
                            f"📈 Độ tin cậy: {confidence*100:.0f}%\n\n"
                            f"🔑 **Yếu tố ảnh hưởng giá:**\n{factors_str}\n"
                            f"💻 **Sản phẩm tương tự tại cửa hàng:**\n"
                        )

                        # 5. Find similar products near predicted price
                        try:
                            db = get_mongo_db()
                            products = list(
                                db["products"].find({
                                    "isDeleted": {"$ne": True}, "status": "ACTIVE",
                                    "minPrice": {"$gte": int(predicted * 0.7), "$lte": int(predicted * 1.3)},
                                }).sort("createdAt", -1).limit(6)
                            )
                            if products:
                                product_ids = [str(p["_id"]) for p in products]
                                recommended_products = _fetch_product_cards(product_ids)
                                for p in products:
                                    price = p.get("minPrice", 0)
                                    assistant_message += f"• {p.get('name', '')} - **{price:,}₫**\n"
                            else:
                                assistant_message += "Hiện tại chưa tìm thấy sản phẩm tương tự trong cửa hàng."
                        except Exception as e:
                            logger.warning(f"Failed to search similar products: {e}")
                            assistant_message += "Đang cập nhật danh sách sản phẩm..."

                except Exception as e:
                    logger.error(f"Failed to process price prediction JSON: {e}")
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
        logger.error("Cannot connect to Groq. Is the API key valid and the service reachable?")
        return {
            "text": "Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau hoặc liên hệ hotline 1800 2097 để được hỗ trợ.",
            "timestamp": datetime.now().isoformat(),
            "suggestions": ["Liên hệ hỗ trợ", "Xem sản phẩm mới"],
            "products": [],
        }
    except Exception as e:
        logger.error(f"Groq chat error: {e}")
        return {
            "text": "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
            "timestamp": datetime.now().isoformat(),
            "suggestions": [],
            "products": [],
        }


async def chat_with_groq_stream(
    message: str,
    conversation_history: list[dict] | None = None,
) -> AsyncGenerator[str, None]:
    """
    Stream 3-in-1 AI Chat: RAG + LLM + ML via SSE.
    1. RAG: Embed user query → Qdrant vector search → context
    2. LLM: Stream tokens from Groq with enriched prompt
    3. ML: Post-process price prediction if triggered

    Yields SSE-formatted lines:
      data: {"type":"token","content":"..."}
      data: {"type":"done","suggestions":[...],"products":[...]}
    """
    catalog = get_catalog_context()

    # ── Step 1: RAG — Embed user message and retrieve relevant products ──
    # Run in thread to avoid blocking the async event loop
    rag_context = await asyncio.to_thread(_build_rag_context, message)

    system_prompt = SYSTEM_PROMPT.format(catalog=catalog, rag_context=rag_context)

    messages = [{"role": "system", "content": system_prompt}]
    if conversation_history:
        messages.extend(conversation_history[-10:])
    messages.append({"role": "user", "content": message})

    full_response = ""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                GROQ_CHAT_COMPLETIONS_URL,
                headers=_groq_headers(),
                json={
                    "model": settings.GROQ_MODEL,
                    "messages": messages,
                    "stream": True,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_completion_tokens": 1024,
                },
            ) as response:
                if response.status_code >= 400:
                    err_body = await response.aread()
                    logger.error(f"Groq stream error status {response.status_code}: {err_body.decode('utf-8', errors='ignore')}")
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        if line.startswith("data: "):
                            line = line[6:].strip()
                        if line == "[DONE]":
                            break
                        chunk = json.loads(line)
                        token = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        if token:
                            full_response += token
                            yield f"data: {json.dumps({'type': 'token', 'content': token}, ensure_ascii=False)}\n\n"
                    except json.JSONDecodeError:
                        continue

        logger.info(f"STREAM GROQ RESPONSE: {full_response[:200]}")

        # Post-processing: search products + generate suggestions
        recommended_products = []

        # Handle PRICE_PREDICT_JSON if present
        if "PRICE_PREDICT_JSON:" in full_response:
            try:
                json_str = full_response.split("PRICE_PREDICT_JSON:")[1].strip()
                if json_str.startswith("```"):
                    json_str = json_str.strip("`").replace("json", "").strip()
                # Parse only the JSON object
                brace_count = 0
                end_idx = 0
                for i, ch in enumerate(json_str):
                    if ch == '{':
                        brace_count += 1
                    elif ch == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i + 1
                            break
                if end_idx > 0:
                    json_str = json_str[:end_idx]

                price_data = json.loads(json_str)
                category = price_data.get("category", "laptop")
                specs = price_data.get("specs", {})

                result = tech_price_predictor.predict_price(category, specs)
                if result:
                    predicted = result["predicted_price"]
                    low = result["price_range"]["low"]
                    high = result["price_range"]["high"]
                    confidence = result["confidence"]

                    specs_display = ", ".join(f"{k}: {v}" for k, v in specs.items() if v is not None)
                    factors_str = ""
                    for i, f in enumerate(result.get("price_factors", [])[:4], 1):
                        factors_str += f"{i}. {f['feature']} ({f['impact']*100:.0f}%)\n"

                    cat_names = {
                        "laptop": "Laptop", "cpu": "CPU", "ram": "RAM",
                        "gpu": "Card đồ họa", "smartphone": "Điện thoại", "ssd": "Ổ cứng SSD",
                    }
                    new_text = (
                        f"🔍 **Dự đoán giá {cat_names.get(category, category)}:**\n"
                        f"- Thông số: {specs_display}\n\n"
                        f"💰 **Giá dự đoán: {predicted:,}₫**\n"
                        f"📊 Khoảng giá: {low:,}₫ ~ {high:,}₫\n"
                        f"📈 Độ tin cậy: {confidence*100:.0f}%\n\n"
                        f"🔑 **Yếu tố ảnh hưởng giá:**\n{factors_str}\n"
                        f"💻 **Sản phẩm tương tự tại cửa hàng:**\n"
                    )

                    try:
                        db = get_mongo_db()
                        products = list(
                            db["products"].find({
                                "isDeleted": {"$ne": True}, "status": "ACTIVE",
                                "minPrice": {"$gte": int(predicted * 0.7), "$lte": int(predicted * 1.3)},
                            }).sort("createdAt", -1).limit(6)
                        )
                        if products:
                            product_ids = [str(p["_id"]) for p in products]
                            recommended_products = _fetch_product_cards(product_ids)
                            for p in products:
                                price = p.get("minPrice", 0)
                                new_text += f"• {p.get('name', '')} - **{price:,}₫**\n"
                        else:
                            new_text += "Hiện tại chưa tìm thấy sản phẩm tương tự trong cửa hàng."
                    except Exception as e:
                        logger.warning(f"Failed to search similar products: {e}")

                    yield f"data: {json.dumps({'type': 'replace', 'content': new_text}, ensure_ascii=False)}\n\n"
            except Exception as e:
                logger.error(f"Stream price prediction error: {e}")

        # Search products if no prediction products found
        if not recommended_products:
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
            resp_lower = full_response.lower()
            is_product_query = any(kw in msg_lower for kw in product_keywords) or any(kw in resp_lower for kw in product_keywords)

            if is_product_query:
                combined_query = f"{message} {full_response[:200]}"
                recommended_products = search_products_for_chat(combined_query, limit=6)
                if len(recommended_products) < 3:
                    extra = _extract_products_from_response(full_response, limit=6 - len(recommended_products))
                    existing_ids = {p["_id"] for p in recommended_products}
                    for ep in extra:
                        if ep["_id"] not in existing_ids:
                            recommended_products.append(ep)

        suggestions = _generate_suggestions(message, full_response)

        # Final "done" event with metadata
        yield f"data: {json.dumps({'type': 'done', 'suggestions': suggestions, 'products': recommended_products, 'timestamp': datetime.now().isoformat()}, ensure_ascii=False, default=str)}\n\n"

    except httpx.ConnectError:
        logger.error("Cannot connect to Groq (stream). Is the API key valid and the service reachable?")
        yield f"data: {json.dumps({'type': 'error', 'content': 'Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau.'})}\n\n"
    except Exception as e:
        logger.error(f"Groq stream error: {e}")
        yield f"data: {json.dumps({'type': 'error', 'content': 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.'})}\n\n"


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
