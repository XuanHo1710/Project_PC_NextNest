# 🚀 Redis Cache Integration - Quick Start Guide

## ✅ What Has Been Done

### 1. **Packages Installed**
```bash
npm install @nestjs/cache-manager cache-manager cache-manager-ioredis-yet ioredis
```

### 2. **Files Created/Modified**

#### New Files:
- `src/redis/redis.module.ts` - Global Redis cache module
- `src/redis/cache-invalidation.service.ts` - Cache invalidation service
- `REDIS_CACHE_INTEGRATION.md` - Full documentation
- `test-redis-cache.js` - Performance test script

#### Modified Files:
- `src/app.module.ts` - Added RedisModule import
- `src/client/category/category.service.ts` - Added cache layer
- `src/admin/category/category.service.ts` - Added cache invalidation

### 3. **Cache Strategy Implemented**

#### Client Category Service (Read Operations):
- ✅ `findAll()` - Cache with dynamic key based on filters (1 hour TTL)
- ✅ `findCategoryPreview()` - Cache for homepage (2 hours TTL)
- ✅ `findOne()` - Cache by slug (1 hour TTL)

#### Admin Category Service (Write Operations):
- ✅ `create()` - Invalidates cache after creation
- ✅ `update()` - Invalidates cache after update
- ✅ `remove()` - Invalidates cache after deletion
- ✅ `updateMany()` - Invalidates cache after bulk operations

## 🏃 Quick Start

### Step 1: Start Redis Server

**Option A - Docker (Recommended):**
```powershell
docker run -d --name redis-cache -p 6379:6379 redis:latest
```

**Option B - Windows WSL2:**
```bash
wsl
sudo service redis-server start
```

**Verify Redis is running:**
```powershell
docker ps
# or
redis-cli ping
# Should return: PONG
```

### Step 2: Add Environment Variables

Create/update `.env` file in server directory:
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Step 3: Start Server
```powershell
cd server
npm run start:dev
```

**Watch for Redis connection logs:**
```
[Nest] INFO [RedisModule] Redis cache connected to localhost:6379
```

### Step 4: Test Cache Performance

**Run test script:**
```powershell
node test-redis-cache.js
```

**Expected output:**
```
🧪 Testing Redis Cache Performance
============================================================

📋 Test 1: Category Preview - First Request (Cache MISS)
   ⏱️  Time: 450ms
   📊 Categories: 5

📋 Test 2: Category Preview - Second Request (Cache HIT)
   ⏱️  Time: 8ms
   📊 Categories: 5
   🚀 Speed Improvement: 98.2%
```

## 🔍 How to Verify Cache is Working

### Method 1: Check Server Logs
Look for these emojis in terminal:
- `📦 Cache HIT` - Data served from Redis
- `🔍 Cache MISS` - Data fetched from MongoDB
- `🗑️  Invalidating cache` - Cache cleared after admin action

### Method 2: Monitor Redis
```powershell
# Open new terminal
redis-cli MONITOR
```
Then make API requests and watch Redis operations in real-time

### Method 3: Check Cache Keys
```powershell
redis-cli
> KEYS categories:*
1) "categories:preview"
2) "category:slug:laptop"
3) "categories:all:{...}"

> GET "categories:preview"
> TTL "categories:preview"  # Shows remaining time in seconds
```

## 📊 Performance Metrics

Expected improvements with cache:

| Endpoint | Without Cache | With Cache | Improvement |
|----------|--------------|------------|-------------|
| `/category/preview` | ~500ms | ~5ms | **100x faster** |
| `/category/:slug` | ~300ms | ~3ms | **100x faster** |
| `/category` | ~200ms | ~2ms | **100x faster** |

## 🧪 Manual Testing Steps

### Test 1: Category Preview Cache
```powershell
# First request (Cache MISS)
curl http://localhost:8080/api/v1/category/preview

# Second request (Cache HIT - should be much faster)
curl http://localhost:8080/api/v1/category/preview
```

### Test 2: Cache Invalidation
1. Get category preview (should cache)
2. Update a category in admin panel
3. Get category preview again (should invalidate and re-cache)

```powershell
# 1. Get preview - creates cache
curl http://localhost:8080/api/v1/category/preview

# 2. Update category (admin endpoint - need auth)
curl -X PATCH http://localhost:8080/api/v1/admin/category/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# 3. Get preview again - cache invalidated, fetches fresh data
curl http://localhost:8080/api/v1/category/preview
```

## 🐛 Troubleshooting

### Problem: "ECONNREFUSED 127.0.0.1:6379"
**Solution:** Redis is not running
```powershell
# Check if Redis container is running
docker ps

# Start Redis if not running
docker start redis-cache

# Or create new Redis container
docker run -d --name redis-cache -p 6379:6379 redis:latest
```

### Problem: Cache not invalidating after admin update
**Solution:** Check logs for cache invalidation messages
```
🗑️  Invalidating category cache from admin action
```

### Problem: Cache hit but data seems stale
**Solution:** Manually clear Redis cache
```powershell
redis-cli FLUSHDB
```

## 🎯 Next Steps

1. **Apply to Product Service:**
   - Cache product listings
   - Cache product details
   - Cache search results

2. **Advanced Caching:**
   - Implement cache warming on server start
   - Add Redis pattern-based invalidation
   - Setup Redis Sentinel for high availability

3. **Monitoring:**
   - Add cache hit/miss metrics
   - Setup Redis monitoring dashboard
   - Track cache performance

4. **Production:**
   - Configure Redis persistence (AOF/RDB)
   - Setup Redis password authentication
   - Use Redis Cluster for scaling

## 📖 Documentation

For detailed information, see:
- `REDIS_CACHE_INTEGRATION.md` - Complete integration guide
- `src/redis/redis.module.ts` - Redis configuration
- `src/client/category/category.service.ts` - Cache implementation example

## 🎉 Success Indicators

✅ Redis server running on port 6379
✅ Server starts without Redis connection errors
✅ First API call shows "Cache MISS" in logs
✅ Second API call shows "Cache HIT" in logs
✅ Response time dramatically faster on cache hits
✅ Admin updates trigger cache invalidation

---

**Need Help?** Check the detailed documentation in `REDIS_CACHE_INTEGRATION.md`
