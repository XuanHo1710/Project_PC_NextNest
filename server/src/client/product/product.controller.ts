import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { TypeQueryProduct } from 'types/product';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get()
  findAll(@Query() filter: TypeQueryProduct) {
    return this.productService.findAll(filter);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }


}
