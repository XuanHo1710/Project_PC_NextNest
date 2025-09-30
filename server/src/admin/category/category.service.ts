import { BadRequestException, Injectable } from '@nestjs/common';
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

    let filterCategory = {
      parent: null
    };

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


    const categories = await this.categoryModel.find(filterCategory).sort(sortCategory);

    return categories;
  }

  async findOne(id: mongoose.Types.ObjectId) {
    return await this.categoryModel.findById(id);
  }

  async update(id: mongoose.Types.ObjectId, updateCategoryDto: UpdateCategoryDto) {
    const categoryCurrent = await this.categoryModel.findById(id);
    if (!categoryCurrent) {
      throw new BadRequestException("Category not found");
    }

    let parentCategory: Category | null = null;
    const parentId = updateCategoryDto.parent as string;

    // Tìm cha mới nếu hợp lệ
    if (mongoose.Types.ObjectId.isValid(parentId)) {
      parentCategory = await this.categoryModel.findById(parentId);
    }

    // Cập nhật thông tin chính
    const categoryUpdated = {
      name: updateCategoryDto.name,
      parent: parentCategory
        ? {
          _id: parentCategory._id,
          name: parentCategory.name
        }
        : null,
      children: categoryCurrent.children // giữ nguyên con
    };

    await this.categoryModel.updateOne({ _id: id }, categoryUpdated);

    // So sánh parent cũ và mới
    const parentOldId = categoryCurrent.parent?._id?.toString() || null;
    const parentNewId = parentCategory?._id?.toString() || null;

    // Nếu cha thay đổi thì cập nhật lại liên kết
    if (parentOldId !== parentNewId) {
      // 1. Gỡ khỏi cha cũ
      if (parentOldId) {
        await this.categoryModel.updateOne(
          { _id: parentOldId },
          { $pull: { children: { _id: id } } }
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

    return await this.categoryModel.findById(id);
  }


  async updateMany(dataUpdate: TypeUpdateManyCategory) {
    const type = dataUpdate.typeUpdate.split(':')[0];
    switch (type) {
      case "delete": {
        return dataUpdate.ids.forEach(async id => {
          await this.remove(new mongoose.Types.ObjectId(id));
        })
      }
    }
    return null;
  }


  async remove(id: mongoose.Types.ObjectId) {
    const category = await this.categoryModel.findOne({ _id: id });
    if (category === null) {
      throw new BadRequestException("Not found this category");
    }
    // Xóa con của thằng cha
    if (category !== null && category.parent !== null) {
      await this.categoryModel.updateOne(
        { _id: category?.parent?._id },
        { $pull: { children: { _id: id } } }
      );
    }


    // Gắn tất cả các con của category là parent null
    if (category.children.length > 0) {
      const listIDChildren = category.children.map(child => child._id);
      await this.categoryModel.updateMany({ _id: { $in: listIDChildren } }, { $set: { parent: null } });
    }

    return await this.categoryModel.deleteOne({ _id: id });
  }
}
