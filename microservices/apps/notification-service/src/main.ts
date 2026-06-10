import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { setupNotificationRabbitMQ } from 'src/rabbitmq.notification.setup';
import { MICROSERVICE_PORT } from '@project-pc/common';
async function bootstrap() {
  await setupNotificationRabbitMQ();
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'notification.main',
      noAck: false,
      prefetchCount: 10,
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'notification.retry.exchange',
          'x-dead-letter-routing-key': 'notification.retry',
        },
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: MICROSERVICE_PORT.NOTIFICATION_SERVICE,
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
