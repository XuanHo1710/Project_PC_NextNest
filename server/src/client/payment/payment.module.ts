import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { VnpayService } from './vnpay.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/client/order/entities/order.entity';
import { Product, ProductSchema } from 'src/admin/product/entities/product.entity';
import { Cart, CartSchema } from 'src/client/cart/entities/cart.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
        MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
        ConfigModule
    ],
    controllers: [PaymentController],
    providers: [VnpayService],
    exports: [VnpayService]
})
export class PaymentModule { }