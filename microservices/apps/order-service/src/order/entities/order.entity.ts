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
        // Snapshot variant data (không ref ObjectId — lưu trực tiếp để tránh stale data)
        variantId: { type: String, default: '' },
        productId: { type: String, default: '' },
        sku: { type: String, default: '' },
        variantPrice: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        images: { type: [String], default: [] },
        combination: { type: Object, default: {} },
        // Product info
        productName: { type: String, default: '' },
        // Order item info
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  orderDetail: Array<{
    variantId: string;
    productId: string;
    sku: string;
    variantPrice: number;
    discount: number;
    images: string[];
    combination: Record<string, string>;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;

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
      'EXPIRED',
      'PENDING_REJECTION',
    ],
    default: 'PENDING',
  })
  status: string;

  @Prop({ type: Date, default: Date.now })
  orderDate: Date;

  @Prop({ type: Date, default: null })
  expireAt: Date;

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

  @Prop({ type: String, default: '' })
  reason: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// === INDEXES for query optimization ===
// Cron job: find PENDING orders with expired expireAt (runs every 5 min)
OrderSchema.index({ status: 1, expireAt: 1 });
// Guest order listing: by guestId + status + sort by createdAt
OrderSchema.index({ 'customerInfo.guestId': 1, status: 1, createdAt: -1 });
// Admin order listing: status filter + sort by createdAt
OrderSchema.index({ status: 1, createdAt: -1 });
// Dashboard stats: paid orders aggregation
OrderSchema.index({ 'payment.isCheckout': 1, status: 1, createdAt: -1 });
// Seller orders: by variantId/productId in orderDetail
OrderSchema.index({ 'orderDetail.variantId': 1, status: 1 });
OrderSchema.index({ 'orderDetail.productId': 1, status: 1 });
// Online payment queries
OrderSchema.index({ 'payment.type': 1, status: 1 });
