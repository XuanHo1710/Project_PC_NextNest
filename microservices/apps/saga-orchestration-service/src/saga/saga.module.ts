import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { SagaController } from 'src/saga/saga.controller';
import { SagaService } from 'src/saga/saga.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.ORDER_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5673'],
          queue: 'order.main',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'order.retry.exchange',
              'x-dead-letter-routing-key': 'order.retry',
            },
          },
        },
      },
      {
        name: MICROSERVICE.PAYMENT_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5673'],
          queue: 'payment.main',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'payment.retry.exchange',
              'x-dead-letter-routing-key': 'payment.retry',
            },
          },
        },
      },
      {
        name: MICROSERVICE.PRODUCT_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5673'],
          queue: 'product.main',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'product.retry.exchange',
              'x-dead-letter-routing-key': 'product.retry',
            },
          },
        },
      },
      {
        name: MICROSERVICE.NOTIFICATION_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5673'],
          queue: 'notification.main',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'notification.retry.exchange',
              'x-dead-letter-routing-key': 'notification.retry',
            },
          },
        },
      },
      {
        name: MICROSERVICE.CART_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.CART_SERVICE,
        },
      },
    ]),
  ],
  controllers: [SagaController],
  providers: [SagaService],
})
export class SagaModule {}
