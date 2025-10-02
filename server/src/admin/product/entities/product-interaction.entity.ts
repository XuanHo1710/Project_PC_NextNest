import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guest } from '../../guest/entities/guest.entity';
import { Product } from 'src/admin/product/entities/product.entity';

export type ProductInteractionDocument = HydratedDocument<ProductInteraction>;

@Schema({ timestamps: true })
export class ProductInteraction {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Guest.name, required: true })
    guestId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name, required: true })
    productId: mongoose.Schema.Types.ObjectId;

    @Prop({ default: 0 })
    likes: number;

    @Prop({ default: 0 })
    dislikes: number;

    @Prop({ default: false })
    isFavorited: boolean; // Thêm vào yêu thích

    @Prop({ default: false })
    isWishlisted: boolean; // Thêm vào wishlist

    @Prop({ default: "" })
    content: string;

    @Prop({ default: false })
    isRating: boolean; // Đánh giá sản phẩm

    @Prop({ default: 5, max: 5, min: 1 })
    rating: number; // Số sao đánh giá (1-5)

    @Prop({ default: [], type: [String] })
    images: string[]; // Ảnh đính kèm trong review

    @Prop({ default: Date.now })
    ratingAt: Date;

}

export const ProductInteractionSchema = SchemaFactory.createForClass(ProductInteraction);