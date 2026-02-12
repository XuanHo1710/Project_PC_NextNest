import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { OrderController } from 'admin/order/order.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.ORDER_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.ORDER_SERVICE,
        },
      },
      {
        name: MICROSERVICE.PAYMENT_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.PAYMENT_SERVICE,
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [],
})
export class OrderModule {}
