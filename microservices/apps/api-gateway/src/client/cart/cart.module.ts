import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { MICROSERVICE, getServiceHost, getServicePort } from '@project-pc/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.CART_SERVICE,
        transport: Transport.TCP,
        options: {
          host: getServiceHost(MICROSERVICE.CART_SERVICE),
          port: getServicePort(MICROSERVICE.CART_SERVICE),
        },
      },
    ]),
  ],
  controllers: [CartController],
  providers: [],
})
export class CartModule {}
