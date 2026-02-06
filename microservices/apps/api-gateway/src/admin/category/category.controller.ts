import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
} from '@nestjs/common';
import {
  CreateCategoryDto,
  MICROSERVICE,
  UpdateCategoryDto,
} from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('/admin/category')
export class CategoryController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly categoryService: ClientProxy,
  ) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.send('category.create', { createCategoryDto });
  }

  @Get()
  findAll(@Query() filter: any) {
    return this.categoryService.send('category.findAll', { filter });
  }

  @Patch('/update-many')
  updateMany(@Body() dataUpdate: any) {
    return this.categoryService.send('category.updateMany', { dataUpdate });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.send('category.findOne', { id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.send('category.update', {
      id,
      updateCategoryDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.send('category.remove', { id });
  }
}
