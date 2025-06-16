import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateDiscountDto {
    @IsNotEmpty({ message: "Tên không được để trống" })
    name: string;

    description: string;

    @IsNotEmpty({ message: "Loại giảm giá không được để trống" })
    type: string; // MONEY, PERCENT

    @IsNotEmpty({ message: "Ngày bắt đầu không được để trống" })
    startDate: Date;

    @IsNotEmpty({ message: "Ngày kết thúc không được để trống" })
    endDate: Date;

    @IsNotEmpty({ message: "Giá trị không được để trống" })
    @IsNumber({ allowInfinity: false, allowNaN: false }, { message: "Phải là số nguyên" })
    valueDiscount: number;

    status: string; //ACTIVE, INACTIVE
}
