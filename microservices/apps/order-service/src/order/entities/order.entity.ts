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
        productVariant: {
          type: Types.ObjectId,
          ref: 'ProductVariant',
          required: true,
        },
        productName: { type: String, default: '' },
        combination: { type: Object, default: {} },
        quantity: { type: Number, default: 1 },
        subtotal: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  orderDetail: [
    {
      productVariant: Types.ObjectId;
      productName: string;
      combination: Record<string, string>;
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
      type: { type: String, enum: ['COD', 'CARD'], default: 'COD' },
    }),
  )
  payment: {
    isCheckout: boolean;
    type: string;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);
