import { PartialType } from '@nestjs/mapped-types';
import { CreateProductInteractionDetailDto } from 'src/admin/product/dto/create-product-interaction-detail.entity';

export class UpdateProductInteractionDetailDto extends PartialType(CreateProductInteractionDetailDto) { }
