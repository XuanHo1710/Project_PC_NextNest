import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { setupOrderRabbitMQ } from 'src/rabbitmq.order.setup';
import { MICROSERVICE_PORT } from '@project-pc/common';
async function bootstrap() {
  await setupOrderRabbitMQ();
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'order.main',
      noAck: false,
      prefetchCount: 10,
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'order.retry.exchange',
          'x-dead-letter-routing-key': 'order.retry',
        },
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: MICROSERVICE_PORT.ORDER_SERVICE,
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
