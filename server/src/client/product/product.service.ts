import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/admin/product/entities/product.entity';


@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }

  async findProductByIdCategory(categoryId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    // Đếm tổng số sản phẩm để tính totalPages
    const totalItems = await this.productModel.countDocuments({ category: categoryId });


    const products = await this.productModel.find(
      { category: categoryId },
      { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1 }
    ).skip(skip).limit(limit).populate("category");

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

  findOne(id: string) {
    return `This action returns a #${id} product`;
  }


  async searchProductByName(keyname: string = "") {
    const filterProduct = {};
    console.log(keyname);

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
