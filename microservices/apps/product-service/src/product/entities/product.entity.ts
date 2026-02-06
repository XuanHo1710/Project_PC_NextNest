import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { ProductVariant } from 'src/product/entities/product-variant';
export type ProductDocument = HydratedDocument<Product>;
const slugMongo = require('mongoose-slug-generator');
mongoose.plugin(slugMongo);
@Schema({ timestamps: true })
export class Product {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ slugMongo: 'name', unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' })
  brand: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  // Mapping variants attributes

  @Prop({ default: 0 })
  minPrice: number;

  @Prop({ default: 0 })
  maxPrice: number;

  @Prop({
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'STOPSOLD'],
    default: 'ACTIVE',
  })
  status: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'ProductVariant' })
  defaultProductVariantId: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
