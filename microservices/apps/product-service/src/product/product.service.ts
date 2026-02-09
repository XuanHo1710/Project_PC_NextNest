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
import {
  Category,
  CategoryDocument,
} from '../category/entities/category.entity';
import { Brand, BrandDocument } from '../brand/entities/brand.entity';

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
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  // ============= PRODUCT CRUD =============
  async createProduct(createProductDto: CreateProductDto) {
    console.log('createProductDto', createProductDto);
    const payload = {
      ...createProductDto,
      brand: new Types.ObjectId(createProductDto.brandId),
      category: new Types.ObjectId(createProductDto.categoryId),
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
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async findOneProduct(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }
    const product = await this.productModel
      .findOne({ _id: new Types.ObjectId(id), isDeleted: false })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug, isDeleted: false })
      .populate('brand')
      .populate('category')
      .lean()
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    // Populate default variant
    if (product.defaultProductVariantId) {
      const defaultVariant = await this.productVariantModel
        .findOne({
          _id: new Types.ObjectId(product.defaultProductVariantId),
          isDeleted: false,
        })
        .exec();
      if (defaultVariant) {
        const obj = defaultVariant.toObject();

        const responseVariant = {
          ...obj,
          combination:
            obj.combination instanceof Map
              ? Object.fromEntries(obj.combination)
              : obj.combination,
        };

        product['defaultVariant'] = responseVariant;
      }
    }
    // Fetch all variants for this product
    const variants = await this.productVariantModel
      .find({ product: new Types.ObjectId(product._id), isDeleted: false })
      .exec();
    product['variants'] = variants;
    // Fetch allow values with populated attribute values
    const allowValues = await this.productAttributeAllowValueModel
      .find({ product: new Types.ObjectId(product._id), isDeleted: false })
      .populate({
        path: 'attributeValue',
        populate: { path: 'attribute' },
      })
      .exec();
    product['allowValues'] = allowValues;
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
        { _id: new Types.ObjectId(id), isDeleted: false },
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
        { _id: new Types.ObjectId(id), isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return { message: 'Product deleted successfully', data: product };
  }

  // ============= COLLECTION (Category + Brand by Slug) =============
  async findByCollection(slug: string, page = 1, limit = 12, sort?: string) {
    // Find by category slug or brand slug using $or
    const [category, brand] = await Promise.all([
      this.categoryModel
        .findOne({ slug, isDeleted: { $ne: true } })
        .lean()
        .exec(),
      this.brandModel.findOne({ slug, isDeleted: false }).lean().exec(),
    ]);

    if (!category && !brand) {
      throw new NotFoundException(
        `No category or brand found with slug "${slug}"`,
      );
    }

    const query: any = { isDeleted: false, status: 'ACTIVE' };
    const conditions: any[] = [];
    if (category) conditions.push({ category: category._id });
    if (brand) conditions.push({ brand: brand._id });

    if (conditions.length > 1) {
      query.$or = conditions;
    } else {
      Object.assign(query, conditions[0]);
    }

    let sortOption: any = { createdAt: -1 };
    if (sort) {
      const parts = sort.split('_');
      if (parts.length === 2) {
        sortOption = { [parts[0]]: parts[1] === '1' ? 1 : -1 };
      }
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('brand', 'name slug logo')
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    // Populate defaultVariant for each product
    const items = await Promise.all(
      products.map(async (product) => {
        if (product.defaultProductVariantId) {
          const variant = await this.productVariantModel
            .findOne({
              _id: product.defaultProductVariantId,
              isDeleted: false,
            })
            .lean()
            .exec();
          if (variant) {
            product['defaultVariant'] = {
              ...variant,
              combination:
                variant.combination instanceof Map
                  ? Object.fromEntries(variant.combination)
                  : variant.combination,
            };
          }
        }
        return product;
      }),
    );

    return {
      items,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      collectionInfo: {
        category: category || null,
        brand: brand || null,
      },
    };
  }

  // ============= PRODUCT VARIANT CRUD =============
  async createProductVariant(createProductVariantDto: CreateProductVariantDto) {
    const payload = {
      ...createProductVariantDto,
      product: new Types.ObjectId(createProductVariantDto.product),
    };
    const variant = new this.productVariantModel(payload);
    return await variant.save();
  }

  async findAllProductVariants(productId?: string, page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const query: any = { isDeleted: false };
    if (productId && Types.ObjectId.isValid(productId)) {
      query.product = new Types.ObjectId(productId);
    }
    const [data, total] = await Promise.all([
      this.productVariantModel
        .find(query)
        .populate('product')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productVariantModel.countDocuments(query).exec(),
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

  async findOneProductVariant(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product variant ID: ${id}`);
    }
    const variant = await this.productVariantModel
      .findOne({ _id: new Types.ObjectId(id), isDeleted: false })
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
        { _id: new Types.ObjectId(id), isDeleted: false },
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
        { _id: new Types.ObjectId(id), isDeleted: false },
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
    const payload = {
      ...createProductAttributeDto,
      createdBy: new Types.ObjectId(createProductAttributeDto.createdBy),
    };
    const attribute = new this.productAttributeModel(payload);
    return await attribute.save();
  }

  async findAllProductAttributes(
    page = 1,
    limit = 100,
    createdBy?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = { isDeleted: false };
    if (createdBy && Types.ObjectId.isValid(createdBy)) {
      query.createdBy = new Types.ObjectId(createdBy);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.productAttributeModel.find(query).skip(skip).limit(limit).exec(),
      this.productAttributeModel.countDocuments(query).exec(),
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

  async findOneProductAttribute(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product attribute ID: ${id}`);
    }
    const attribute = await this.productAttributeModel
      .findOne({ _id: new Types.ObjectId(id), isDeleted: false })
      .exec();
    if (!attribute) {
      throw new NotFoundException(`Product attribute with ID ${id} not found`);
    }
    return attribute;
  }

  async updateProductAttribute(
    id: string,
    updateProductAttributeDto: UpdateProductAttributeDto,
    createdBy?: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product attribute ID: ${id}`);
    }
    const query: any = { _id: id, isDeleted: false };
    if (createdBy) query.createdBy = new Types.ObjectId(createdBy);
    const attribute = await this.productAttributeModel
      .findOneAndUpdate(
        query,
        { $set: updateProductAttributeDto },
        { new: true },
      )
      .exec();

    if (!attribute) {
      throw new NotFoundException(
        `Product attribute with ID ${id} not found or you don't have permission`,
      );
    }
    return attribute;
  }

  async removeProductAttribute(id: string, createdBy?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product attribute ID: ${id}`);
    }
    const query: any = { _id: new Types.ObjectId(id), isDeleted: false };
    if (createdBy) query.createdBy = new Types.ObjectId(createdBy);
    const attribute = await this.productAttributeModel
      .findOneAndUpdate(
        query,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!attribute) {
      throw new NotFoundException(
        `Product attribute with ID ${id} not found or you don't have permission`,
      );
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
    const payload = {
      ...createProductAttributeValueDto,
      attribute: new Types.ObjectId(createProductAttributeValueDto.attribute),
    };
    const attributeValue = new this.productAttributeValueModel(payload);
    return await attributeValue.save();
  }

  async findAllProductAttributeValues(
    attributeId?: string,
    page = 1,
    limit = 100,
    createdBy?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = { isDeleted: false };
    if (attributeId && Types.ObjectId.isValid(attributeId)) {
      query.attribute = new Types.ObjectId(attributeId);
    }
    if (createdBy && Types.ObjectId.isValid(createdBy)) {
      query.createdBy = new Types.ObjectId(createdBy);
    }
    if (search) {
      query.$or = [
        { value: { $regex: search, $options: 'i' } },
        { label: { $regex: search, $options: 'i' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.productAttributeValueModel
        .find(query)
        .populate('attribute')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productAttributeValueModel.countDocuments(query).exec(),
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

  async findOneProductAttributeValue(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product attribute value ID: ${id}`);
    }
    const attributeValue = await this.productAttributeValueModel
      .findOne({ _id: new Types.ObjectId(id), isDeleted: false })
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
        { _id: new Types.ObjectId(id), isDeleted: false },
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
        { _id: new Types.ObjectId(id), isDeleted: false },
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
    const payload = {
      ...createProductAttributeAllowValueDto,
      product: new Types.ObjectId(createProductAttributeAllowValueDto.product),
      attributeValue: new Types.ObjectId(
        createProductAttributeAllowValueDto.attributeValue,
      ),
    };
    const allowValue = new this.productAttributeAllowValueModel(payload);
    return await allowValue.save();
  }

  async findAllProductAttributeAllowValues(
    productId?: string,
    page = 1,
    limit = 100,
  ) {
    const skip = (page - 1) * limit;
    const query: any = { isDeleted: false };
    if (productId && Types.ObjectId.isValid(productId)) {
      query.product = new Types.ObjectId(productId);
    }
    const [data, total] = await Promise.all([
      this.productAttributeAllowValueModel
        .find(query)
        .populate('product')
        .populate('attributeValue')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productAttributeAllowValueModel.countDocuments(query).exec(),
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

  async findOneProductAttributeAllowValue(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        `Invalid product attribute allow value ID: ${id}`,
      );
    }
    const allowValue = await this.productAttributeAllowValueModel
      .findOne({ _id: new Types.ObjectId(id), isDeleted: false })
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
        { _id: new Types.ObjectId(id), isDeleted: false },
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
        { _id: new Types.ObjectId(id), isDeleted: false },
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
