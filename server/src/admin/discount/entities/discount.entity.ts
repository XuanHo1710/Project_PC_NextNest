import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from 'mongoose';
export type DiscountDocument = HydratedDocument<Discount>;

@Schema({ timestamps: true })
export class Discount {

    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop()
    type: string; // MONEY, PERCENT

    @Prop()
    startDate: Date;

    @Prop()
    endDate: Date;

    @Prop()
    valueDiscount: number;

    @Prop({ default: "ACTIVE" })
    status: string; //ACTIVE, INACTIVE


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


export const DiscountSchema = SchemaFactory.createForClass(Discount);
