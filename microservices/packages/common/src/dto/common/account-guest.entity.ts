import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type AccountGuestDocument = HydratedDocument<AccountGuest>;

@Schema({ timestamps: true })
export class AccountGuest {
  _id: Types.ObjectId;
  // Authentication fields only
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: "" })
  avatar?: string;

  @Prop()
  password?: string;

  // Google OAuth fields
  @Prop()
  googleId?: string;

  @Prop({ enum: ["local", "google"], default: "local" })
  authProvider: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  resetPasswordExpires?: Date;

  // Account status and security
  @Prop({
    enum: ["PENDING", "ACTIVE", "SUSPENDED", "DELETED"],
    default: "PENDING",
  })
  accountStatus: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop({ default: null })
  otpCodeForEmail?: number;

  @Prop({ type: Array, default: [] })
  loginInformation: [
    {
      loginCount: { type: number; default: 0 };
      loginAt: { type: Date };
    },
  ];

  // Information guest profile

  // Sản phẩm yêu thích
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }])
  favoriteProducts: mongoose.Schema.Types.ObjectId[];

  // Sản phẩm đã xem gần đây
  @Prop([
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      viewedAt: { type: Date, default: Date.now },
    },
  ])
  recentlyViewed: Array<{
    productId: mongoose.Schema.Types.ObjectId;
    viewedAt: Date;
  }>;

  // Thống kê khách hàng
  @Prop({ default: 0 })
  totalOrders: number;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ default: 0 })
  loyaltyPoints: number;

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

  @Prop({ enum: ["MALE", "FEMALE", "OTHER"], default: "OTHER" })
  gender: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ default: "" })
  phone: string;

  @Prop({ default: "" })
  adminNotes: string;

  // Soft delete
  @Prop()
  deletedAt?: Date;

  @Prop()
  deletedBy?: mongoose.Schema.Types.ObjectId;
}

export const AccountGuestSchema = SchemaFactory.createForClass(AccountGuest);

// Indexes for better performance
AccountGuestSchema.index({ googleId: 1 });
AccountGuestSchema.index({ accountStatus: 1 });
AccountGuestSchema.index({ isActive: 1 });
AccountGuestSchema.index({ createdAt: -1 });
