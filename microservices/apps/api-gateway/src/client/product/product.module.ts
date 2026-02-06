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
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.PRODUCT_SERVICE,
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
  providers: [],
})
export class ProductModule {}
