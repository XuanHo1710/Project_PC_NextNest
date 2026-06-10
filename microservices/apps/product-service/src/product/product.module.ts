import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './entities/product.entity';
import {
  ProductVariant,
  ProductVariantSchema,
} from './entities/product-variant';
import {
  ProductAttribute,
  ProductAttributeSchema,
} from './entities/product-attribute';
import {
  ProductAttributeValue,
  ProductAttributeValueSchema,
} from './entities/product-attribute-value';
import {
  ProductAttributeAllowValue,
  ProductAttributeAllowValueSchema,
} from './entities/product-attribute-allow-value';
import { ProductView, ProductViewSchema } from './entities/product-view.entity';
import { Category, CategorySchema } from '../category/entities/category.entity';
import { Brand, BrandSchema } from '../brand/entities/brand.entity';
import { AccountGuest, AccountGuestSchema } from '@project-pc/common';
import { MICROSERVICE } from '@project-pc/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: ProductAttribute.name, schema: ProductAttributeSchema },
      { name: ProductAttributeValue.name, schema: ProductAttributeValueSchema },
      {
        name: ProductAttributeAllowValue.name,
        schema: ProductAttributeAllowValueSchema,
      },
      { name: Category.name, schema: CategorySchema },
      { name: Brand.name, schema: BrandSchema },
      { name: AccountGuest.name, schema: AccountGuestSchema },
      { name: ProductView.name, schema: ProductViewSchema },
    ]),
    ClientsModule.register([
      {
        name: MICROSERVICE.ELASTICSEARCH_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@rabbitmq:5672'],
          queue: 'elasticsearch.main',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}