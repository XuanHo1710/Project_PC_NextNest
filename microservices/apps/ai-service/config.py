from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Qdrant
    QDRANT_URL: str = "https://07837276-e6de-42b8-8c72-96680944c9b3.us-east4-0.gcp.cloud.qdrant.io:6333"
    QDRANT_API_KEY: str = ""
    COLLECTION_NAME: str = "products"
    USER_COLLECTION_NAME: str = "user_preferences"

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/project-pc"

    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    EMBEDDING_MODEL: str = "paraphrase-MiniLM-L3-v2"

    # Service
    AI_SERVICE_PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
