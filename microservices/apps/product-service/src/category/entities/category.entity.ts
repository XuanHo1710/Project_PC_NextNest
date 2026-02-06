import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
export type CategoryDocument = HydratedDocument<Category>;
const slugMongo = require('mongoose-slug-generator');
mongoose.plugin(slugMongo);
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

  @Prop({ slugMongo: 'name', unique: true })
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
