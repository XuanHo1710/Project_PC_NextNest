import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './entities/category.entity';
import mongoose, { Model, Types } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const parentCategory = (await this.categoryModel.findOne({
      _id: new Types.ObjectId(createCategoryDto.parentId),
    })) as Category | null;

    const categoryCreated = {
      name: createCategoryDto.name,
      parentId:
        parentCategory === null
          ? null
          : new Types.ObjectId(parentCategory?._id),
    };

    const category = new this.categoryModel(categoryCreated);
    return await category.save();
  }

  async findAll(filter: any) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const skip = (page - 1) * limit;

    const sortCategory = {};

    const filterCategory = {
      isDeleted: { $ne: true },
    };

    if (filter.search) {
      const keyword = filter.search;
      filterCategory['$or'] = [{ name: { $regex: keyword, $options: 'i' } }];
    }

    if (filter.sort) {
      const keySort = filter.sort.split('_')[0];
      const valueSort = filter.sort.split('_')[1];
      sortCategory[keySort] = valueSort === 'asc' ? 1 : -1;
    } else {
      // Default sort by createdAt descending
      sortCategory['createdAt'] = -1;
    }

    const [data, total] = await Promise.all([
      this.categoryModel
        .find(filterCategory)
        .populate('parentId', 'name') // Populate parent with name
        .sort(sortCategory)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.categoryModel.countDocuments(filterCategory),
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

  async findOne(id: string) {
    return await this.categoryModel.findById(id).lean();
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel
      .findOne({
        slug,
        isDeleted: { $ne: true },
      })
      .lean();
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const categoryCurrent = await this.categoryModel.findOne({
      _id: new Types.ObjectId(id),
    });
    if (!categoryCurrent) {
      throw new BadRequestException('Category not found');
    }

    const parentCategory = await this.categoryModel.findOne({
      _id: new Types.ObjectId(updateCategoryDto.parentId),
    });

    // Cập nhật thông tin chính
    const categoryUpdated = {
      name: updateCategoryDto.name,
      parentId: parentCategory ? new Types.ObjectId(parentCategory._id) : null,
    };

    await this.categoryModel.updateOne(
      { _id: new Types.ObjectId(id) },
      categoryUpdated,
    );

    return await this.categoryModel.findById(new Types.ObjectId(id));
  }

  async updateMany(dataUpdate: any) {
    const type = dataUpdate.typeUpdate.split(':')[0];
    switch (type) {
      case 'delete': {
        const result = dataUpdate.ids.forEach(async (id: string) => {
          await this.remove(id);
        });
        return result;
      }
    }
    return null;
  }

  async remove(id: string) {
    const category = await this.categoryModel.findOne({
      _id: new Types.ObjectId(id),
    });
    if (category === null) {
      throw new BadRequestException('Not found this category');
    }

    return await this.categoryModel.deleteOne({ _id: new Types.ObjectId(id) });
  }
}
