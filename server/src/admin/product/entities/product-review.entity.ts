import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guest } from '../../guest/entities/guest.entity';
import { Product } from '../../product/entities/product.entity';

export type ProductReviewDocument = HydratedDocument<ProductReview>;

@Schema({ timestamps: true })
export class ProductReview {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Guest.name, required: true })
    guestId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name, required: true })
    productId: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true, min: 1, max: 5 })
    rating: number;

    @Prop({ required: true })
    content: string;

    @Prop([String])
    images: string[]; // Ảnh đính kèm trong review

    @Prop({ default: 0 })
    likes: number;

    @Prop({ default: 0 })
    dislikes: number;

    @Prop({ default: false })
    isVerifiedPurchase: boolean; // Đã mua hàng hay chưa

    @Prop({ enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
    status: string;

    // Thông tin người duyệt (admin)
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AccountEmployee' })
    approvedBy?: mongoose.Schema.Types.ObjectId;

    @Prop()
    approvedAt?: Date;

    @Prop()
    rejectionReason?: string;

    // Replies from admin or other users
    @Prop([{
        authorId: { type: mongoose.Schema.Types.ObjectId, refPath: 'replies.authorType' },
        authorType: { type: String, enum: ['Guest', 'AccountEmployee'] },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        isAdminReply: { type: Boolean, default: false }
    }])
    replies: Array<{
        authorId: mongoose.Schema.Types.ObjectId;
        authorType: 'Guest' | 'AccountEmployee';
        content: string;
        createdAt: Date;
        isAdminReply: boolean;
    }>;

    // Interaction tracking
    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }])
    likedBy: mongoose.Schema.Types.ObjectId[];

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }])
    dislikedBy: mongoose.Schema.Types.ObjectId[];

    // Help count tracking
    @Prop({ default: 0 })
    helpfulCount: number;

    @Prop({ default: 0 })
    notHelpfulCount: number;
}

export const ProductReviewSchema = SchemaFactory.createForClass(ProductReview);