import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type ProductViewDocument = HydratedDocument<ProductView>;

@Schema({ timestamps: true })
export class ProductView {
  _id: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  })
  product: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountGuest',
    required: true,
    index: true,
  })
  guest: Types.ObjectId;

  @Prop({ default: 1 })
  viewCount: number;

  @Prop({ type: Date, default: Date.now })
  lastViewedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProductViewSchema = SchemaFactory.createForClass(ProductView);

// Compound unique index: one record per (product, guest)
ProductViewSchema.index({ product: 1, guest: 1 }, { unique: true });
// Index for querying recent views sorted by lastViewedAt
ProductViewSchema.index({ guest: 1, lastViewedAt: -1 });
