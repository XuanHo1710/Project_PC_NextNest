import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  description: string;

  //   @Prop()
  //   brand: string;

  //   @Prop()
  //   category: string;

  // Mapping variants attributes

  @Prop()
  minPrice: number;

  @Prop()
  maxPrice: number;

  @Prop({
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
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
