import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Order, OrderSchema } from 'src/order/entities/order.entity';
import { OrderController } from 'src/order/order.controller';
import { OrderService } from 'src/order/order.service';
import {
  MICROSERVICE,
  MICROSERVICE_PORT,
  ProductVariant,
  ProductVariantSchema,
} from '@project-pc/common';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
    ClientsModule.register([
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
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
