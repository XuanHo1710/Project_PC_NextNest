import { Controller, Get, Param, Delete, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE, SearchProductDto } from '@project-pc/common';

@Controller('/admin/product')
export class ProductController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Get()
  findAllProducts(@Query() searchDto?: SearchProductDto) {
    return this.productService.send('product.findAll', { searchDto });
  }

  @Get(':id')
  findOneProduct(@Param('id') id: string) {
    return this.productService.send('product.findOne', { id });
  }

  @Delete(':id')
  removeProduct(@Param('id') id: string) {
    return this.productService.send('product.remove', { id });
  }

  @Get('search')
  searchProducts(@Query() searchDto: SearchProductDto) {
    return this.productService.send('product.findAll', { searchDto });
  }
}
