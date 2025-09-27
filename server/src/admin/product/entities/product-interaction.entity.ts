import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guest } from '../../guest/entities/guest.entity';
import { Product } from '../../product/entities/product.entity';

export type ProductInteractionDocument = HydratedDocument<ProductInteraction>;

@Schema({ timestamps: true })
export class ProductInteraction {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Guest.name, required: true })
    guestId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name, required: true })
    productId: mongoose.Schema.Types.ObjectId;

    // Các loại tương tác
    @Prop({ default: false })
    isLiked: boolean; // Like sản phẩm

    @Prop({ default: false })
    isFavorited: boolean; // Thêm vào yêu thích

    @Prop({ default: false })
    isWishlisted: boolean; // Thêm vào wishlist

    @Prop({ default: 0 })
    viewCount: number; // Số lần xem

    @Prop()
    lastViewedAt?: Date; // Lần xem cuối

    // Thời gian các hành động
    @Prop()
    likedAt?: Date;

    @Prop()
    favoritedAt?: Date;

    @Prop()
    wishlistedAt?: Date;

    // So sánh sản phẩm
    @Prop({ default: false })
    isInComparison: boolean;

    @Prop()
    comparedAt?: Date;
}

export const ProductInteractionSchema = SchemaFactory.createForClass(ProductInteraction);