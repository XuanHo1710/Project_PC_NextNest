import {
  Controller,
  Inject,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MICROSERVICE,
  CreateProductAttributeValueDto,
  UpdateProductAttributeValueDto,
} from '@project-pc/common';
import { Guest } from '../../decorators/customize';

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
    @Guest() guest: any,
  ) {
    // Auto-set createdBy from authenticated user
    createProductAttributeValueDto.createdBy = guest._id;
    return this.productService.send('product.attributeValue.create', {
      createProductAttributeValueDto,
    });
  }

  @Get()
  findAllValues(
    @Guest() guest: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.productService.send('product.attributeValue.findAll', {
      createdBy: guest._id,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
    });
  }

  @Get(':attributeId')
  findAllProductAttributeValues(
    @Param('attributeId') attributeId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.productService.send('product.attributeValue.findAll', {
      attributeId,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
    });
  }

  @Get('detail/:id')
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
