import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('product.create')
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @MessagePattern('product.findAll')
  findAll() {
    return this.productService.findAll();
  }

  @MessagePattern('product.findOne')
  findOne(@Payload() id: number) {
    return this.productService.findOne(id);
  }

  @MessagePattern('product.update')
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productService.update(updateProductDto.id, updateProductDto);
  }

  @MessagePattern('product.remove')
  remove(@Payload() id: number) {
    return this.productService.remove(id);
  }
}
