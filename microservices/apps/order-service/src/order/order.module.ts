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
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.PAYMENT_SERVICE,
        },
      },
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
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
