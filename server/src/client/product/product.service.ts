import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/admin/product/entities/product.entity';
import { TypeQueryProduct, TypeUpdateManyProduct } from 'types/product';


@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }


  async findAll(filter: TypeQueryProduct) {
    const sortProduct = {};

    const filterProduct = {};

    if (filter.search) {
      const keyword = filter.search;
      filterProduct["$or"] = [
        { name: { $regex: keyword, $options: "i" } }   // tìm trong tên
      ];
    }


    if (filter.sort) {
      const keySort = filter.sort.split("_")[0];
      const valueSort = filter.sort.split("_")[1];
      sortProduct[keySort] = valueSort;
    }

    if (filter.filter) {
      const keySort = filter.filter.split("_")[0];
      const valueSort = filter.filter.split("_")[1];
      filterProduct[keySort] = valueSort;
    }
    return await this.productModel.find(filterProduct).sort(sortProduct).populate("category").limit(5);
  }

  findOne(id: string) {
    return `This action returns a #${id} product`;
  }

}
