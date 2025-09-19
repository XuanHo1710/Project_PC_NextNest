import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { TypeQueryDiscount, TypeUpdateManyDiscount } from 'types/discount';
import mongoose from 'mongoose';
import { AdminBaseController } from 'src/admin/admin.controller';

@Controller('/admin/discount')
export class DiscountController extends AdminBaseController {
  constructor(private readonly discountService: DiscountService) {
    super();
  }

  @Post()
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @Get()
  findAll(@Query() filter: TypeQueryDiscount) {
    return this.discountService.findAll(filter);
  }

  @Patch('/updateMany')
  updateMany(@Body() dataUpdate: TypeUpdateManyDiscount) {
    return this.discountService.updateMany(dataUpdate);
  }

  @Get(':id')
  findOne(@Param('id') id: mongoose.Types.ObjectId) {
    return this.discountService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: mongoose.Types.ObjectId, @Body() updateDiscountDto: UpdateDiscountDto) {
    return this.discountService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: mongoose.Types.ObjectId) {
    return this.discountService.remove(id);
  }
}
