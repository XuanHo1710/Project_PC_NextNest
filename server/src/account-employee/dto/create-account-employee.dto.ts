import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";
import mongoose from "mongoose";

export class CreateAccountEmployeeDto {
    @IsNotEmpty({ message: "Mã số nhân viên không được để trống" })
    IDEmp: string

    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    @IsStrongPassword({}, { message: "Phải có ít nhất 1 kí tự chữ, số, chữ hoa, đặc biệt" })
    password: string;

    employee: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: "Nhân viên này không được để trống" })
    employeeId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: "Quyền không được để trống" })
    roleId: mongoose.Schema.Types.ObjectId;

    role: mongoose.Schema.Types.ObjectId;

    status: string;  //ACTIVE, INACTIVE
}
