import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
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

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoryService.findOne(slug);
  }
}
