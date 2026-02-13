import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const payload: any = {
      ...createProductDto,
      brand: new Types.ObjectId(createProductDto.brandId),
      category: new Types.ObjectId(createProductDto.categoryId),
    };
    if (createProductDto.createdBy) {
      payload.createdBy = new Types.ObjectId(createProductDto.createdBy);
    }
    const product = new this.productModel(payload);
    return await product.save();
  }

  async findAllProducts(searchDto?: SearchProductDto) {
    const { keyword, q, status, page = 1, limit = 10, sort } = searchDto || {};
    const searchTerm = keyword || q;
    const query: any = { isDeleted: false };

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // Parse sort: e.g. "minPrice_1" → { minPrice: 1 }, "createdAt_-1" → { createdAt: -1 }
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort) {
      const lastUnderscore = sort.lastIndexOf('_');
      if (lastUnderscore > 0) {
        const field = sort.substring(0, lastUnderscore);
        const order = parseInt(sort.substring(lastUnderscore + 1), 10);
        if (field && (order === 1 || order === -1)) {
          sortObj = { [field]: order };
        }
      }
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('brand', 'name slug logo')
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    // Populate defaultVariant for each product (same pattern as findAllClientProducts)
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
      data: items,
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
      .populate('brand', 'name slug logo')
      .populate('category', 'name slug')
      .lean()
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    // Populate defaultVariant
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
  }

  async findBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug, isDeleted: false })
      .populate('brand')
      .populate('category')
      .populate('createdBy', 'fullname email avatar phone')
      .lean()
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    // Populate default variant
    let defaultVariant: any = null;
    if (product.defaultProductVariantId) {
      defaultVariant = await this.productVariantModel
        .findOne({
          _id: new Types.ObjectId(product.defaultProductVariantId),
          isDeleted: false,
        })
        .exec();
    }

    // Fetch all variants for this product
    const variants = await this.productVariantModel
      .find({ product: new Types.ObjectId(product._id), isDeleted: false })
      .exec();

    // If default variant was soft-deleted, fall back to first available variant
    if (!defaultVariant && variants.length > 0) {
      defaultVariant = variants[0];
    }

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

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    createdBy?: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }

    if (updateProductDto.brandId) {
      updateProductDto['brand'] = new Types.ObjectId(updateProductDto.brandId);
    }
    if (updateProductDto.categoryId) {
      updateProductDto['category'] = new Types.ObjectId(
        updateProductDto.categoryId,
      );
    }
    const query: any = { _id: new Types.ObjectId(id), isDeleted: false };
    if (createdBy) query.createdBy = new Types.ObjectId(createdBy);
    const product = await this.productModel
      .findOneAndUpdate(query, { $set: updateProductDto }, { new: true })
      .exec();

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${id} not found or you don't have permission`,
      );
    }
    return product;
  }

  async removeProduct(id: string, createdBy?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }
    const query: any = { _id: new Types.ObjectId(id), isDeleted: false };
    if (createdBy) query.createdBy = new Types.ObjectId(createdBy);
    const product = await this.productModel
      .findOneAndUpdate(
        query,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${id} not found or you don't have permission`,
      );
    }
    return { message: 'Product deleted successfully', data: product };
  }

  // ============= MY PRODUCTS (Guest) =============
  async findMyProducts(
    createdBy: string,
    page = 1,
    limit = 10,
    search?: string,
  ) {
    const query: any = {
      isDeleted: false,
      createdBy: new Types.ObjectId(createdBy),
    };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('brand', 'name slug logo')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

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
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  // ============= CLIENT PRODUCT APIs =============

  /**
   * Get products for client homepage "Gợi ý cho bạn"
   * Returns ACTIVE products with populated defaultVariant
   */
  async findAllClientProducts(page = 1, limit = 20) {
    const query: any = { isDeleted: false, status: 'ACTIVE' };
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('brand', 'name slug logo')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

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
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get top discount products (highest discount variants)
   * Also auto-updates each product's defaultProductVariantId to the highest discount variant
   */
  async getTopDiscountProducts(limit = 20) {
    // Find top discount variants, grouped by product
    const topVariants = await this.productVariantModel.aggregate([
      { $match: { isDeleted: false, discount: { $gt: 0 }, stock: { $gt: 0 } } },
      { $sort: { discount: -1 } },
      {
        $group: {
          _id: '$product',
          topVariant: { $first: '$$ROOT' },
        },
      },
      { $sort: { 'topVariant.discount': -1 } },
      { $limit: limit },
    ]);

    if (topVariants.length === 0) return [];

    // Auto-update defaultProductVariantId for each product
    const updatePromises = topVariants.map((item) =>
      this.productModel.updateOne(
        { _id: item._id },
        { $set: { defaultProductVariantId: item.topVariant._id } },
      ),
    );
    await Promise.all(updatePromises);

    // Fetch products with populated fields
    const productIds = topVariants.map((v) => v._id);
    const products = await this.productModel
      .find({ _id: { $in: productIds }, isDeleted: false, status: 'ACTIVE' })
      .populate('brand', 'name slug logo')
      .populate('category', 'name slug')
      .lean()
      .exec();

    // Attach the top variant as defaultVariant
    const variantMap = new Map(
      topVariants.map((v) => [v._id.toString(), v.topVariant]),
    );

    const items = products
      .map((product) => {
        const variant = variantMap.get(product._id.toString());
        if (variant) {
          product['defaultVariant'] = {
            ...variant,
            combination:
              variant.combination instanceof Map
                ? Object.fromEntries(variant.combination)
                : variant.combination,
          };
        }
        return product;
      })
      .sort((a, b) => {
        const dA = a['defaultVariant']?.discount || 0;
        const dB = b['defaultVariant']?.discount || 0;
        return dB - dA;
      });

    return items;
  }

  // ============= COLLECTION (Category + Brand by Slug) =============
  async findByCollection(
    slug: string,
    page = 1,
    limit = 12,
    sort?: string,
    filters?: { cpu?: string; ram?: string; storage?: string },
  ) {
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

    // Apply CPU/RAM/Storage filters via variant combination matching
    if (filters?.cpu || filters?.ram || filters?.storage) {
      const variantFilter: any = { isDeleted: false };
      const combinationConditions: any[] = [];

      if (filters.cpu) {
        // Match any combination key containing 'cpu' (case-insensitive) with value containing the filter
        combinationConditions.push({
          $or: [
            { [`combination.CPU`]: { $regex: filters.cpu, $options: 'i' } },
            { [`combination.cpu`]: { $regex: filters.cpu, $options: 'i' } },
            { [`combination.Cpu`]: { $regex: filters.cpu, $options: 'i' } },
          ],
        });
      }

      if (filters.ram) {
        combinationConditions.push({
          $or: [
            { [`combination.RAM`]: { $regex: filters.ram, $options: 'i' } },
            { [`combination.ram`]: { $regex: filters.ram, $options: 'i' } },
            { [`combination.Ram`]: { $regex: filters.ram, $options: 'i' } },
          ],
        });
      }

      if (filters.storage) {
        combinationConditions.push({
          $or: [
            {
              [`combination.Storage`]: {
                $regex: filters.storage,
                $options: 'i',
              },
            },
            {
              [`combination.storage`]: {
                $regex: filters.storage,
                $options: 'i',
              },
            },
            {
              [`combination.Dung lượng`]: {
                $regex: filters.storage,
                $options: 'i',
              },
            },
            {
              [`combination.SSD`]: {
                $regex: filters.storage,
                $options: 'i',
              },
            },
            {
              [`combination.Ổ cứng`]: {
                $regex: filters.storage,
                $options: 'i',
              },
            },
          ],
        });
      }

      if (combinationConditions.length > 0) {
        variantFilter.$and = combinationConditions;
      }

      const matchingVariants = await this.productVariantModel
        .find(variantFilter)
        .distinct('product')
        .exec();

      query._id = { ...query._id, $in: matchingVariants };
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
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
      collectionInfo: {
        category: category || null,
        brand: brand || null,
      },
    };
  }

  // ============= PRODUCT VARIANT CRUD =============

  /**
   * Recompute minPrice/maxPrice on the parent Product from its active variants.
   * The "price" used is the effective (discounted) price: price * (1 - discount/100)
   */
  private async recomputeProductPrices(productId: string) {
    const variants = await this.productVariantModel
      .find({ product: new Types.ObjectId(productId), isDeleted: false })
      .select('price discount stock')
      .lean()
      .exec();

    if (variants.length === 0) {
      await this.productModel.updateOne(
        { _id: new Types.ObjectId(productId) },
        { $set: { minPrice: 0, maxPrice: 0, totalStock: 0 } },
      );
      return;
    }

    const effectivePrices = variants.map((v) =>
      Math.round(v.price * (1 - (v.discount || 0) / 100)),
    );
    const minPrice = Math.min(...effectivePrices);
    const maxPrice = Math.max(...effectivePrices);
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    await this.productModel.updateOne(
      { _id: new Types.ObjectId(productId) },
      { $set: { minPrice, maxPrice, totalStock } },
    );
  }

  async createProductVariant(createProductVariantDto: CreateProductVariantDto) {
    const payload = {
      ...createProductVariantDto,
      product: new Types.ObjectId(createProductVariantDto.product),
    };
    const variant = new this.productVariantModel(payload);
    const saved = await variant.save();
    await this.recomputeProductPrices(createProductVariantDto.product);
    return saved;
  }

  async createBulkProductVariants(variants: CreateProductVariantDto[]) {
    const results: any[] = [];
    for (const dto of variants) {
      const payload = {
        ...dto,
        product: new Types.ObjectId(dto.product),
      };
      const variant = new this.productVariantModel(payload);
      const variantSaved = (await variant.save()).toObject();
      results.push(variantSaved);
    }
    // Recompute prices for the parent product
    if (variants.length > 0) {
      await this.recomputeProductPrices(variants[0].product);
    }
    return results;
  }

  async updateBulkProductVariants(
    updates: { id: string; data: UpdateProductVariantDto }[],
  ) {
    const results: any[] = [];
    for (const update of updates) {
      const result = await this.updateProductVariant(update.id, update.data);
      results.push(result);
    }
    // Recompute prices — get productId from first updated variant
    if (results.length > 0 && results[0]?.product) {
      const pid =
        typeof results[0].product === 'object'
          ? results[0].product._id?.toString()
          : results[0].product.toString();
      if (pid) await this.recomputeProductPrices(pid);
    }
    return results;
  }

  async deleteAllProductVariants(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException(`Invalid product ID: ${productId}`);
    }
    const query = { product: new Types.ObjectId(productId), isDeleted: false };
    const result = await this.productVariantModel
      .updateMany(query, { $set: { isDeleted: true, deletedAt: new Date() } })
      .exec();
    return result;
  }

  async deleteAndRecreateProductVariants(
    productId: string,
    newVariants: CreateProductVariantDto[],
  ) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException(`Invalid product ID: ${productId}`);
    }

    // Hard delete existing variants
    await this.productVariantModel
      .deleteMany({ product: new Types.ObjectId(productId) })
      .exec();

    // Create new variants
    if (!newVariants || newVariants.length === 0) {
      await this.recomputeProductPrices(productId);
      return [];
    }

    const results = await this.productVariantModel.insertMany(
      newVariants.map((dto) => ({
        ...dto,
        product: new Types.ObjectId(productId),
      })),
    );
    await this.recomputeProductPrices(productId);
    return results;
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
        {
          $set: {
            ...updateProductVariantDto,
            product: new Types.ObjectId(updateProductVariantDto.product),
          },
        },
        { new: true },
      )
      .populate('product')
      .lean()
      .exec();

    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }
    // Recompute parent product prices
    const pid =
      typeof variant.product === 'object'
        ? (variant.product as any)._id?.toString()
        : variant.product;
    if (pid) await this.recomputeProductPrices(pid);
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
    // Recompute parent product prices after soft-delete
    if (variant.product) {
      await this.recomputeProductPrices(variant.product.toString());
    }
    return { message: 'Product variant deleted successfully', data: variant };
  }

  // Decrement stock for a product variant (used after successful payment)
  async decrementVariantStock(variantId: string, quantity: number) {
    if (!Types.ObjectId.isValid(variantId)) {
      throw new NotFoundException(`Invalid product variant ID: ${variantId}`);
    }

    const variant = await this.productVariantModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(variantId),
          isDeleted: false,
          stock: { $gte: quantity },
        },
        { $inc: { stock: -quantity } },
        { new: true },
      )
      .exec();

    if (!variant) {
      throw new BadRequestException(
        `Không thể trừ tồn kho cho variant ${variantId}. Có thể hết hàng.`,
      );
    }

    return variant;
  }

  // Increment stock for a product variant (saga compensation / rollback)
  async incrementVariantStock(variantId: string, quantity: number) {
    if (!Types.ObjectId.isValid(variantId)) {
      throw new NotFoundException(`Invalid product variant ID: ${variantId}`);
    }

    const variant = await this.productVariantModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(variantId),
          isDeleted: false,
        },
        { $inc: { stock: quantity } },
        { new: true },
      )
      .exec();

    if (!variant) {
      throw new NotFoundException(
        `Product variant ${variantId} not found for stock restoration`,
      );
    }

    return variant;
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

  // ============= SELLER HELPERS =============

  /**
   * Get all variant IDs for products created by a specific user (seller).
   * Used to find orders containing seller's products.
   */
  async getVariantIdsByCreator(createdBy: string): Promise<string[]> {
    const products = await this.productModel
      .find({
        createdBy: new Types.ObjectId(createdBy),
        isDeleted: false,
      })
      .select('_id')
      .lean()
      .exec();

    if (products.length === 0) return [];

    const productIds = products.map((p) => p._id);
    const variants = await this.productVariantModel
      .find({
        product: { $in: productIds },
        isDeleted: false,
      })
      .select('_id')
      .lean()
      .exec();

    return variants.map((v) => v._id.toString());
  }
}
