import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductCommentDocument = HydratedDocument<ProductComment>;

@Schema({ timestamps: true })
export class ProductComment {
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  })
  product: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'AccountGuest',
    required: true,
  })
  guest: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Number, min: 1, max: 5, default: null })
  rating: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  // Self-referencing for reply (tối đa 2 cấp: comment gốc → reply)
  @Prop({
    type: Types.ObjectId,
    ref: 'ProductComment',
    default: null,
  })
  parentComment: Types.ObjectId;

  // Depth: 0 = comment gốc, 1 = reply (tối đa 2 cấp)
  @Prop({ type: Number, default: 0, max: 1 })
  depth: number;

  @Prop({ type: Boolean, default: false })
  isAdminReply: boolean;

  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Number, default: 0 })
  dislikesCount: number;

  @Prop({ type: Number, default: 0 })
  repliesCount: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const ProductCommentSchema =
  SchemaFactory.createForClass(ProductComment);

// Compound indexes for efficient queries
ProductCommentSchema.index({
  product: 1,
  parentComment: 1,
  isDeleted: 1,
  createdAt: -1,
});
ProductCommentSchema.index({ guest: 1, isDeleted: 1 });
