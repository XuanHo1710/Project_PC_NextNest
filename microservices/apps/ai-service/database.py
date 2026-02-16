"""
Database connections: MongoDB + Qdrant
"""
from pymongo import MongoClient
from qdrant_client import QdrantClient
from config import get_settings

settings = get_settings()

# ============= MongoDB =============
_mongo_client: MongoClient | None = None


def get_mongo_db():
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=30000,
        )
    db_name = settings.MONGODB_URI.rsplit("/", 1)[-1].split("?")[0]
    return _mongo_client[db_name]


# ============= Qdrant =============
_qdrant_client: QdrantClient | None = None


def get_qdrant_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            timeout=30,
            check_compatibility=False,
        )
    return _qdrant_client


def close_connections():
    global _mongo_client, _qdrant_client
    if _mongo_client:
        _mongo_client.close()
        _mongo_client = None
    if _qdrant_client:
        _qdrant_client.close()
        _qdrant_client = None
