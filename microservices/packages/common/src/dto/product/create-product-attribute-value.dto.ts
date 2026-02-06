import { IsString, IsMongoId, IsOptional } from 'class-validator';

export class CreateProductAttributeValueDto {
  @IsString()
  value: string;

  @IsString()
  label: string;

  @IsMongoId()
  attribute: string;

  @IsString()
  @IsOptional()
  colorHex?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
