import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';
import { TypeQueryProduct, TypeUpdateManyProduct } from 'types/product';


@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }

  async create(createProductDto: CreateProductDto) {
    createProductDto.newPrice = createProductDto.oldPrice * (1 - createProductDto.discount);
    const product = await this.productModel.create(createProductDto);
    return product;
  }

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
    return await this.productModel.find(filterProduct).sort(sortProduct).populate("category");
  }

  findOne(id: string) {
    return `This action returns a #${id} product`;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    updateProductDto.newPrice = (updateProductDto.oldPrice ?? 0) * (1 - (updateProductDto.discount ?? 0));
    return await this.productModel.updateOne({ _id: id }, { $set: updateProductDto });
  }

  async updateMany(dataUpdate: TypeUpdateManyProduct) {
    const type = dataUpdate.typeUpdate.split(':')[0];
    switch (type) {
      case "delete": {
        return await this.productModel.deleteMany({ _id: { $in: dataUpdate.ids } });
      }
      case "update": {
        const keyUpdate = dataUpdate.typeUpdate.split(":")[1].split("_")[0];
        const valueUpdate = dataUpdate.typeUpdate.split(":")[1].split("_")[1];

        const update = {
        };

        update[keyUpdate] = valueUpdate;
        return await this.productModel.updateMany({ _id: { $in: dataUpdate.ids } }, update);
      }
    }
    return null;
  }

  async remove(id: string) {
    return await this.productModel.deleteOne({ _id: id });
  }
}
