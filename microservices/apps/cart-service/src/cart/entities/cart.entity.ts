import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;
@Schema({ timestamps: true })
export class Cart {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Guest', required: true })
  guestId: Types.ObjectId;

  @Prop({
    type: [
      {
        product: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, default: 1 },
        subtotal: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  cartItems: [
    {
      product: Types.ObjectId;
      quantity: number;
      subtotal: number;
      price: number;
    },
  ];

  @Prop({ type: Number, default: 0 })
  total: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
