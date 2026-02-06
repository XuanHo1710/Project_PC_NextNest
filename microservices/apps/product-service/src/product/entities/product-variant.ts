import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Product } from 'src/product/entities/product.entity';
export type ProductVariantDocument = HydratedDocument<ProductVariant>;

@Schema({ timestamps: true })
export class ProductVariant {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  sku: string;

  @Prop({ type: String, default: '' })
  subDescription: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name })
  product: Types.ObjectId;

  @Prop()
  price: number;

  @Prop({ default: 0 })
  discount: number; // 0 -> 100%

  @Prop()
  combination: {
    [key: string]: string;
  }; // { color: 'red', size: 'M' }

  @Prop({ type: [String], default: [] })
  images: string[]; // Danh sách ảnh đại diện cho biến thể sản phẩm

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);
