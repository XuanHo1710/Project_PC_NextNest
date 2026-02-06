import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsMongoId,
} from "class-validator";

export class CreateProductDto {
  @IsMongoId()
  categoryId: string;

  @IsMongoId()
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
