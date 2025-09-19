import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
    _id: mongoose.Schema.Types.ObjectId

    @Prop()
    name: string;

    @Prop({ type: Object, required: false, default: null })
    parent?: {
        _id?: mongoose.Schema.Types.ObjectId,
        name?: string
    }


    @Prop({ type: Array })
    children: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            name: string
        }
    ]

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

export const CategorySchema = SchemaFactory.createForClass(Category);
