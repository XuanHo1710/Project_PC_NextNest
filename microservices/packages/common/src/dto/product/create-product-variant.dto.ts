import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsArray,
  IsObject,
  Min,
  Max,
} from "class-validator";

export class CreateProductVariantDto {
  @IsString()
  sku: string;

  @IsString()
  @IsOptional()
  subDescription?: string;

  @IsMongoId()
  product: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;

  @IsObject()
  @IsOptional()
  combination?: Record<string, string>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
