import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from 'mongoose';
export type AccountEmployeeDocument = HydratedDocument<AccountEmployee>;

@Schema({ timestamps: true })
export class AccountEmployee {
    @Prop()
    email: string

    @Prop()
    password: string;

    @Prop()
    employee: mongoose.Schema.Types.ObjectId;

    @Prop({ default: "ACTIVE" })
    status: string;  //ACTIVE, INACTIVE

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

export const AccountEmployeeSchema = SchemaFactory.createForClass(AccountEmployee);
