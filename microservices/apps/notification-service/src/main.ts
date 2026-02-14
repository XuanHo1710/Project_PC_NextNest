import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { setupNotificationRabbitMQ } from 'src/rabbitmq.notification.setup';
async function bootstrap() {
  await setupNotificationRabbitMQ();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:admin@localhost:5673'],
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
    },
  );

  await app.listen();
}
bootstrap();
