import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";
import mongoose from "mongoose";

export class CreateProductInteractionDto {
    @IsNotEmpty({ message: 'Sản phẩm không được để trống' })
    productId: mongoose.Schema.Types.ObjectId;

    guestId: mongoose.Schema.Types.ObjectId;

    content: string;

    rating: number;

    images: string[]; // Ảnh đính kèm trong review

    isFavorited?: boolean; // Thêm vào yêu thích

    isWishlisted: boolean; // Thêm vào wishlist

    isRating?: boolean; // Đánh giá sản phẩm

    likes?: number;

    dislikes?: number;
}
