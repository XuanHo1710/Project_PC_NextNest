import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { CacheInvalidationService } from './cache-invalidation.service';

@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => ({
                store: await redisStore({
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD || undefined,
                    db: parseInt(process.env.REDIS_DB || '0'),
                    ttl: 60 * 60 * 1000, // 1 hour default TTL
                }),
            }),
        }),
    ],
    providers: [CacheInvalidationService],
    exports: [CacheModule, CacheInvalidationService],
})
export class RedisModule { }
