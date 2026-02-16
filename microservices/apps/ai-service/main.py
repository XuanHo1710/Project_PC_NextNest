"""
AI Service — FastAPI application
Provides:
  - POST /api/v1/ai/chat/message         → AI chat (Ollama llama3.2)
  - GET  /api/v1/ai/chat/suggestions      → Quick suggestions
  - GET  /api/v1/ai/recommendations/{guestId} → Personalized product recommendations
  - POST /api/v1/ai/reindex               → Reindex products to Qdrant
  - GET  /api/v1/ai/health                → Health check
"""
import logging
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
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

    # Warm up embedding (first call downloads & caches in Ollama)
    try:
        from embedding import generate_embedding
        generate_embedding("startup warmup")
        logger.info("Embedding model warmed up via Ollama")
    except Exception as e:
        logger.warning(f"Failed to warm up embedding model: {e}")

    # Ensure Qdrant collection exists
    try:
        from product_index import ensure_collection
        ensure_collection()
    except Exception as e:
        logger.warning(f"Failed to ensure Qdrant collection: {e}")

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


class ReindexResponse(BaseModel):
    message: str
    count: int


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
        from chat import chat_with_ollama

        result = await chat_with_ollama(
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
    limit: int = Query(20, ge=1, le=50, description="Number of recommendations"),
):
    """Get personalized product recommendations for a guest based on viewing behavior.
    Returns list of IProductCard-compatible dicts with real MongoDB _id, sku, etc."""
    from recommendation import get_recommendations

    try:
        results = get_recommendations(guest_id, limit=limit)
        return results
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        return []


@app.get("/api/v1/ai/popular")
async def get_popular_products_endpoint(
    limit: int = Query(20, ge=1, le=50),
):
    """Get popular products (fallback when no user context).
    Returns list of IProductCard-compatible dicts."""
    from recommendation import get_popular_products

    try:
        results = get_popular_products(limit=limit)
        return results
    except Exception as e:
        logger.error(f"Popular products error: {e}")
        return []


@app.post("/api/v1/ai/reindex", response_model=ReindexResponse)
async def reindex_products():
    """Reindex all products from MongoDB to Qdrant vector DB."""
    from product_index import index_all_products
    from chat import refresh_catalog_context

    try:
        result = index_all_products()
        refresh_catalog_context()  # Also refresh the chat catalog context
        return ReindexResponse(**result)
    except Exception as e:
        logger.error(f"Reindex error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= Main =============
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.AI_SERVICE_PORT,
        reload=True,
        log_level="info",
    )
