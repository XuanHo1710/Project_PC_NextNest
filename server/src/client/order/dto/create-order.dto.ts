import { IsNumber } from "class-validator";
import mongoose from "mongoose";

export class CreateOrderDto {
    guestId: mongoose.Schema.Types.ObjectId;
    customerInfo: {
        fullname: string,
        address: string,
        email: string,
        phone: string,
        note: string
    };

    orderDetail: [
        {
            product: {
                _id: mongoose.Schema.Types.ObjectId
            },
            quantity: number,
            subtotal: number,
            price: number,
        }
    ];

    totalAmount: number;
}
