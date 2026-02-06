import { IsMongoId } from 'class-validator';

export class CreateProductAttributeAllowValueDto {
  @IsMongoId()
  product: string;

  @IsMongoId()
  attributeValue: string;
}
