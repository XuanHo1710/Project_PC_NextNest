import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guest } from '../../guest/entities/guest.entity';

export type GuestOrderDocument = HydratedDocument<GuestOrder>;

@Schema({ timestamps: true })
export class GuestOrder {
    @Prop({ required: true, unique: true })
    orderCode: string; // Mã đơn hàng: DH123456

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true })
    guestId: mongoose.Schema.Types.ObjectId;

    // Thông tin khách hàng tại thời điểm đặt hàng
    @Prop({
        fullname: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    })
    customerInfo: {
        fullname: string;
        email: string;
        phone: string;
    };

    // Địa chỉ giao hàng
    @Prop({
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
        fullAddress: { type: String, required: true } // Địa chỉ đầy đủ để hiển thị
    })
    shippingAddress: {
        province: { code: number; name: string };
        district: { code: number; name: string };
        ward: { code: number; name: string };
        detailAddress: string;
        fullAddress: string;
    };

    // Sản phẩm trong đơn hàng
    @Prop([{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        totalPrice: { type: Number, required: true }
    }])
    items: Array<{
        productId: mongoose.Schema.Types.ObjectId;
        name: string;
        image: string;
        price: number;
        quantity: number;
        totalPrice: number;
    }>;

    // Thông tin thanh toán
    @Prop({ required: true })
    subtotal: number; // Tạm tính

    @Prop({ default: 0 })
    shippingFee: number; // Phí vận chuyển

    @Prop({ default: 0 })
    discount: number; // Giảm giá

    @Prop({ required: true })
    total: number; // Tổng cộng

    @Prop({ enum: ['COD', 'VNPAY', 'MOMO'], default: 'COD' })
    paymentMethod: string;

    @Prop({ enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' })
    paymentStatus: string;

    // Trạng thái đơn hàng
    @Prop({
        enum: ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED'],
        default: 'PENDING'
    })
    status: string;

    // Lịch sử trạng thái
    @Prop([{
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountEmployee' },
        note: { type: String }
    }])
    statusHistory: Array<{
        status: string;
        updatedAt: Date;
        updatedBy?: mongoose.Schema.Types.ObjectId;
        note?: string;
    }>;

    @Prop()
    note?: string; // Ghi chú của khách hàng

    @Prop()
    adminNote?: string; // Ghi chú của admin

    // Thông tin giao hàng
    @Prop()
    estimatedDeliveryDate?: Date;

    @Prop()
    actualDeliveryDate?: Date;

    @Prop()
    trackingNumber?: string; // Mã vận đơn

    // Thông tin hủy/trả hàng
    @Prop()
    cancelledAt?: Date;

    @Prop()
    cancelReason?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AccountEmployee' })
    cancelledBy?: mongoose.Schema.Types.ObjectId;

    // VNPay transaction info
    @Prop()
    vnpayTransactionInfo?: {
        transactionNo: string;
        bankCode: string;
        bankTranNo: string;
        payDate: string;
        responseCode: string;
    };
}

export const GuestOrderSchema = SchemaFactory.createForClass(GuestOrder);