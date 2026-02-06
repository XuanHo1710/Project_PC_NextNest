import {
  Controller,
  Inject,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MICROSERVICE,
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
} from '@project-pc/common';

@Controller('/client/product-attribute')
export class ProductAttributeController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Post()
  createProductAttribute(
    @Body() createProductAttributeDto: CreateProductAttributeDto,
  ) {
    return this.productService.send('product.attribute.create', {
      createProductAttributeDto,
    });
  }

  @Get()
  findAllProductAttributes() {
    return this.productService.send('product.attribute.findAll', {});
  }

  @Get(':id')
  findOneProductAttribute(@Param('id') id: string) {
    return this.productService.send('product.attribute.findOne', { id });
  }

  @Patch(':id')
  updateProductAttribute(
    @Param('id') id: string,
    @Body() updateProductAttributeDto: UpdateProductAttributeDto,
  ) {
    return this.productService.send('product.attribute.update', {
      id,
      updateProductAttributeDto,
    });
  }

  @Delete(':id')
  removeProductAttribute(@Param('id') id: string) {
    return this.productService.send('product.attribute.remove', { id });
  }
}
