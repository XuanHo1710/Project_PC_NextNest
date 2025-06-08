import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './entities/category.entity';
import mongoose, { Model } from 'mongoose';
import { TypeUpdateManyCategory, TypeQueryCategory } from 'types/category';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<Category>) { }



  async create(createCategoryDto: CreateCategoryDto) {
    let parentCategory: Category | null = null;
    if (mongoose.Types.ObjectId.isValid(createCategoryDto.parent)) {
      parentCategory = await this.categoryModel.findOne({ _id: createCategoryDto.parent }) as Category | null;
    }

    const categoryCreated = {
      name: createCategoryDto.name,
      parent: parentCategory === null
        ? null
        : {
          _id: parentCategory?._id,
          name: parentCategory?.name
        },
      children: []
    };

    const category = await this.categoryModel.create(categoryCreated);

    if (category !== null && parentCategory !== null) {
      await this.categoryModel.updateOne({ _id: parentCategory._id }, { $addToSet: { children: { _id: category._id, name: category.name } } })
    }
    return category;
  }

  async findAll() {
    return await this.categoryModel.find({});
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
