import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { TypeQueryDiscount, TypeUpdateManyDiscount } from 'types/discount';
import { InjectModel } from '@nestjs/mongoose';
import { Discount } from './entities/discount.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class DiscountService {
  constructor(@InjectModel(Discount.name) private discountModel: Model<Discount>) { }

  async create(createDiscountDto: CreateDiscountDto) {
    if (createDiscountDto.startDate < new Date())
      throw new BadRequestException("Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại");

    if (createDiscountDto.startDate > createDiscountDto.endDate)
      throw new BadRequestException("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");

    const discount = await this.discountModel.create(createDiscountDto)
    return discount;
  }

  async findAll(filter: TypeQueryDiscount) {
    const sortDiscount = {};

    const filterDiscount = {};

    if (filter.search) {
      const keyword = filter.search;
      filterDiscount["$or"] = [
        { name: { $regex: keyword, $options: "i" } }   // tìm trong tên
      ];
    }


    if (filter.sort) {
      const keySort = filter.sort.split("_")[0];
      const valueSort = filter.sort.split("_")[1];
      sortDiscount[keySort] = valueSort;
    }

    if (filter.filter) {
      const keySort = filter.filter.split("_")[0];
      const valueSort = filter.filter.split("_")[1];
      filterDiscount[keySort] = valueSort;
    }


    const discounts = await this.discountModel.find(filterDiscount).sort(sortDiscount);
    return discounts;
  }

  async findOne(id: mongoose.Types.ObjectId) {
    return await this.discountModel.findById(id);
  }

  async update(id: mongoose.Types.ObjectId, updateDiscountDto: UpdateDiscountDto) {
    return await this.discountModel.updateOne({ _id: id }, updateDiscountDto);
  }

  async updateMany(dataUpdate: TypeUpdateManyDiscount) {
    const type = dataUpdate.typeUpdate.split(':')[0];
    switch (type) {
      case "delete": {
        return await this.discountModel.deleteMany({ _id: { $in: dataUpdate.ids } });
      }
      case "update": {
        const keyUpdate = dataUpdate.typeUpdate.split(":")[1].split("_")[0];
        const valueUpdate = dataUpdate.typeUpdate.split(":")[1].split("_")[1];

        const update = {
        };

        update[keyUpdate] = valueUpdate;
        return await this.discountModel.updateMany({ _id: { $in: dataUpdate.ids } }, update);
      }
    }
    return null;
  }

  async remove(id: mongoose.Types.ObjectId) {
    return await this.discountModel.deleteOne({ _id: id });
  }
}
