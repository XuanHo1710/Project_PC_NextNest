import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from 'src/app.module';
import { setupProductRabbitMQ } from 'src/rabbitmq.product.setup';

async function bootstrap() {
  await setupProductRabbitMQ();

  const app = await NestFactory.create(AppModule);

  // RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:admin@localhost:5673'],
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
