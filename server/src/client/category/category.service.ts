import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import mongoose, { Model } from 'mongoose';
import { Category } from 'src/admin/category/entities/category.entity';
import { TypeQueryCategory } from 'types/category';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<Category>) { }

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


    const categories = await this.categoryModel.find(filterCategory);
    return categories;
  }

  async findCategoryPreview() {
    const categories = await this.categoryModel.aggregate([
      {
        $match: { parent: null }
      },
      {
        $lookup: {
          from: "products", localField: "_id", foreignField: "category", as: "products", pipeline:
            [
              { $limit: 7 },
              { $project: { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, slug: 1 } }
            ]
        }
      },
      { $project: { name: 1, products: 1, slug: 1 } },
      { $sort: { position: -1 } },
      { $limit: 5 }
    ]);

    return categories;
  }

  async findOne(slug: string) {
    return await this.categoryModel.findOne({ slug: slug }).exec();
  }
}
