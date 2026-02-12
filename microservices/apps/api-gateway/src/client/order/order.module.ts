import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { OrderController } from 'client/order/order.controller';

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
        name: MICROSERVICE.SAGA_ORCHESTRATOR_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.SAGA_ORCHESTRATOR_SERVICE,
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [],
})
export class OrderModule {}
