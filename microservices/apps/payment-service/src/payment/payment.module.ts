import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { VnpayService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/payment/entity/payment.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.NOTIFICATION_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@rabbitmq:5672'],
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
        name: MICROSERVICE.PRODUCT_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@rabbitmq:5672'],
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
        name: MICROSERVICE.ORDER_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@rabbitmq:5672'],
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
        name: MICROSERVICE.CART_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.CART_SERVICE_HOST ?? 'cart-service',
          port: MICROSERVICE_PORT.CART_SERVICE,
        },
      },
    ]),
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [VnpayService],
  exports: [VnpayService],
})
export class PaymentModule {}