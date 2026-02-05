import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
export type AccountEmployeeDocument = HydratedDocument<AccountEmployee>;

@Schema({ timestamps: true })
export class AccountEmployee {
  _id: Types.ObjectId;

  @Prop()
  IDEmp: string;

  @Prop()
  password: string;

  @Prop()
  roleId: Types.ObjectId;

  @Prop({ default: 'ACTIVE' })
  status: string; //ACTIVE, INACTIVE

  // Information employee
  @Prop({ default: '' })
  avatar: string;

  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  age: number;

  @Prop({ type: String, enum: ['MALE', 'FEMALE'], default: 'MALE' })
  gender: string;

  // Địa chỉ mặc định
  @Prop([
    {
      label: { type: String, required: true }, // 'Nhà riêng', 'Văn phòng'
      province: {
        code: { type: Number, required: true },
        name: { type: String, required: true },
      },
      district: {
        code: { type: Number, required: true },
        name: { type: String, required: true },
      },
      ward: {
        code: { type: Number, required: true },
        name: { type: String, required: true },
      },
      detailAddress: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    },
  ])
  addresses: Array<{
    _id?: string; // MongoDB sẽ tự tạo _id
    label: string;
    province: { code: number; name: string };
    district: { code: number; name: string };
    ward: { code: number; name: string };
    detailAddress: string;
    isDefault: boolean;
  }>;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const AccountEmployeeSchema =
  SchemaFactory.createForClass(AccountEmployee);
