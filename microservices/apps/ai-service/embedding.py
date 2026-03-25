"""
Embedding service: uses SentenceTransformer to generate text embeddings.
Default model: all-MiniLM-L6-v2 (384-dim, ~80MB, fast).
Distance: Cosine.

Model is loaded once at module level and reused across all calls.
"""
import logging
from sentence_transformers import SentenceTransformer
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Model dimension mapping
_MODEL_DIMENSIONS = {
    "all-MiniLM-L6-v2": 384,
    "all-MiniLM-L12-v2": 384,
    "paraphrase-MiniLM-L6-v2": 384,
    "BAAI/bge-m3": 1024,
    "BAAI/bge-small-en-v1.5": 384,
}

EMBEDDING_DIMENSION = _MODEL_DIMENSIONS.get(settings.EMBEDDING_MODEL, 384)

# Load model once (downloads & caches on first run)
logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL} (dim={EMBEDDING_DIMENSION}) ...")
_model = SentenceTransformer(settings.EMBEDDING_MODEL)
logger.info("Embedding model loaded successfully.")


def generate_embedding(text: str) -> list[float]:
    """Generate embedding vector for a single text string."""
    embedding = _model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embedding vectors for a batch of text strings."""
    if not texts:
        return []

    embeddings = _model.encode(texts, batch_size=64, normalize_embeddings=True)
    return embeddings.tolist()


def get_embedding_dimension() -> int:
    """Return the dimensionality of the embedding model."""
    return EMBEDDING_DIMENSION
