import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { setupPaymentRabbitMQ } from 'src/rabbitmq.payment.setup';
import {
  MICROSERVICE,
  getServicePort,
  getRabbitMqUrl,
} from '@project-pc/common';

const PAYMENT_HTTP_PORT = Number(process.env.PAYMENT_HTTP_PORT) || 3011;

async function bootstrap() {
  await setupPaymentRabbitMQ();
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [getRabbitMqUrl()],
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
      port: getServicePort(MICROSERVICE.PAYMENT_SERVICE),
    },
  });

  await app.startAllMicroservices();

  // HTTP server cho PayOS webhook callback (POST /payment/payos-webhook)
  await app.listen(PAYMENT_HTTP_PORT);
}
bootstrap();
