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
      {
        name: MICROSERVICE.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.PRODUCT_SERVICE,
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
