import { PartialType } from '@nestjs/mapped-types';
import { CreateProductInteractionDto } from 'src/admin/product/dto/create-product-interaction.entity';

export class UpdateProductInteractionDto extends PartialType(CreateProductInteractionDto) { }
