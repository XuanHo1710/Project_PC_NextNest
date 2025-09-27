import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type GuestDocument = HydratedDocument<Guest>;

@Schema({ timestamps: true })
export class Guest {
    @Prop({ required: true })
    fullname: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop()
    avatar?: string;

    @Prop({ required: true })
    password: string;

    @Prop({ enum: ['MALE', 'FEMALE', 'OTHER'], default: 'OTHER' })
    gender: string;

    @Prop()
    birthday?: Date;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop()
    verifyToken?: string;

    @Prop()
    resetPasswordToken?: string;

    @Prop()
    resetPasswordExpires?: Date;

    // Địa chỉ mặc định
    @Prop([{
        id: { type: String, required: true },
        label: { type: String, required: true }, // 'Nhà riêng', 'Văn phòng'
        province: {
            code: { type: Number, required: true },
            name: { type: String, required: true }
        },
        district: {
            code: { type: Number, required: true },
            name: { type: String, required: true }
        },
        ward: {
            code: { type: Number, required: true },
            name: { type: String, required: true }
        },
        detailAddress: { type: String, required: true },
        isDefault: { type: Boolean, default: false }
    }])
    addresses: Array<{
        id: string;
        label: string;
        province: { code: number; name: string };
        district: { code: number; name: string };
        ward: { code: number; name: string };
        detailAddress: string;
        isDefault: boolean;
    }>;

    // Sản phẩm yêu thích
    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }])
    favoriteProducts: mongoose.Schema.Types.ObjectId[];

    // Sản phẩm đã xem gần đây
    @Prop([{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        viewedAt: { type: Date, default: Date.now }
    }])
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

    // Login tracking
    @Prop()
    lastLoginAt?: Date;

    @Prop({ default: 0 })
    loginCount: number;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);