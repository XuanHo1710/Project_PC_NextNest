import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from 'mongoose';
import { Employee } from "src/employee/entities/employee.entity";
import { Role } from "src/role/entities/role.entity";
export type AccountEmployeeDocument = HydratedDocument<AccountEmployee>;

@Schema({ timestamps: true })
export class AccountEmployee {
    @Prop()
    _id: string;

    @Prop()
    IDEmp: string;

    @Prop()
    password: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
    employee: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
    role: mongoose.Schema.Types.ObjectId;

    @Prop()
    refresh_token: string

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
