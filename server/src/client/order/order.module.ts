import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/admin/product/entities/product.entity';
import { Cart, CartSchema } from 'src/client/cart/entities/cart.entity';
import { Order, OrderSchema } from 'src/client/order/entities/order.entity';
import { OrderController } from 'src/client/order/order.controller';
import { OrderService } from 'src/client/order/order.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
