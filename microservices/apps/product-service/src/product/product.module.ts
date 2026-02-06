import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
