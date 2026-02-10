import { PartialType } from "@nestjs/mapped-types";
import { CreateProductCommentDto } from "./create-product-comment.dto";

export class UpdateProductCommentDto extends PartialType(
  CreateProductCommentDto,
) {}
