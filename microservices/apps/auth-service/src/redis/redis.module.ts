import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { MICROSERVICE } from 'src/contraint';

@Global()
@Module({
  providers: [
    {
      provide: MICROSERVICE.REDIS_SERVICE,
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          db: Number(process.env.REDIS_DB),
          password: process.env.REDIS_PASSWORD,
        });
      },
    },
  ],
  exports: [MICROSERVICE.REDIS_SERVICE],
})
export class RedisModule {}
