import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty({ message: "Tên không được để trống" })
    name: string;

    @IsNotEmpty({ message: "Danh mục không được để trống" })
    category: string

    description: string;

    @IsNotEmpty({ message: "Ảnh không được để trống" })
    images: Array<string>;

    @IsNotEmpty({ message: "Giá không được để trống" })
    @IsNumber(
        { allowNaN: false, allowInfinity: false },
        { message: "Phải là số tự nhiên" },
    )
    oldPrice: number;

    @IsNotEmpty({ message: "Khuyến mãi không được để trống" })
    @IsNumber(
        { allowNaN: false, allowInfinity: false },
        { message: "Phải là số tự nhiên" },
    )
    discount: number;

    @IsNotEmpty({ message: "Số lượng tồn không được để trống" })
    @IsNumber(
        { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
        { message: "Phải là số nguyên" },
    )
    stock: number;

    other: [
        {
            key: string;
            value: string;
        },
    ];

    newPrice: number;

    status: string;
    // ACTIVE INACTIVE STOPSOLD

    @IsNumber({}, { message: "Phải là số nguyên" })
    position: number;

    @IsBoolean({ message: "Kiểu dữ liệu không hợp lệ" })
    feature: boolean;
}
