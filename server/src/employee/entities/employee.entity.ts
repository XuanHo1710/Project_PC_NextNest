import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
export type EmployeeDocument = HydratedDocument<Employee>;

@Schema({ timestamps: true })
export class Employee {
    @Prop()
    avatar: string;
    @Prop()
    name: string;
    @Prop({ required: true })
    email: string;
    @Prop()
    age: number;
    @Prop()
    gender: string;
    @Prop()
    address: string;
    @Prop({ default: 'Employee' })
    role: string;

    @Prop({default: "a"})
    refreshToken: string;

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


export const EmployeeSchema = SchemaFactory.createForClass(Employee);
