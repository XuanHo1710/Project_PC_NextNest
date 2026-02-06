import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './entities/product.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  SearchProductDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
  CreateProductAttributeValueDto,
  UpdateProductAttributeValueDto,
  CreateProductAttributeAllowValueDto,
  UpdateProductAttributeAllowValueDto,
} from '@project-pc/common';
import {
  ProductVariant,
  ProductVariantDocument,
} from './entities/product-variant';
import {
  ProductAttribute,
  ProductAttributeDocument,
} from './entities/product-attribute';
import {
  ProductAttributeValue,
  ProductAttributeValueDocument,
} from './entities/product-attribute-value';
import {
  ProductAttributeAllowValue,
  ProductAttributeAllowValueDocument,
} from './entities/product-attribute-allow-value';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private productVariantModel: Model<ProductVariantDocument>,
    @InjectModel(ProductAttribute.name)
    private productAttributeModel: Model<ProductAttributeDocument>,
    @InjectModel(ProductAttributeValue.name)
    private productAttributeValueModel: Model<ProductAttributeValueDocument>,
    @InjectModel(ProductAttributeAllowValue.name)
    private productAttributeAllowValueModel: Model<ProductAttributeAllowValueDocument>,
  ) {}

  // ============= PRODUCT CRUD =============
  async createProduct(createProductDto: CreateProductDto) {
    const payload = {
      ...createProductDto,
      brand: createProductDto.brandId,
      category: createProductDto.categoryId,
    };
    const product = new this.productModel(payload);
    return await product.save();
  }

  async findAllProducts(searchDto?: SearchProductDto) {
    const { keyword, status, page = 1, limit = 10 } = searchDto || {};
    const query: any = { isDeleted: false };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.productModel.find(query).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneProduct(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }
    const product = await this.productModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }

    if (updateProductDto.brandId) {
      updateProductDto['brand'] = updateProductDto.brandId;
    }
    if (updateProductDto.categoryId) {
      updateProductDto['category'] = updateProductDto.categoryId;
    }
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateProductDto },
        { new: true },
      )
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async removeProduct(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return { message: 'Product deleted successfully', data: product };
  }

  // ============= PRODUCT VARIANT CRUD =============
  async createProductVariant(createProductVariantDto: CreateProductVariantDto) {
    const variant = new this.productVariantModel(createProductVariantDto);
    return await variant.save();
  }

  async findAllProductVariants(productId?: string) {
    const query: any = { isDeleted: false };
    if (productId && Types.ObjectId.isValid(productId)) {
      query.product = productId;
    }
    return await this.productVariantModel
      .find(query)
      .populate('product')
      .exec();
  }

  async findOneProductVariant(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product variant ID: ${id}`);
    }
    const variant = await this.productVariantModel
      .findOne({ _id: id, isDeleted: false })
      .populate('product')
      .exec();
    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }
    return variant;
  }

  async updateProductVariant(
    id: string,
    updateProductVariantDto: UpdateProductVariantDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product variant ID: ${id}`);
    }
    const variant = await this.productVariantModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateProductVariantDto },
        { new: true },
      )
      .populate('product')
      .exec();

    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }
    return variant;
  }

  async removeProductVariant(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product variant ID: ${id}`);
    }
    const variant = await this.productVariantModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }
    return { message: 'Product variant deleted successfully', data: variant };
  }

  // ============= PRODUCT ATTRIBUTE CRUD =============
  async createProductAttribute(
    createProductAttributeDto: CreateProductAttributeDto,
  ) {
    const attribute = new this.productAttributeModel(createProductAttributeDto);
    return await attribute.save();
  }

  async findAllProductAttributes() {
    return await this.productAttributeModel.find({ isDeleted: false }).exec();
  }

  async findOneProductAttribute(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product attribute ID: ${id}`);
    }
    const attribute = await this.productAttributeModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    if (!attribute) {
      throw new NotFoundException(`Product attribute with ID ${id} not found`);
    }
    return attribute;
  }

  async updateProductAttribute(
    id: string,
    updateProductAttributeDto: UpdateProductAttributeDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product attribute ID: ${id}`);
    }
    const attribute = await this.productAttributeModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateProductAttributeDto },
        { new: true },
      )
      .exec();

    if (!attribute) {
      throw new NotFoundException(`Product attribute with ID ${id} not found`);
    }
    return attribute;
  }

  async removeProductAttribute(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product attribute ID: ${id}`);
    }
    const attribute = await this.productAttributeModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!attribute) {
      throw new NotFoundException(`Product attribute with ID ${id} not found`);
    }
    return {
      message: 'Product attribute deleted successfully',
      data: attribute,
    };
  }

  // ============= PRODUCT ATTRIBUTE VALUE CRUD =============
  async createProductAttributeValue(
    createProductAttributeValueDto: CreateProductAttributeValueDto,
  ) {
    const attributeValue = new this.productAttributeValueModel(
      createProductAttributeValueDto,
    );
    return await attributeValue.save();
  }

  async findAllProductAttributeValues(attributeId?: string) {
    const query: any = { isDeleted: false };
    if (attributeId && Types.ObjectId.isValid(attributeId)) {
      query.attribute = attributeId;
    }
    return await this.productAttributeValueModel
      .find(query)
      .populate('attribute')
      .exec();
  }

  async findOneProductAttributeValue(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product attribute value ID: ${id}`);
    }
    const attributeValue = await this.productAttributeValueModel
      .findOne({ _id: id, isDeleted: false })
      .populate('attribute')
      .exec();
    if (!attributeValue) {
      throw new NotFoundException(
        `Product attribute value with ID ${id} not found`,
      );
    }
    return attributeValue;
  }

  async updateProductAttributeValue(
    id: string,
    updateProductAttributeValueDto: UpdateProductAttributeValueDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product attribute value ID: ${id}`);
    }
    const attributeValue = await this.productAttributeValueModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateProductAttributeValueDto },
        { new: true },
      )
      .populate('attribute')
      .exec();

    if (!attributeValue) {
      throw new NotFoundException(
        `Product attribute value with ID ${id} not found`,
      );
    }
    return attributeValue;
  }

  async removeProductAttributeValue(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product attribute value ID: ${id}`);
    }
    const attributeValue = await this.productAttributeValueModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!attributeValue) {
      throw new NotFoundException(
        `Product attribute value with ID ${id} not found`,
      );
    }
    return {
      message: 'Product attribute value deleted successfully',
      data: attributeValue,
    };
  }

  // ============= PRODUCT ATTRIBUTE ALLOW VALUE CRUD =============
  async createProductAttributeAllowValue(
    createProductAttributeAllowValueDto: CreateProductAttributeAllowValueDto,
  ) {
    const allowValue = new this.productAttributeAllowValueModel(
      createProductAttributeAllowValueDto,
    );
    return await allowValue.save();
  }

  async findAllProductAttributeAllowValues(productId?: string) {
    const query: any = { isDeleted: false };
    if (productId && Types.ObjectId.isValid(productId)) {
      query.product = productId;
    }
    return await this.productAttributeAllowValueModel
      .find(query)
      .populate('product')
      .populate('attributeValue')
      .exec();
  }

  async findOneProductAttributeAllowValue(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        `Invalid product attribute allow value ID: ${id}`,
      );
    }
    const allowValue = await this.productAttributeAllowValueModel
      .findOne({ _id: id, isDeleted: false })
      .populate('product')
      .populate('attributeValue')
      .exec();
    if (!allowValue) {
      throw new NotFoundException(
        `Product attribute allow value with ID ${id} not found`,
      );
    }
    return allowValue;
  }

  async updateProductAttributeAllowValue(
    id: string,
    updateProductAttributeAllowValueDto: UpdateProductAttributeAllowValueDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        `Invalid product attribute allow value ID: ${id}`,
      );
    }
    const allowValue = await this.productAttributeAllowValueModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateProductAttributeAllowValueDto },
        { new: true },
      )
      .populate('product')
      .populate('attributeValue')
      .exec();

    if (!allowValue) {
      throw new NotFoundException(
        `Product attribute allow value with ID ${id} not found`,
      );
    }
    return allowValue;
  }

  async removeProductAttributeAllowValue(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        `Invalid product attribute allow value ID: ${id}`,
      );
    }
    const allowValue = await this.productAttributeAllowValueModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!allowValue) {
      throw new NotFoundException(
        `Product attribute allow value with ID ${id} not found`,
      );
    }
    return {
      message: 'Product attribute allow value deleted successfully',
      data: allowValue,
    };
  }
}
