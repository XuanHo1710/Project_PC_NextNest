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
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.NOTIFICATION_SERVICE,
        },
      },
      {
        name: MICROSERVICE.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.PRODUCT_SERVICE,
        },
      },
      {
        name: MICROSERVICE.ORDER_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.ORDER_SERVICE,
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
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [VnpayService],
  exports: [VnpayService],
})
export class PaymentModule {}
