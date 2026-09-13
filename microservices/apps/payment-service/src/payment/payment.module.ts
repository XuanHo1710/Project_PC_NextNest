import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PayosService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/payment/entity/payment.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  MICROSERVICE,
  getServiceHost,
  getServicePort,
  getRabbitMqUrl,
} from '@project-pc/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.NOTIFICATION_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [getRabbitMqUrl()],
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
          urls: [getRabbitMqUrl()],
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
          urls: [getRabbitMqUrl()],
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
          host: getServiceHost(MICROSERVICE.CART_SERVICE),
          port: getServicePort(MICROSERVICE.CART_SERVICE),
        },
      },
    ]),
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [PayosService],
  exports: [PayosService],
})
export class PaymentModule {}