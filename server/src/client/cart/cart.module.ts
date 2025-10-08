import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from 'src/client/cart/cart.service';
import { Cart, CartSchema } from 'src/client/cart/entities/cart.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule { }
