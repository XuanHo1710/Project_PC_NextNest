"""Debug script to check why Qdrant indexing shows 0 products"""
from database import get_mongo_db, get_qdrant_client
from config import get_settings

settings = get_settings()
db = get_mongo_db()

print("=== MongoDB Collections ===")
print(db.list_collection_names())

print("\n=== Product Status Distribution ===")
total = db["products"].count_documents({})
active = db["products"].count_documents({"status": "ACTIVE", "isDeleted": {"$ne": True}})
pending = db["products"].count_documents({"status": "PENDING"})
inactive = db["products"].count_documents({"status": "INACTIVE"})
print(f"Total: {total}, Active: {active}, Pending: {pending}, Inactive: {inactive}")

pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
for s in db["products"].aggregate(pipeline):
    print(f"  {s['_id']}: {s['count']}")

# Sample product
sample = db["products"].find_one({"status": "ACTIVE", "isDeleted": {"$ne": True}})
if sample:
    print(f"\nSample ACTIVE: {sample.get('name')}")
else:
    sample = db["products"].find_one()
    if sample:
        print(f"\nSample ANY: name={sample.get('name')}, status={sample.get('status')}, isDeleted={sample.get('isDeleted')}")

# Variant count
var_count = db["productvariants"].count_documents({"isDeleted": {"$ne": True}})
print(f"\nVariants: {var_count}")

# Qdrant status
print("\n=== Qdrant Status ===")
try:
    client = get_qdrant_client()
    for c in client.get_collections().collections:
        info = client.get_collection(c.name)
        print(f"  {c.name}: {info.points_count} points, dim={info.config.params.vectors.size}")
except Exception as e:
    print(f"  Error: {e}")
