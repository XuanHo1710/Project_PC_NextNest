import {
  Controller,
  Inject,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MICROSERVICE,
  CreateProductAttributeValueDto,
  UpdateProductAttributeValueDto,
} from '@project-pc/common';

@Controller('/client/product-attribute-value')
export class ProductAttributeValueController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Post()
  createProductAttributeValue(
    @Body()
    createProductAttributeValueDto: CreateProductAttributeValueDto,
  ) {
    return this.productService.send('product.attributeValue.create', {
      createProductAttributeValueDto,
    });
  }

  @Get(':attributeId')
  findAllProductAttributeValues(@Param('attributeId') attributeId?: string) {
    return this.productService.send('product.attributeValue.findAll', {
      attributeId,
    });
  }

  @Get(':id')
  findOneProductAttributeValue(@Param('id') id: string) {
    return this.productService.send('product.attributeValue.findOne', { id });
  }

  @Patch(':id')
  updateProductAttributeValue(
    @Param('id') id: string,
    @Body() updateProductAttributeValueDto: UpdateProductAttributeValueDto,
  ) {
    return this.productService.send('product.attributeValue.update', {
      id,
      updateProductAttributeValueDto,
    });
  }

  @Delete(':id')
  removeProductAttributeValue(@Param('id') id: string) {
    return this.productService.send('product.attributeValue.remove', { id });
  }
}
