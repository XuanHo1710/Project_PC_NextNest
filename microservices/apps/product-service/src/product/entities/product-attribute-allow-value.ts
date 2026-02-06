import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type ProductAttributeAllowValueDocument =
  HydratedDocument<ProductAttributeAllowValue>;

@Schema({ timestamps: true })
export class ProductAttributeAllowValue {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Product' })
  product: Types.ObjectId; // ID của product

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'ProductAttributeValue',
  })
  attributeValue: Types.ObjectId; // ID của ProductAttributeValue

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const ProductAttributeAllowValueSchema = SchemaFactory.createForClass(
  ProductAttributeAllowValue,
);
