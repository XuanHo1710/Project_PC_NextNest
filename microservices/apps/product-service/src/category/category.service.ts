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
    const parentId = createCategoryDto.parentId;
    const hasValidParent =
      !!parentId &&
      typeof parentId === 'string' &&
      parentId.trim() !== '' &&
      Types.ObjectId.isValid(parentId);

    const parentCategory = hasValidParent
      ? ((await this.categoryModel.findOne({
          _id: new Types.ObjectId(parentId),
          isDeleted: { $ne: true },
        })) as Category | null)
      : null;

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

    const parentId = updateCategoryDto.parentId;
    const hasValidParent =
      !!parentId &&
      typeof parentId === 'string' &&
      parentId.trim() !== '' &&
      Types.ObjectId.isValid(parentId);

    const parentCategory = hasValidParent
      ? await this.categoryModel.findOne({
          _id: new Types.ObjectId(parentId),
          isDeleted: { $ne: true },
        })
      : null;

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
        // remove() performs a hard delete (deleteOne), so the bulk path uses
        // deleteMany to keep the same hard-delete semantics.
        const objectIds = (dataUpdate.ids || [])
          .filter((id: string) => Types.ObjectId.isValid(id))
          .map((id: string) => new Types.ObjectId(id));
        return await this.categoryModel.deleteMany({
          _id: { $in: objectIds },
        });
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
