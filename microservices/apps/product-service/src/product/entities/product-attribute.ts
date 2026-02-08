import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
export type ProductAttributeDocument = HydratedDocument<ProductAttribute>;

@Schema({ timestamps: true })
export class ProductAttribute {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string; // Màu sắc, Kích thước, Chất liệu, ...

  @Prop({ index: true })
  code: string; // color, size, material, ...

  @Prop({
    type: String,
    required: true,
    enum: ['COLOR', 'IMAGE', 'BUTTON', 'RADIO'],
  })
  displayType: string; // Cách hiển thị khi tạo giá trị cho thuộc tính

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const ProductAttributeSchema =
  SchemaFactory.createForClass(ProductAttribute);

ProductAttributeSchema.pre('save', async function () {
  if (!this.isModified('name')) return;

  const baseSlug = slugify(this.name, {
    lower: true,
    strict: true,
    locale: 'vi',
  });

  let slug = baseSlug;
  let count = 1;

  const ProductAttributeModel = this.constructor as any;

  while (await ProductAttributeModel.exists({ code: slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.code = slug;
});
