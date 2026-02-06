import {
  Controller,
  Get,
  Param,
  Query,
  Inject,
} from '@nestjs/common';
import {
  MICROSERVICE,
  SearchBrandDto,
} from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('/client/brand')
export class BrandController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly brandService: ClientProxy,
  ) { }

  @Get()
  findAll(@Query() searchDto?: SearchBrandDto) {
    return this.brandService.send('brand.findAll', { searchDto });
  }

  @Get('/search')
  search(@Query() searchDto: SearchBrandDto) {
    return this.brandService.send('brand.search', { searchDto });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.send('brand.findOne', { id });
  }

}
