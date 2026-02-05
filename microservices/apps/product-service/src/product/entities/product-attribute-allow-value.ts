import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProductAttributeValue } from 'src/product/entities/product-attribute-value';
import { Product } from 'src/product/entities/product.entity';
export type ProductAttributeAllowValueDocument =
  HydratedDocument<ProductAttributeAllowValue>;

@Schema({ timestamps: true })
export class ProductAttributeAllowValue {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: Product.name })
  product: Types.ObjectId; // ID của product

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: ProductAttributeValue.name,
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
