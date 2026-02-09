import { Controller } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern('category.create')
  create(@Payload() data: { createCategoryDto: CreateCategoryDto }) {
    return this.categoryService.create(data.createCategoryDto);
  }

  @MessagePattern('category.findAll')
  findAll(@Payload() data: { filter?: any }) {
    return this.categoryService.findAll(data.filter);
  }

  @MessagePattern('category.updateMany')
  updateMany(@Payload() data: { dataUpdate: any }) {
    return this.categoryService.updateMany(data.dataUpdate);
  }

  @MessagePattern('category.findBySlug')
  findBySlug(@Payload() data: { slug: string }) {
    return this.categoryService.findBySlug(data.slug);
  }

  @MessagePattern('category.findOne')
  findOne(@Payload() data: { id: string }) {
    return this.categoryService.findOne(data.id);
  }

  @MessagePattern('category.update')
  update(
    @Payload() data: { id: string; updateCategoryDto: UpdateCategoryDto },
  ) {
    return this.categoryService.update(data.id, data.updateCategoryDto);
  }

  @MessagePattern('category.remove')
  remove(@Payload() data: { id: string }) {
    return this.categoryService.remove(data.id);
  }
}
