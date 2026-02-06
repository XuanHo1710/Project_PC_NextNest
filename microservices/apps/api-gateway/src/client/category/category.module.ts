import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { CategoryController } from './category.controller';

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
  controllers: [CategoryController],
  providers: [],
})
export class CategoryModule { }
