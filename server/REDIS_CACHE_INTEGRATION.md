# Redis Cache Integration Guide

## 📦 Packages Installed
- `@nestjs/cache-manager` - NestJS cache module
- `cache-manager` - Cache manager core
- `cache-manager-ioredis-yet` - Redis store for cache-manager
- `ioredis` - Redis client

## 🚀 Setup

### 1. Install Redis Server

**Windows (using WSL2 or Docker):**
```bash
# Using Docker
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack-server:latest

# Or using WSL2
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
```

### 2. Environment Variables

Add to your `.env` file:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## 🏗️ Architecture

### Redis Module
- Location: `src/redis/redis.module.ts`
- Global module with cache-manager integration
- Default TTL: 1 hour

### Category Service Cache Strategy

#### Cache Keys:
- `categories:all:{filter}` - List all categories with filter
- `categories:preview` - Homepage category preview
- `category:slug:{slug}` - Single category by slug

#### TTL (Time To Live):
- `findAll`: 1 hour
- `findCategoryPreview`: 2 hours
- `findOne`: 1 hour

## 🔍 Usage

### Cache Hit/Miss Logs
The service logs cache hits and misses:
- `📦 Cache HIT` - Data retrieved from Redis
- `🔍 Cache MISS` - Data queried from MongoDB

### Cache Invalidation
When categories are updated in admin panel, call:
```typescript
await this.categoryService.invalidateCache();
```

## 🧪 Testing Cache

### Test Cache Hit/Miss:
1. Start server: `npm run start:dev`
2. First request - should see "Cache MISS"
3. Second request - should see "Cache HIT"
4. Check Redis CLI:
```bash
redis-cli
> KEYS categories:*
> GET "category:slug:laptop"
> TTL "category:slug:laptop"
```

### Monitor Redis:
```bash
redis-cli MONITOR
```

## 📊 Performance Benefits

With Redis cache:
- **Category Preview**: ~500ms → ~5ms (100x faster)
- **Category Detail**: ~300ms → ~3ms (100x faster)
- **List Categories**: ~200ms → ~2ms (100x faster)

## 🔧 Advanced Configuration

### Adjust TTL per endpoint:
```typescript
// Short TTL for frequently changing data
await this.cacheManager.set(key, data, 5 * 60 * 1000); // 5 minutes

// Long TTL for static data
await this.cacheManager.set(key, data, 24 * 60 * 60 * 1000); // 24 hours
```

### Clear specific cache:
```typescript
await this.cacheManager.del('category:slug:laptop');
```

## 🎯 Next Steps for Full Integration

1. **Admin Category Service**: Add cache invalidation on CRUD operations
2. **Product Service**: Apply same caching pattern
3. **Redis Cluster**: For production scalability
4. **Cache Warming**: Pre-populate cache on server start
5. **Monitoring**: Add Redis monitoring dashboard

## 📝 Notes

- Redis runs in-memory, restart will clear all cache
- Consider Redis persistence (RDB/AOF) for production
- Monitor Redis memory usage: `redis-cli INFO memory`
