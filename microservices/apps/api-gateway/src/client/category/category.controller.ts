import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { MICROSERVICE } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'decorators/customize';

@Controller('/client/category')
export class CategoryController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly categoryService: ClientProxy,
  ) {}

  @Public()
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

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.send('category.findBySlug', { slug });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.send('category.findOne', { id });
  }
}
