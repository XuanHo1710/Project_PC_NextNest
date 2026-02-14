import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { setupPaymentRabbitMQ } from 'src/rabbitmq.payment.setup';
async function bootstrap() {
  await setupPaymentRabbitMQ();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:admin@localhost:5673'],
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
    },
  );

  await app.listen();
}
bootstrap();
