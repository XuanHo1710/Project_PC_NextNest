import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { TypeQueryProduct } from 'types/product';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get("/get-by-category/:categoryId")
  findProductByIdCategory(@Param("categoryId") categoryId: string, @Query("page") page: number = 1, @Query("sort") sort: string = "") {
    return this.productService.findProductByIdCategory(categoryId, page, sort);
  }

  @Get("/search")
  searchProductByName(@Query("keyword") keyword: string) {
    return this.productService.searchProductByName(keyword);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }




}
