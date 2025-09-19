import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TypeQueryProduct, TypeUpdateManyProduct } from 'types/product';
import { Request } from 'express';
import { AdminBaseController } from 'src/admin/admin.controller';

@Controller('/admin/product')
export class ProductController extends AdminBaseController {
  constructor(private readonly productService: ProductService) {
    super();
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query() filter: TypeQueryProduct) {
    return this.productService.findAll(filter);
  }

  @Patch('/updateMany')
  updateMany(@Body() dataUpdate: TypeUpdateManyProduct) {
    return this.productService.updateMany(dataUpdate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
