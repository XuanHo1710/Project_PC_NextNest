import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';

export type BrandDocument = HydratedDocument<Brand>;
@Schema({ timestamps: true })
export class Brand {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, index: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  logo: string; // URL logo của brand

  @Prop({ default: '' })
  website: string; // Website chính thức của brand

  @Prop({
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  })
  status: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.pre('save', async function () {
  if (!this.isModified('name')) return;

  const baseSlug = slugify(this.name, {
    lower: true,
    strict: true,
    locale: 'vi',
  });

  let slug = baseSlug;
  let count = 1;

  const BrandSchema = this.constructor as any;

  while (await BrandSchema.exists({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
});