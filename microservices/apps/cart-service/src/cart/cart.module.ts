import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from 'src/cart/cart.service';
import { Cart, CartSchema } from 'src/cart/entities/cart.entity';
import {
  Brand,
  BrandSchema,
  Category,
  CategorySchema,
  Product,
  ProductSchema,
  ProductVariant,
  ProductVariantSchema,
} from '@project-pc/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Brand.name, schema: BrandSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
