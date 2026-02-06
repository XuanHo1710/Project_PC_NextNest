import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BrandService } from './brand.service';
import {
  CreateBrandDto,
  UpdateBrandDto,
  SearchBrandDto,
} from '@project-pc/common';

@Controller()
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @MessagePattern('brand.create')
  create(@Payload() data: { createBrandDto: CreateBrandDto }) {
    return this.brandService.createBrand(data.createBrandDto);
  }

  @MessagePattern('brand.findAll')
  findAll(@Payload() data?: { searchDto?: SearchBrandDto }) {
    return this.brandService.findAllBrands(data?.searchDto);
  }

  @MessagePattern('brand.findOne')
  findOne(@Payload() data: { id: string }) {
    return this.brandService.findOneBrand(data.id);
  }

  @MessagePattern('brand.update')
  update(@Payload() data: { id: string; updateBrandDto: UpdateBrandDto }) {
    return this.brandService.updateBrand(data.id, data.updateBrandDto);
  }

  @MessagePattern('brand.remove')
  remove(@Payload() data: { id: string }) {
    return this.brandService.removeBrand(data.id);
  }

  @MessagePattern('brand.search')
  search(@Payload() data: { searchDto: SearchBrandDto }) {
    return this.brandService.findAllBrands(data.searchDto);
  }

  @MessagePattern('brand.updateMany')
  updateMany(@Payload() data: { ids: string[]; typeUpdate: string }) {
    return this.brandService.updateManyBrands(data.ids, data.typeUpdate);
  }
}
