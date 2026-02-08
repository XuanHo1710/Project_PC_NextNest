import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.CART_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.CART_SERVICE,
        },
      },
    ]),
  ],
  controllers: [CartController],
  providers: [],
})
export class CartModule {}
