import {
  Controller,
  Inject,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MICROSERVICE,
  UpdateProductAttributeAllowValueDto,
  CreateProductAttributeAllowValueDto,
} from '@project-pc/common';

@Controller('/client/product-attribute-allow-value')
export class ProductAttributeAllowValueController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Post()
  createProductAttributeAllowValue(
    @Body()
    createProductAttributeAllowValueDto: CreateProductAttributeAllowValueDto,
  ) {
    return this.productService.send('product.attributeAllowValue.create', {
      createProductAttributeAllowValueDto,
    });
  }

  @Get(':productId')
  findAllProductAttributeAllowValues(@Param('productId') productId?: string) {
    return this.productService.send('product.attributeAllowValue.findAll', {
      productId,
    });
  }

  @Get(':id')
  findOneProductAttributeAllowValue(@Param('id') id: string) {
    return this.productService.send('product.attributeAllowValue.findOne', {
      id,
    });
  }

  @Patch(':id')
  updateProductAttributeAllowValue(
    @Param('id') id: string,
    @Body()
    updateProductAttributeAllowValueDto: UpdateProductAttributeAllowValueDto,
  ) {
    return this.productService.send('product.attributeAllowValue.update', {
      id,
      updateProductAttributeAllowValueDto,
    });
  }

  @Delete(':id')
  removeProductAttributeAllowValue(@Param('id') id: string) {
    return this.productService.send('product.attributeAllowValue.remove', {
      id,
    });
  }
}
