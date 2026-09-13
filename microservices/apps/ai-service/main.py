"""
AI Service — FastAPI application
Provides:
  - POST /api/v1/ai/chat/message         → AI chat (Groq llama-3.1-8b-instant)
  - GET  /api/v1/ai/chat/suggestions      → Quick suggestions
  - GET  /api/v1/ai/recommendations/{guestId} → Personalized product recommendations
  - POST /api/v1/ai/reindex               → Reindex products to Qdrant
  - GET  /api/v1/ai/health                → Health check
"""
import asyncio
import logging
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import get_settings
from database import close_connections

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("ai-service")


# ============= Lifespan =============
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AI Service starting up...")

    # Warm up embedding (first call downloads & caches)
    try:
        from embedding import generate_embedding
        generate_embedding("startup warmup")
        logger.info("Embedding model warmed up")
    except Exception as e:
        logger.warning(f"Failed to warm up embedding model: {e}")

    # Ensure Qdrant collection exists + sync embeddings if empty (non-blocking)
    try:
        from product_index import ensure_collection, index_all_products
        from database import get_qdrant_client
        from config import get_settings
        from recommendation import _ensure_user_collection
        import threading

        _settings = get_settings()
        ensure_collection()

        # Also ensure user_preferences collection has correct dimension
        try:
            _ensure_user_collection()
        except Exception as ue:
            logger.warning(f"Failed to ensure user_preferences collection: {ue}")

        # Check if products collection has any points, if empty → auto-index in background
        client = get_qdrant_client()
        point_count = 0
        try:
            collection_info = client.get_collection(collection_name=_settings.COLLECTION_NAME)
            point_count = collection_info.points_count or 0
            logger.info(f"Qdrant '{_settings.COLLECTION_NAME}' has {point_count} points")
        except Exception as get_coll_err:
            logger.warning(f"Failed to check Qdrant points count: {get_coll_err}. Proceeding with point_count=0 to ensure indexing.")

        if point_count == 0:
            def _background_index():
                try:
                    logger.info("Background indexing started...")
                    result = index_all_products()
                    logger.info(f"Background indexing complete: {result}")
                except Exception as ex:
                    logger.error(f"Background indexing failed: {ex}")

            thread = threading.Thread(target=_background_index, daemon=True)
            thread.start()
            logger.info("Initial indexing launched in background thread")
        else:
            logger.info(f"Embeddings already exist ({point_count} points), skipping initial indexing")
    except Exception as e:
        logger.warning(f"Failed startup embedding sync: {e}")
        logger.warning("Product vector search may be unavailable until Qdrant is fixed.")

    yield

    # Cleanup
    close_connections()
    logger.info("AI Service shut down")


# ============= App =============
app = FastAPI(
    title="Arisu AI Service",
    description="AI-powered recommendations and chat for Arisu Store",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============= Request/Response Models =============
class ChatMessageRequest(BaseModel):
    message: str
    userId: str | None = None
    history: list[dict] | None = None


class ChatMessageResponse(BaseModel):
    text: str
    timestamp: str
    suggestions: list[str] = []
    products: list[dict] = []


class ReindexResponse(BaseModel):
    message: str
    count: int


class IndexProductRequest(BaseModel):
    productId: str


class IndexProductResponse(BaseModel):
    message: str
    indexed: bool = False


class PricePredictRequest(BaseModel):
    category: str  # laptop, smartphone
    specs: dict    # Product specifications matching Colab training features


class PricePredictResponse(BaseModel):
    predicted_price: int
    price_range: dict
    confidence: float
    currency: str = "VND"
    category: str
    price_factors: list[dict] = []
    similar_products: list[dict] = []


# ============= Endpoints =============

@app.get("/api/v1/ai/health")
async def health_check():
    return {"status": "ok", "service": "ai-service"}


@app.post("/api/v1/ai/chat/message", response_model=ChatMessageResponse)
async def chat_message(request: ChatMessageRequest):
    """Send a message to the AI chatbot and get a response."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    try:
        from chat import chat_with_groq

        result = await chat_with_groq(
            message=request.message.strip(),
            conversation_history=request.history,
        )

        return ChatMessageResponse(**result)
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        from datetime import datetime

        return ChatMessageResponse(
            text="Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau.",
            timestamp=datetime.now().isoformat(),
            suggestions=["Xem sản phẩm mới", "Liên hệ hỗ trợ"],
        )


@app.post("/api/v1/ai/chat/stream")
async def chat_message_stream(request: ChatMessageRequest):
    """Stream AI chat response via SSE (Server-Sent Events). Tokens arrive in real-time."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    from chat import chat_with_groq_stream

    return StreamingResponse(
        chat_with_groq_stream(
            message=request.message.strip(),
            conversation_history=request.history,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/v1/ai/chat/suggestions")
async def chat_suggestions(query: str = Query("", description="Current query for context")):
    """Get quick suggestion chips for the chatbot."""
    suggestions = [
        "Sản phẩm PC Gaming mới nhất",
        "Laptop cho sinh viên",
        "Khuyến mãi hiện tại",
        "Chính sách bảo hành",
        "So sánh cấu hình",
    ]
    return suggestions


@app.get("/api/v1/ai/recommendations/{guest_id}")
async def get_recommendations_endpoint(
    guest_id: str,
    limit: int = Query(16, ge=1, le=50, description="Number of recommendations"),
):
    """Get personalized product recommendations for a guest based on viewing behavior.
    Returns list of IProductCard-compatible dicts with real MongoDB _id, sku, etc."""
    from recommendation import get_recommendations

    try:
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(None, lambda: get_recommendations(guest_id, limit=limit))
        return results
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        return []


@app.get("/api/v1/ai/popular")
async def get_popular_products_endpoint(
    limit: int = Query(8, ge=1, le=50),
):
    """Get popular products (fallback when no user context).
    Returns list of IProductCard-compatible dicts."""
    from recommendation import get_popular_products

    try:
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(None, lambda: get_popular_products(limit=limit))
        return results
    except Exception as e:
        logger.error(f"Popular products error: {e}")
        return []


@app.post("/api/v1/ai/index-product", response_model=IndexProductResponse)
async def index_single_product_endpoint(request: IndexProductRequest):
    """Index or re-index a single product in Qdrant vector DB."""
    from product_index import index_single_product

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, lambda: index_single_product(request.productId)
        )
        from chat import refresh_catalog_context
        await loop.run_in_executor(None, refresh_catalog_context)
        return IndexProductResponse(**result)
    except Exception as e:
        logger.error(f"Index product error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/v1/ai/index-product/{product_id}")
async def delete_product_index_endpoint(product_id: str):
    """Remove a product from the Qdrant index."""
    from product_index import delete_product_from_index

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, lambda: delete_product_from_index(product_id)
        )
        from chat import refresh_catalog_context
        await loop.run_in_executor(None, refresh_catalog_context)
        return result
    except Exception as e:
        logger.error(f"Delete product index error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ai/reindex", response_model=ReindexResponse)
async def reindex_products():
    """Reindex all products from MongoDB to Qdrant vector DB."""
    from product_index import index_all_products
    from chat import refresh_catalog_context

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, index_all_products)
        await loop.run_in_executor(
            None, refresh_catalog_context
        )  # Also refresh the chat catalog context
        return ReindexResponse(**result)
    except Exception as e:
        logger.error(f"Reindex error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= Price Prediction Endpoints =============

@app.post("/api/v1/ai/predict-price", response_model=PricePredictResponse)
async def predict_price_endpoint(request: PricePredictRequest):
    """Predict price for a tech product based on its specifications.
    Supported categories: laptop, cpu, ram, gpu, smartphone, ssd."""
    from price_predictor import tech_price_predictor

    if request.category not in tech_price_predictor.supported_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported category: {request.category}. "
                   f"Supported: {tech_price_predictor.supported_categories}",
        )

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, lambda: tech_price_predictor.predict_price(request.category, request.specs)
        )
        if result is None:
            raise HTTPException(status_code=500, detail="Price prediction failed. Models may not be trained yet.")

        # Find similar products near predicted price
        similar = []
        try:
            from recommendation import _fetch_product_cards
            from database import get_mongo_db

            def _fetch_similar(price: float):
                # Blocking pymongo calls — executed on the default thread pool
                db = get_mongo_db()
                products = list(
                    db["products"].find({
                        "isDeleted": {"$ne": True}, "status": "ACTIVE",
                        "minPrice": {"$gte": int(price * 0.7), "$lte": int(price * 1.3)},
                    }).sort("createdAt", -1).limit(6)
                )
                if not products:
                    return []
                return _fetch_product_cards([str(p["_id"]) for p in products])

            loop = asyncio.get_event_loop()
            price = result["predicted_price"]
            similar = await loop.run_in_executor(None, lambda: _fetch_similar(price))
        except Exception as e:
            logger.warning(f"Failed to fetch similar products: {e}")

        result["similar_products"] = similar
        return PricePredictResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Price prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/ai/supported-categories")
async def get_supported_categories():
    """List all supported product categories for price prediction."""
    from price_predictor import tech_price_predictor
    categories = []
    for cat in tech_price_predictor.supported_categories:
        info = tech_price_predictor.get_category_info(cat)
        categories.append({
            "category": cat,
            "features": info["features"] if info else {},
            "metrics": info.get("metrics", {}) if info else {},
        })
    return categories


@app.get("/api/v1/ai/price-factors/{category}")
async def get_price_factors(category: str):
    """Get feature importance and available options for a category."""
    from price_predictor import tech_price_predictor
    info = tech_price_predictor.get_category_info(category)
    if info is None:
        raise HTTPException(status_code=404, detail=f"Category not found: {category}")
    return info


# ============= Main =============
if __name__ == "__main__":
    import os
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.AI_SERVICE_PORT,
        reload=os.environ.get("AI_DEV") == "1",
        log_level="info",
    )
