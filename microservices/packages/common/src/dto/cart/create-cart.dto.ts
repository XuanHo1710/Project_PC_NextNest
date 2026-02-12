import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class CartItemProductDto {
  @IsString()
  _id: string;
}

class CartItemDto {
  @ValidateNested()
  @Type(() => CartItemProductDto)
  product: CartItemProductDto;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  subtotal: number;
}

export class CreateCartDto {
  @IsString()
  guestId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsOptional()
  cartItems: CartItemDto[];

  @IsNumber({}, { message: "Tổng tiền phải là số nguyên" })
  total: number;
}
