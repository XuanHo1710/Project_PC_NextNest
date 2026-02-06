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
  CreateBrandDto,
  MICROSERVICE,
  UpdateBrandDto,
  SearchBrandDto,
} from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('/admin/brand')
export class BrandController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly brandService: ClientProxy,
  ) {}

  @Post()
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.send('brand.create', { createBrandDto });
  }

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.send('brand.update', {
      id,
      updateBrandDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.send('brand.remove', { id });
  }
}
