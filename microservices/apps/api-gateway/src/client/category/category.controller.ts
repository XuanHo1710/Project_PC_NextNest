import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { MICROSERVICE } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('/client/category')
export class CategoryController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly categoryService: ClientProxy,
  ) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.categoryService.send('category.findAll', {
      filter: {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        search: search || '',
      },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.send('category.findOne', { id });
  }
}
