import { PartialType } from "@nestjs/mapped-types";
import { CreateProductAttributeAllowValueDto } from "./create-product-attribute-allow-value.dto";

export class UpdateProductAttributeAllowValueDto extends PartialType(
  CreateProductAttributeAllowValueDto,
) {}
