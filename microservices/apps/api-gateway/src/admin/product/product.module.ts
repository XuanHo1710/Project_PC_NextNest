import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import {
  ProductController,
  ProductVariantController,
  ProductAttributeController,
  ProductAttributeValueController,
  ProductAttributeAllowValueController,
} from 'admin/product/product.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.PRODUCT_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@rabbitmq:5672'],
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
    ]),
  ],
  controllers: [
    ProductController,
    ProductVariantController,
    ProductAttributeController,
    ProductAttributeValueController,
    ProductAttributeAllowValueController,
  ],
  providers: [],
})
export class ProductModule {}