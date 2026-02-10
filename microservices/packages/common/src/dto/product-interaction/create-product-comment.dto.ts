import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsNotEmpty,
  IsArray,
  Min,
  Max,
  MaxLength,
  IsBoolean,
} from "class-validator";

export class CreateProductCommentDto {
  @IsNotEmpty()
  product: string;

  @IsOptional()
  guest?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsMongoId()
  @IsOptional()
  parentComment?: string;

  @IsBoolean()
  @IsOptional()
  isAdminReply?: boolean;
}
