import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type ProductReactionDocument = HydratedDocument<ProductReaction>;

@Schema({ timestamps: true })
export class ProductReaction {
  _id: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductComment',
    required: true,
    index: true,
  })
  comment: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountGuest',
    required: true,
  })
  guest: Types.ObjectId;

  // true = like, false = dislike
  @Prop({ type: Boolean, required: true })
  isLike: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProductReactionSchema =
  SchemaFactory.createForClass(ProductReaction);

// Unique constraint: 1 guest chỉ có thể react 1 lần trên 1 comment
ProductReactionSchema.index({ comment: 1, guest: 1 }, { unique: true });
