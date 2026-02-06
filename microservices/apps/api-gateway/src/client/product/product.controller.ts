import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MICROSERVICE,
  CreateProductDto,
  SearchProductDto,
  UpdateProductDto,
} from '@project-pc/common';

@Controller('/client/product')
export class ProductController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  // ============= PRODUCT ENDPOINTS =============
  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.send('product.create', { createProductDto });
  }

  @Get()
  findAllProducts(@Query() searchDto?: SearchProductDto) {
    return this.productService.send('product.findAll', { searchDto });
  }

  @Get(':id')
  findOneProduct(@Param('id') id: string) {
    return this.productService.send('product.findOne', { id });
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.send('product.update', { id, updateProductDto });
  }

  @Delete(':id')
  removeProduct(@Param('id') id: string) {
    return this.productService.send('product.remove', { id });
  }

  @Get('search')
  searchProducts(@Query() searchDto?: SearchProductDto) {
    return this.productService.send('product.search', { searchDto });
  }
}
