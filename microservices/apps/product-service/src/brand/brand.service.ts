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
    console.log(createBrandDto);
    const brand = new this.brandModel(createBrandDto);
    return await brand.save();
  }

  async findAllBrands(searchDto?: SearchBrandDto) {
    const {
      keyword,
      status,
      sort,
      page = 1,
      limit = 10,
      feature,
    } = searchDto || {};
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

    if (feature === 'true') {
      query.feature = true;
    } else if (feature === 'false') {
      query.feature = { $ne: true };
    }

    // Handle sorting - default to createdAt desc (newest first)
    let sortOption: any = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case 'name_asc':
          sortOption = { name: 1 };
          break;
        case 'name_desc':
          sortOption = { name: -1 };
          break;
        case 'createdAt_asc':
          sortOption = { createdAt: 1 };
          break;
        case 'createdAt_desc':
        default:
          sortOption = { createdAt: -1 };
          break;
      }
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.brandModel
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.brandModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async findBySlug(slug: string) {
    const brand = await this.brandModel
      .findOne({ slug, isDeleted: false })
      .exec();
    if (!brand) {
      throw new NotFoundException(`Brand with slug "${slug}" not found`);
    }
    return brand;
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

  // ============= UPDATE MANY BRANDS =============
  async updateManyBrands(ids: string[], typeUpdate: string) {
    const objectIds = ids
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) {
      throw new NotFoundException('No valid brand IDs provided');
    }

    let updateData: any = {};

    switch (typeUpdate) {
      case 'active':
        updateData = { status: 'ACTIVE' };
        break;
      case 'inactive':
        updateData = { status: 'INACTIVE' };
        break;
      case 'delete':
        updateData = { isDeleted: true, deletedAt: new Date() };
        break;
      default:
        throw new NotFoundException(`Invalid update type: ${typeUpdate}`);
    }

    const result = await this.brandModel
      .updateMany(
        { _id: { $in: objectIds }, isDeleted: false },
        { $set: updateData },
      )
      .exec();

    return {
      message: `Updated ${result.modifiedCount} brands successfully`,
      modifiedCount: result.modifiedCount,
    };
  }
}
