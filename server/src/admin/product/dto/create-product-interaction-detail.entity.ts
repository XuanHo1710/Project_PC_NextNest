import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";
import mongoose from "mongoose";

export class CreateProductInteractionDetailDto {
    @IsNotEmpty({ message: 'Chi tiết tương tác không được để trống' })
    productInteractionId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Người dùng không được để trống' })
    guestIdInteractedBy: mongoose.Schema.Types.ObjectId;

    isLiked: boolean;

    isDisLiked: boolean;


    content: string;


    isAdminReply: boolean;

    images: string[];
}
