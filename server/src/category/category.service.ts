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

  async findAll(filter: TypeQueryCategory) {

    let sortCategory = {};

    let filterCategory = {};

    if (filter.search) {
      const keyword = filter.search;
      filterCategory["$or"] = [
        { name: { $regex: keyword, $options: "i" } },   // tìm trong tên
      ];
    }


    if (filter.sort) {
      const keySort = filter.sort.split("_")[0];
      const valueSort = filter.sort.split("_")[1];
      sortCategory[keySort] = valueSort;
    }


    const employees = await this.categoryModel.find(filterCategory).sort(sortCategory);

    return employees;
  }

  findOne(id: mongoose.Types.ObjectId) {
    return `This action returns a #${id} category`;
  }

  async update(id: mongoose.Types.ObjectId, updateCategoryDto: UpdateCategoryDto) {
    const categoryCurrent = await this.categoryModel.findById(id);


    let parentCategory: Category | null = null;
    if (mongoose.Types.ObjectId.isValid(updateCategoryDto.parent as string)) {
      parentCategory = await this.categoryModel.findOne({ _id: updateCategoryDto.parent }) as Category | null;
    }

    const categoryUpdated = {
      name: updateCategoryDto.name,
      parent: parentCategory === null
        ? null
        : {
          _id: parentCategory?._id,
          name: parentCategory?.name
        },
      children: []
    };

    const category = await this.categoryModel.updateOne({ _id: id }, categoryUpdated);

    // Nếu parent cũ khác parent mới => xử lý cập nhật lại cha cũ và cha mới
    const parentOldId = categoryCurrent?.parent === null ? "" : categoryCurrent?.parent?._id?.toString();
    const parentNewId = parentCategory === null ? "" : parentCategory?._id?.toString();

    // Nếu parent thay đổi thì cập nhật cha cũ và cha mới
    if (parentOldId !== "" && parentNewId !== "" && parentOldId !== parentNewId) {
      // 1. Xoá danh mục khỏi cha cũ
      if (parentOldId) {
        await this.categoryModel.updateOne(
          { _id: parentOldId },
          { $pull: { children: { _id: id, name: categoryCurrent?.name } } }
        );
      }

      // 2. Thêm vào cha mới
      if (parentCategory) {
        await this.categoryModel.updateOne(
          { _id: parentCategory._id },
          { $addToSet: { children: { _id: id, name: updateCategoryDto.name } } }
        );
      }
    }
    return category;
  }

  async remove(id: mongoose.Types.ObjectId) {
    return await this.categoryModel.deleteOne({ _id: id });;
  }
}
