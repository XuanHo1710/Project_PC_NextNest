import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guest } from 'src/admin/guest/entities/guest.entity';
import { ProductInteraction } from 'src/admin/product/entities/product-interaction.entity';

export type ProductInteractionDetailDocument = HydratedDocument<ProductInteractionDetail>;

@Schema({ timestamps: true })
export class ProductInteractionDetail {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ProductInteraction.name, required: true })
    productInteractionId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Guest.name, required: true })
    guestIdInteractedBy: mongoose.Schema.Types.ObjectId;
    // Các loại tương tác
    @Prop({ default: false })
    isLiked: boolean; // Like sản phẩm

    @Prop({ default: false })
    isDisLiked: boolean; // Dislike sản phẩm

    @Prop({ default: "" })
    content: string;

    @Prop({ type: Boolean, default: false })
    isAdminReply: boolean;

    @Prop({ default: [], type: [String] })
    images: string[]; // Ảnh đính kèm trong review

    @Prop({ default: Date.now })
    ratingAt: Date;

    @Prop({ default: false })
    isReply: boolean
}

export const ProductInteractionDetailSchema = SchemaFactory.createForClass(ProductInteractionDetail);