import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import mongoose from 'mongoose';
import { TypeQueryCategory } from 'types/category';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Get("/preview")
  findCategoryPreview() {
    return this.categoryService.findCategoryPreview();
  }

  @Get()
  findAll(@Query() filter: TypeQueryCategory) {
    return this.categoryService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: mongoose.Types.ObjectId) {
    return this.categoryService.findOne(id);
  }
}
