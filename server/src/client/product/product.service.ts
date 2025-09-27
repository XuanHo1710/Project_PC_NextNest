import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/admin/product/entities/product.entity';


@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }

  async findProductByIdCategory(categoryId: string, page: number, sort: string) {
    const filterProduct = {
      category: categoryId
    }

    const sortProduct = {

    };

    if (sort !== "") {
      const keySort = sort.split("=")[1].split("_")[0];
      const valueSort = parseInt(sort.split("=")[1].split("_")[1]);
      sortProduct[keySort] = valueSort;
    }

    const limit = 8;
    const skip = (page - 1) * limit;
    // Đếm tổng số sản phẩm để tính totalPages
    const totalItems = await this.productModel.countDocuments({ category: categoryId });


    const products = await this.productModel.find(
      filterProduct,
      { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1 }
    ).sort(sortProduct).skip(skip).limit(limit).populate("category");

    return {
      products,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      }
    }

  }

  async findOne(id: string) {
    return await this.productModel.findOne(
      { _id: id },
      { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1, other: 1 }
    ).populate("category");
  }


  async searchProductByName(keyname: string = "") {
    const filterProduct = {};

    if (keyname !== "") {
      filterProduct["$or"] = [
        { name: { $regex: keyname, $options: "i" } },   // tìm trong tên
      ];
    }
    return await this.productModel.find(
      filterProduct,
      { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1 }
    ).limit(10).populate("category");

  }

}
