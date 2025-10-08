import { IsNumber } from "class-validator";
import mongoose from "mongoose";

export class CreateCartDto {
    guestId: mongoose.Schema.Types.ObjectId
    cartItems: [
        {
            product: { _id: mongoose.Schema.Types.ObjectId },
            quantity: number,
            subtotal: number,
            price: number
        }
    ];
    @IsNumber({}, { message: 'Tổng tiền phải là số nguyên' })
    total: number;
}
