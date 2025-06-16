import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";
import mongoose from "mongoose";

export class CreateAccountEmployeeDto {
    @IsNotEmpty({ message: "Email không được để trống" })
    @IsEmail({}, { message: "Email không đúng định dạng" })
    email: string

    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    @IsStrongPassword({}, { message: "Mật khẩu quá yếu" })
    password: string;

    @IsNotEmpty({ message: "Nhân viên này không được để trống" })
    employee: mongoose.Schema.Types.ObjectId;

    status: string;  //ACTIVE, INACTIVE
}
