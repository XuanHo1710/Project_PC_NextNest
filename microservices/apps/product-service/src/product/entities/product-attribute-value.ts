import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type ProductAttributeValueDocument =
  HydratedDocument<ProductAttributeValue>;

@Schema({ timestamps: true })
export class ProductAttributeValue {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  value: string; // S, M, L, XL, Red, Blue, Green, ...

  @Prop({ type: String, required: true })
  label: string; // Màu xanh, đỏ, tím, Size S, Size M, ...

  //   Lấy thuộc tính nếu cần thì populate
  @Prop({ type: Types.ObjectId, ref: 'ProductAttribute' })
  attribute: Types.ObjectId; // ID của ProductAttribute

  @Prop({ type: String, default: '' })
  colorHex: string; // #FFFFFF, #000000, ... // Dùng nếu attribute là màu sắc

  @Prop({ type: String, default: '' })
  imageUrl: string; // Dùng nếu attribute có hình ảnh đại diện

  @Prop({ type: Types.ObjectId, ref: 'AccountGuest', index: true })
  createdBy: Types.ObjectId; // Owner of this value (per-user isolation)

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const ProductAttributeValueSchema = SchemaFactory.createForClass(
  ProductAttributeValue,
);
