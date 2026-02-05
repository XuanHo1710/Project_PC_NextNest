import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const appAuthService =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    });

  const redisService =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.REDIS,
      options: {
        host: 'localhost',
        port: 6379,
        password: '123',
      },
    });

  await Promise.all([appAuthService.listen(), redisService.listen()]);
}
bootstrap();
