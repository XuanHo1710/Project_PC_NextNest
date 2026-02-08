import {
  Controller,
  Inject,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MICROSERVICE,
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
} from '@project-pc/common';
import { Guest } from '../../decorators/customize';

@Controller('/client/product-attribute')
export class ProductAttributeController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Post()
  createProductAttribute(
    @Body() createProductAttributeDto: CreateProductAttributeDto,
    @Guest() guest: any,
  ) {
    // Auto-set createdBy from authenticated user
    createProductAttributeDto.createdBy = guest._id;
    return this.productService.send('product.attribute.create', {
      createProductAttributeDto,
    });
  }

  @Get()
  findAllProductAttributes(
    @Guest() guest: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.productService.send('product.attribute.findAll', {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      createdBy: guest._id,
      search,
    });
  }

  @Get(':id')
  findOneProductAttribute(@Param('id') id: string) {
    return this.productService.send('product.attribute.findOne', { id });
  }

  @Patch(':id')
  updateProductAttribute(
    @Param('id') id: string,
    @Body() updateProductAttributeDto: UpdateProductAttributeDto,
    @Guest() guest: any,
  ) {
    return this.productService.send('product.attribute.update', {
      id,
      updateProductAttributeDto,
      createdBy: guest._id,
    });
  }

  @Delete(':id')
  removeProductAttribute(@Param('id') id: string, @Guest() guest: any) {
    return this.productService.send('product.attribute.remove', {
      id,
      createdBy: guest._id,
    });
  }
}
