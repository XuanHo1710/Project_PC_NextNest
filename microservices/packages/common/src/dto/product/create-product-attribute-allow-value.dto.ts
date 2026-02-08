import { IsNotEmpty } from "class-validator";

export class CreateProductAttributeAllowValueDto {
  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  attributeValue: string;
}
