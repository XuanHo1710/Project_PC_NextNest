import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { MICROSERVICE, SearchBrandDto } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'decorators/customize';

@Controller('/client/brand')
export class BrandController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly brandService: ClientProxy,
  ) {}

  @Public()
  @Get()
  findAll(@Query() searchDto?: SearchBrandDto) {
    return this.brandService.send('brand.findAll', { searchDto });
  }

  @Public()
  @Get('/search')
  search(@Query() searchDto: SearchBrandDto) {
    return this.brandService.send('brand.search', { searchDto });
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.brandService.send('brand.findBySlug', { slug });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.send('brand.findOne', { id });
  }
}
