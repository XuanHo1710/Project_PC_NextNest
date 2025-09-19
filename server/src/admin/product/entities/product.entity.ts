import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from 'src/admin/category/entities/category.entity';
export type EmployeeDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {

    @Prop()
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name })
    category: mongoose.Types.ObjectId;

    @Prop()
    description: string;
    @Prop()
    images: Array<string>;
    @Prop()
    oldPrice: number;
    @Prop()
    newPrice: number;
    @Prop({ default: 0 })
    discount: number;
    @Prop()
    stock: number;
    @Prop({ default: 0 })
    soldCount: number;
    @Prop({ type: Array, default: [] })
    other: [
        {
            key: string,
            value: string
        }
    ];

    @Prop({ default: 0 })
    position: number;

    @Prop({ default: false })
    feature: boolean


    @Prop({ default: "active" })
    status: string;
    // ACTIVE INACTIVE STOPSOLD



    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    }

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    }

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    }

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