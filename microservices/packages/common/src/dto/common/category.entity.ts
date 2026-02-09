import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
export type CategoryDocument = HydratedDocument<Category>;
@Schema({ timestamps: true })
export class Category {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({
    type: Types.ObjectId,
    required: false,
    default: null,
    ref: 'Category',
  })
  parentId: Types.ObjectId;

  @Prop({ unique: true, index: true })
  slug: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.pre('save', async function () {
  if (!this.isModified('name')) return;

  const baseSlug = slugify(this.name, {
    lower: true,
    strict: true,
    locale: 'vi',
  });

  let slug = baseSlug;
  let count = 1;

  const CategoryModel = this.constructor as any;

  while (await CategoryModel.exists({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
});
