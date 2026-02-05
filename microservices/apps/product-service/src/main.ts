import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { MICROSERVICE_PORT } from '@project-pc/common';

async function bootstrap() {
  const productService =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.TCP,
      options: {
        port: MICROSERVICE_PORT.PRODUCT_SERVICE,
      },
    });

  console.log('ENV', process.env.REDIS_HOST);
  const redisService =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        db: Number(process.env.REDIS_DB),
      },
    });

  await Promise.all([productService.listen(), redisService.listen()]);
}
bootstrap();
