import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;
@Schema({ timestamps: true })
export class Payment {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  paymentCode: number;

  @Prop({ required: true, ref: 'AccountGuest' })
  guest: Types.ObjectId;

  @Prop({ required: true, ref: 'Order' })
  order: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: String,
    enum: ['PENDING', 'PAID', 'UNPAID'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ default: '' })
  transactionId: string; // Mã giao dịch từ cổng thanh toán;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
