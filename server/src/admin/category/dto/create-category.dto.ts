import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateCategoryDto {
    @IsNotEmpty({ message: "Tên không được để trống" })
    name: string;

    parent: mongoose.Types.ObjectId | string
}
