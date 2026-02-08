import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsMongoId,
  IsNotEmpty,
} from "class-validator";

export class CreateProductDto {
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  brandId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @IsEnum(["ACTIVE", "INACTIVE"])
  @IsOptional()
  status?: string;

  @IsMongoId()
  @IsOptional()
  defaultProductVariantId?: string;
}
