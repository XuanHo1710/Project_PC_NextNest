import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheInvalidationService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async invalidateCategoryCache() {
        console.log('🗑️  Invalidating category cache from admin action');
        // Delete all category-related cache keys
        await this.cacheManager.del('categories:preview');

        // Note: In production, you might want to track all dynamic keys
        // or use Redis SCAN to find and delete all matching patterns
    }

    async invalidateProductCache() {
        console.log('🗑️  Invalidating product cache from admin action');
        // Add product cache invalidation logic here
    }

    async invalidateAllCache() {
        console.log('🗑️  Invalidating all cache from admin action');
        // This would require ioredis client directly for pattern matching
    }
}
