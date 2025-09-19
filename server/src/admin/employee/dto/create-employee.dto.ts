import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class CreateEmployeeDto {

    @IsNotEmpty({ message: "Ảnh không được để trống" })
    avatar: string;

    @IsNotEmpty({ message: "Tên không được để trống" })
    name: string;

    @IsEmail({ allow_utf8_local_part: true }, { message: "Email không đúng định dạng" })
    @IsNotEmpty({ message: "Email không được để trống" })
    email: string;

    @IsNumber({ maxDecimalPlaces: 100 }, { message: "Tuổi không hợp lệ" })
    age: number;

    @IsNotEmpty({ message: "Giới tính không được để trống" })
    gender: string;

    @IsNotEmpty({ message: "Địa chỉ không được để trống" })
    address: string;
}
