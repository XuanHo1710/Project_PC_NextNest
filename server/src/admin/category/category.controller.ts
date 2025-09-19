import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import mongoose from 'mongoose';
import { TypeQueryCategory, TypeUpdateManyCategory } from 'types/category';
import { AdminBaseController } from 'src/admin/admin.controller';

@Controller('/admin/category')
export class CategoryController extends AdminBaseController {
  constructor(private readonly categoryService: CategoryService) {
    super();
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query() filter: TypeQueryCategory) {
    return this.categoryService.findAll(filter);
  }

  @Patch('/updateMany')
  updateMany(@Body() dataUpdate: TypeUpdateManyCategory) {
    return this.categoryService.updateMany(dataUpdate);
  }

  @Get(':id')
  findOne(@Param('id') id: mongoose.Types.ObjectId) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: mongoose.Types.ObjectId, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: mongoose.Types.ObjectId) {
    return this.categoryService.remove(id);
  }
}
