import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guest } from '../../guest/entities/guest.entity';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true })
    guestId: mongoose.Schema.Types.ObjectId;

    @Prop([{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        addedAt: { type: Date, default: Date.now },

        // Cache thông tin sản phẩm để tối ưu performance
        productInfo: {
            name: { type: String, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            isAvailable: { type: Boolean, default: true },
            inStock: { type: Number, required: true }
        }
    }])
    items: Array<{
        productId: mongoose.Schema.Types.ObjectId;
        quantity: number;
        addedAt: Date;
        productInfo: {
            name: string;
            image: string;
            price: number;
            isAvailable: boolean;
            inStock: number;
        };
    }>;

    @Prop({ default: Date.now })
    lastUpdated: Date;

    // Tổng số lượng items
    @Prop({ default: 0 })
    totalItems: number;

    // Tổng giá trị giỏ hàng
    @Prop({ default: 0 })
    totalValue: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Index để tối ưu query
CartSchema.index({ guestId: 1 });
CartSchema.index({ 'items.productId': 1 });