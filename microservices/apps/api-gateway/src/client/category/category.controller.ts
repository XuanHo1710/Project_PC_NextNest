import {
  Controller,
  Get,
  Param,
  Query,
  Inject,
} from '@nestjs/common';
import {
  MICROSERVICE,
} from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('/client/category')
export class CategoryController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly categoryService: ClientProxy,
  ) { }

  @Get()
  findAll(@Query() filter: any) {
    return this.categoryService.send('category.findAll', { filter });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.send('category.findOne', { id });
  }

}
