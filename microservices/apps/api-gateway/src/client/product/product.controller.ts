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
import { Public } from '../../decorators/customize';

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
  @Public()
  findAllProducts(@Query() searchDto?: SearchProductDto) {
    return this.productService.send('product.findAll', { searchDto });
  }

  @Get('collection/:slug')
  @Public()
  findByCollection(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('cpu') cpu?: string,
    @Query('ram') ram?: string,
  ) {
    return this.productService.send('product.findByCollection', {
      slug,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
      sort: sort || '',
      cpu: cpu || '',
      ram: ram || '',
    });
  }

  @Get('client-products')
  @Public()
  findAllClientProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.send('product.findAllClient', {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('top-discount')
  @Public()
  getTopDiscountProducts(@Query('limit') limit?: string) {
    return this.productService.send('product.topDiscount', {
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.productService.send('product.findBySlug', { slug });
  }

  @Get(':id')
  @Public()
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
  @Public()
  searchProducts(@Query() searchDto?: SearchProductDto) {
    return this.productService.send('product.search', { searchDto });
  }
}
