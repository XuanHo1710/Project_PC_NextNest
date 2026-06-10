import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { setupPaymentRabbitMQ } from 'src/rabbitmq.payment.setup';
import { MICROSERVICE_PORT } from '@project-pc/common';
async function bootstrap() {
  await setupPaymentRabbitMQ();
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'payment.main',
      noAck: false,
      prefetchCount: 10,
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'payment.retry.exchange',
          'x-dead-letter-routing-key': 'payment.retry',
        },
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: MICROSERVICE_PORT.PAYMENT_SERVICE,
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
