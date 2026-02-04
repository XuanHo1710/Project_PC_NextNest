import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PaymentTransactionDocument = HydratedDocument<PaymentTransaction>;

@Schema({ timestamps: true })
export class PaymentTransaction {
  @Prop({ required: true, unique: true })
  transactionId: string; // Transaction ID từ payment gateway

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuestOrder',
    required: true,
  })
  orderId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true })
  guestId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ['VNPAY', 'MOMO', 'COD'], required: true })
  paymentMethod: string;

  @Prop({
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING',
  })
  status: string;

  // VNPay specific fields
  @Prop()
  vnpayInfo?: {
    vnp_TmnCode: string;
    vnp_TransactionNo: string;
    vnp_BankCode: string;
    vnp_BankTranNo: string;
    vnp_CardType: string;
    vnp_PayDate: string;
    vnp_ResponseCode: string;
    vnp_TransactionStatus: string;
    vnp_SecureHash: string;
  };

  // Momo specific fields (nếu có)
  @Prop()
  momoInfo?: {
    partnerCode: string;
    requestId: string;
    orderId: string;
    transId: string;
    resultCode: number;
    message: string;
    responseTime: string;
    extraData: string;
    signature: string;
  };

  @Prop()
  processedAt?: Date;

  @Prop()
  failureReason?: string;

  // Refund information
  @Prop()
  refundInfo?: {
    refundId: string;
    refundAmount: number;
    refundDate: Date;
    refundReason: string;
    refundStatus: string;
  };

  // Webhook logs
  @Prop([
    {
      timestamp: { type: Date, default: Date.now },
      requestBody: { type: mongoose.Schema.Types.Mixed },
      responseCode: { type: Number },
      processed: { type: Boolean, default: false },
    },
  ])
  webhookLogs: Array<{
    timestamp: Date;
    requestBody: any;
    responseCode: number;
    processed: boolean;
  }>;
}

export const PaymentTransactionSchema =
  SchemaFactory.createForClass(PaymentTransaction);

// Index để tối ưu query
PaymentTransactionSchema.index({ transactionId: 1 });
PaymentTransactionSchema.index({ orderId: 1 });
PaymentTransactionSchema.index({ guestId: 1, createdAt: -1 });
PaymentTransactionSchema.index({ status: 1, createdAt: -1 });
