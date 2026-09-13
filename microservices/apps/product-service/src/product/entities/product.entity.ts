import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
export type ProductDocument = HydratedDocument<Product>;
@Schema({ timestamps: true })
export class Product {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ unique: true, index: true })
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' })
  defaultProductVariantId: Types.ObjectId;

  @Prop({ default: 0 })
  totalRatings: number;

  @Prop({ default: 0 })
  avgRating: number;

  @Prop({ default: 0 })
  totalStock: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AccountGuest' })
  createdBy: Types.ObjectId;

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

ProductSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
ProductSchema.index({ category: 1, isDeleted: 1, status: 1 });
ProductSchema.index({ brand: 1, isDeleted: 1, status: 1 });
ProductSchema.index({ createdBy: 1, isDeleted: 1 });

ProductSchema.pre('save', async function () {
  if (!this.isModified('name')) return;

  const baseSlug = slugify(this.name, {
    lower: true,
    strict: true,
    locale: 'vi',
  });

  let slug = baseSlug;
  let count = 1;

  const ProductSchema = this.constructor as any;

  while (await ProductSchema.exists({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
});
