import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MICROSERVICE_PORT } from '@project-pc/common';

async function bootstrap() {
  const appAuthService =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: MICROSERVICE_PORT.AUTH_SERVICE,
      },
    });

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

  await Promise.all([appAuthService.listen(), redisService.listen()]);
}
bootstrap();
