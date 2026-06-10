import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from 'src/app.module';
import { setupProductRabbitMQ } from 'src/rabbitmq.product.setup';
import { MICROSERVICE_PORT } from '@project-pc/common';

async function bootstrap() {
  await setupProductRabbitMQ();

  const app = await NestFactory.create(AppModule);

  // RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'product.main',
      noAck: false,
      prefetchCount: 10,
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'product.retry.exchange',
          'x-dead-letter-routing-key': 'product.retry',
        },
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: MICROSERVICE_PORT.PRODUCT_SERVICE,
    },
  });

  // REDIS
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB),
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
