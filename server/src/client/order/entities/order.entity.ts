import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guest } from 'src/admin/guest/entities/guest.entity';
import { Product } from 'src/admin/product/entities/product.entity';
export type OrderDocument = HydratedDocument<Order>;
@Schema({ timestamps: true })
export class Order {
    _id: mongoose.Schema.Types.ObjectId

    @Prop({
        type:
        {
            fullname: { type: String, default: '' },
            address: { type: String, default: '' },
            email: { type: String, default: '' },
            phone: { type: String, default: '' },
            note: { type: String, default: '' },
        },
        required: true
    })
    customerInfo: {
        fullname: string,
        address: string,
        email: string,
        phone: string,
        note: string
    };

    @Prop({
        type: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: Product.name, required: true },
                quantity: { type: Number, default: 1 },
                subtotal: { type: Number, default: 0 },
                price: { type: Number, default: 0 },
                _id: { type: mongoose.Schema.Types.ObjectId, required: true }
            },
        ], default: []
    })
    orderDetail: [
        {
            product: mongoose.Schema.Types.ObjectId,
            quantity: number,
            subtotal: number,
            price: number,
            _id: mongoose.Schema.Types.ObjectId
        }
    ];

    @Prop({ type: Number, default: 0 })
    totalAmount: number;

    @Prop({ type: String, enum: ['PENDING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'], default: 'PENDING' })
    status: string;

    @Prop({ type: Date, default: Date.now })
    orderDate: Date;

    @Prop({
        type: {
            isCheckout: { type: Boolean, default: false },
            type: { type: String, enum: ['CASH', 'CARD'], default: 'CASH' }
        }
    })
    payment: {
        isCheckout: boolean,
        type: string
    }
}

export const OrderSchema = SchemaFactory.createForClass(Order);
