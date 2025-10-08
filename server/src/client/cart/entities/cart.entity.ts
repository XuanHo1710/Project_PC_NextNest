import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guest } from 'src/admin/guest/entities/guest.entity';
import { Product } from 'src/admin/product/entities/product.entity';
export type CartDocument = HydratedDocument<Cart>;
@Schema({ timestamps: true })
export class Cart {
    _id: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Guest.name, required: true })
    guestId: mongoose.Schema.Types.ObjectId

    @Prop({
        type: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: Product.name, required: true },
                quantity: { type: Number, default: 1 },
                subtotal: { type: Number, default: 0 },
                price: { type: Number, default: 0 }
            },
        ], default: []
    })
    cartItems: [
        {
            product: mongoose.Schema.Types.ObjectId,
            quantity: number,
            subtotal: number,
            price: number
        }
    ];

    @Prop({ type: Number, default: 0 })
    total: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
