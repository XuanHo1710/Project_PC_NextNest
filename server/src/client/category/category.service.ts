import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import mongoose, { Model } from 'mongoose';
import { Category } from 'src/admin/category/entities/category.entity';
import { TypeQueryCategory } from 'types/category';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async findAll(filter: TypeQueryCategory) {
    // Generate cache key based on filter
    const cacheKey = `categories:all:${JSON.stringify(filter)}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log('📦 Cache HIT for findAll categories');
      return cached;
    }

    console.log('🔍 Cache MISS for findAll categories - querying MongoDB');

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

    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, categories, 60 * 60 * 1000);

    return categories;
  }

  async findCategoryPreview() {
    const cacheKey = 'categories:preview';

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log('📦 Cache HIT for category preview');
      return cached;
    }

    console.log('🔍 Cache MISS for category preview - querying MongoDB');

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

    // Cache for 2 hours (preview data doesn't change often)
    await this.cacheManager.set(cacheKey, categories, 2 * 60 * 60 * 1000);

    return categories;
  }

  async findOne(slug: string) {
    const cacheKey = `category:slug:${slug}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache HIT for category slug: ${slug}`);
      return cached;
    }

    console.log(`🔍 Cache MISS for category slug: ${slug} - querying MongoDB`);

    const category = await this.categoryModel.findOne({ slug: slug }).exec();

    if (category) {
      // Cache for 1 hour
      await this.cacheManager.set(cacheKey, category, 60 * 60 * 1000);
    }

    return category;
  }

  // Cache invalidation method (to be called when categories are updated in admin)
  async invalidateCache() {
    console.log('🗑️  Invalidating all category caches');
    // Delete specific cache keys
    await this.cacheManager.del('categories:preview');
    // For production, you might want to track all cache keys or use Redis pattern matching
  }
}
