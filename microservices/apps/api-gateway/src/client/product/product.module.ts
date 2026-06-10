import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { ProductAttributeAllowValueController } from 'client/product/product-attribute-allow-value.controller';
import { ProductVariantController } from 'client/product/product-variant.controller';
import { ProductAttributeController } from 'client/product/product-attribute.controller';
import { ProductAttributeValueController } from 'client/product/product-attribute-value.controller';

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
    ProductAttributeAllowValueController,
    ProductAttributeValueController,
    ProductAttributeController,
    ProductVariantController,
  ],
})
export class ProductModule {}