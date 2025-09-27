import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guest } from '../../guest/entities/guest.entity';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Guest.name, required: true })
    guestId: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    message: string;

    @Prop({
        enum: ['ORDER', 'PROMOTION', 'SYSTEM', 'PRODUCT'],
        required: true
    })
    type: string;

    @Prop({
        enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'],
        default: 'INFO'
    })
    priority: string;

    @Prop({ default: false })
    isRead: boolean;

    @Prop()
    readAt?: Date;

    // Liên kết đến resource liên quan
    @Prop()
    relatedId?: mongoose.Schema.Types.ObjectId; // Order ID, Product ID, etc.

    @Prop()
    relatedType?: string; // 'order', 'product', 'promotion'

    // Action button (nếu có)
    @Prop()
    actionText?: string; // "Xem đơn hàng", "Mua ngay"

    @Prop()
    actionUrl?: string; // Link đến trang cụ thể

    // Metadata bổ sung
    @Prop({ type: mongoose.Schema.Types.Mixed })
    metadata?: any;

    @Prop({ default: Date.now })
    expiresAt?: Date; // Thông báo hết hạn
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Index để tối ưu query
NotificationSchema.index({ guestId: 1, createdAt: -1 });
NotificationSchema.index({ guestId: 1, isRead: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index