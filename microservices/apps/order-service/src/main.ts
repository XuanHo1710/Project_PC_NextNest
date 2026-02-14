import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { setupOrderRabbitMQ } from 'src/rabbitmq.order.setup';
async function bootstrap() {
  await setupOrderRabbitMQ();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:admin@localhost:5673'],
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
    },
  );

  await app.listen();
}
bootstrap();
