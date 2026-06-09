import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

_ENV_FILE = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    # Qdrant
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "products")
    USER_COLLECTION_NAME: str = os.getenv("USER_COLLECTION_NAME", "user_preferences")

    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/catalog")

    # Groq
    GROQ_API_BASE_URL: str = os.getenv(
        "GROQ_API_BASE_URL", "https://api.groq.com/openai/v1"
    )
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "paraphrase-MiniLM-L3-v2")

    # Service
    AI_SERVICE_PORT: int = int(os.getenv("AI_SERVICE_PORT", 8000))

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
