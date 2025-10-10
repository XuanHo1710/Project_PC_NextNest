import { IsNumber } from "class-validator";
import mongoose from "mongoose";

export class CreateOrderDto {
    customerInfo: {
        fullname: string,
        address: string,
        email: string,
        phone: string,
        note: string
    };

    orderDetail: [
        {
            product: mongoose.Schema.Types.ObjectId,
            quantity: number,
            subtotal: number,
            price: number,
            _id: mongoose.Schema.Types.ObjectId
        }
    ];

    totalAmount: number;
}
