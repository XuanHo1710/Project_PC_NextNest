import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Brand, BrandDocument } from './entities/brand.entity';
import {
  CreateBrandDto,
  UpdateBrandDto,
  SearchBrandDto,
} from '@project-pc/common';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  // ============= BRAND CRUD =============
  async createBrand(createBrandDto: CreateBrandDto) {
    const brand = new this.brandModel(createBrandDto);
    return await brand.save();
  }

  async findAllBrands(searchDto?: SearchBrandDto) {
    const { keyword, status, page = 1, limit = 10 } = searchDto || {};
    const query: any = { isDeleted: false };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.brandModel.find(query).skip(skip).limit(limit).exec(),
      this.brandModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneBrand(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid brand ID: ${id}`);
    }
    const brand = await this.brandModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async updateBrand(id: string, updateBrandDto: UpdateBrandDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid brand ID: ${id}`);
    }
    const brand = await this.brandModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateBrandDto },
        { new: true },
      )
      .exec();

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async removeBrand(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid brand ID: ${id}`);
    }
    const brand = await this.brandModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return { message: 'Brand deleted successfully', data: brand };
  }
}
