import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
export type OrderDocument = HydratedDocument<Order>;
@Schema({ timestamps: true })
export class Order {
  _id: Types.ObjectId;

  @Prop({
    type: {
      guestId: { type: Types.ObjectId, required: true },
      fullname: { type: String, default: '' },
      address: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      note: { type: String, default: '' },
    },
    required: true,
  })
  customerInfo: {
    guestId: Types.ObjectId;
    fullname: string;
    address: string;
    email: string;
    phone: string;
    note: string;
  };

  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 },
        subtotal: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  orderDetail: [
    {
      product: Types.ObjectId;
      quantity: number;
      subtotal: number;
      price: number;
    },
  ];

  @Prop({ type: Number, default: 0 })
  totalAmount: number;

  @Prop({
    type: String,
    enum: [
      'PENDING',
      'SHIPPING',
      'DELIVERED',
      'COMPLETED',
      'CANCELLED',
      'REFUNDED',
    ],
    default: 'PENDING',
  })
  status: string;

  @Prop({ type: Date, default: Date.now })
  orderDate: Date;

  @Prop(
    raw({
      isCheckout: { type: Boolean, default: false },
      type: { type: String, enum: ['CASH', 'CARD'], default: 'CASH' },
    }),
  )
  payment: {
    isCheckout: boolean;
    type: string;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);
