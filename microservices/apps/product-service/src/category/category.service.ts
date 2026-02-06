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
      parent:
        parentCategory === null
          ? null
          : new Types.ObjectId(parentCategory?._id),
    };

    const category = new this.categoryModel(categoryCreated);
    return await category.save();
  }

  async findAll(filter: any) {
    let sortCategory = {};

    let filterCategory = {
      parent: null,
    };

    if (filter.search) {
      const keyword = filter.search;
      filterCategory['$or'] = [
        { name: { $regex: keyword, $options: 'i' } }, // tìm trong tên
      ];
    }

    if (filter.sort) {
      const keySort = filter.sort.split('_')[0];
      const valueSort = filter.sort.split('_')[1];
      sortCategory[keySort] = valueSort;
    }

    const categories = await this.categoryModel
      .find(filterCategory)
      .sort(sortCategory);

    return categories;
  }

  async findOne(id: string) {
    return await this.categoryModel.findById(id);
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
