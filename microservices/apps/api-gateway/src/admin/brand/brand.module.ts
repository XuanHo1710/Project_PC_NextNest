import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.PRODUCT_SERVICE,
        },
      },
    ]),
  ],
  controllers: [BrandController],
})
export class BrandModule {}
