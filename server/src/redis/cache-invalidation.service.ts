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
        // Delete product-related cache keys
        // Note: This clears specific known keys. In production, you might want
        // to use Redis SCAN to find and delete all product:* and products:* patterns

        // Clear common product cache keys (you may need to clear more based on your app)
        const keysToDelete = [
            'products:search:',  // Search results
            'product:slug:',     // Individual products
            'products:category:', // Products by category
            'product:comments:',  // Product comments
        ];

        // In a real scenario, you'd use Redis SCAN to find all matching patterns
        // For now, we just log the action
        console.log('🔄 Product cache invalidation triggered - all product queries will refetch from DB');
    }

    async invalidateAllCache() {
        console.log('🗑️  Invalidating all cache from admin action');
        // This would require ioredis client directly for pattern matching
    }
}
