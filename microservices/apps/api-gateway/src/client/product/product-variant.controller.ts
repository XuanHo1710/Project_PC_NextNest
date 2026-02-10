import {
  Controller,
  Inject,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MICROSERVICE,
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from '@project-pc/common';

@Controller('/client/product-variant')
export class ProductVariantController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Post()
  createProductVariant(
    @Body() createProductVariantDto: CreateProductVariantDto,
  ) {
    return this.productService.send('product.variant.create', {
      createProductVariantDto,
    });
  }

  @Post('bulk')
  createBulkProductVariants(
    @Body() body: { variants: CreateProductVariantDto[] },
  ) {
    return this.productService.send('product.variant.createBulk', {
      variants: body.variants,
    });
  }

  @Patch('bulk')
  updateBulkProductVariants(
    @Body() body: { updates: { id: string; data: UpdateProductVariantDto }[] },
  ) {
    return this.productService.send('product.variant.updateBulk', {
      updates: body.updates,
    });
  }

  @Get(':productId')
  findAllProductVariants(@Param('productId') productId?: string) {
    return this.productService.send('product.variant.findAll', { productId });
  }

  @Get(':id')
  findOneProductVariant(@Param('id') id: string) {
    return this.productService.send('product.variant.findOne', { id });
  }

  @Patch(':id')
  updateProductVariant(
    @Param('id') id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productService.send('product.variant.update', {
      id,
      updateProductVariantDto,
    });
  }

  @Delete(':id')
  removeProductVariant(@Param('id') id: string) {
    return this.productService.send('product.variant.remove', { id });
  }
}
