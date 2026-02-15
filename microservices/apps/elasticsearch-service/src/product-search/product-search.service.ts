import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

const PRODUCT_VARIANT_INDEX = 'product_variants';

interface ProductVariantDoc {
  variantId: string;
  sku: string;
  subDescription?: string;
  price: number;
  stock: number;
  discount: number;
  images: string[];
  combination: Record<string, string>;
  // Flattened combination text for full-text search
  combinationText: string;
  // Parent product info
  productId: string;
  productName: string;
  productSlug: string;
  productStatus: string;
  productDescription?: string;
  // Brand & category info
  brandName?: string;
  brandId?: string;
  categoryName?: string;
  categorySlug?: string;
  categoryId?: string;
  // Computed
  displayPrice: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted: boolean;
}

@Injectable()
export class ProductSearchService implements OnModuleInit {
  private readonly logger = new Logger(ProductSearchService.name);
  private readonly esClient: Client;

  constructor() {
    this.esClient = new Client({
      node: process.env.ELASTICSEARCH_URL,
    });
  }

  async onModuleInit() {
    await this.ensureIndex();
  }

  private async ensureIndex() {
    try {
      const exists = await this.esClient.indices.exists({
        index: PRODUCT_VARIANT_INDEX,
      });

      if (!exists) {
        await this.esClient.indices.create({
          index: PRODUCT_VARIANT_INDEX,
          settings: {
            analysis: {
              analyzer: {
                vietnamese_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding'],
                },
              },
            },
            number_of_shards: 1,
            number_of_replicas: 0,
          },
          mappings: {
            properties: {
              variantId: { type: 'keyword' },
              sku: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
                fields: { keyword: { type: 'keyword' } },
              },
              subDescription: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
              },
              price: { type: 'float' },
              stock: { type: 'integer' },
              discount: { type: 'float' },
              images: { type: 'keyword' },
              combination: { type: 'object', enabled: true },
              combinationText: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
              },
              productId: { type: 'keyword' },
              productName: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
                fields: { keyword: { type: 'keyword' } },
              },
              productSlug: { type: 'keyword' },
              productStatus: { type: 'keyword' },
              productDescription: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
              },
              brandName: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
                fields: { keyword: { type: 'keyword' } },
              },
              brandId: { type: 'keyword' },
              categoryName: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
                fields: { keyword: { type: 'keyword' } },
              },
              categorySlug: { type: 'keyword' },
              categoryId: { type: 'keyword' },
              displayPrice: { type: 'float' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
              isDeleted: { type: 'boolean' },
            },
          },
        });
        this.logger.log(`Created index: ${PRODUCT_VARIANT_INDEX}`);
      } else {
        this.logger.log(`Index already exists: ${PRODUCT_VARIANT_INDEX}`);
      }
    } catch (error) {
      this.logger.error('Failed to ensure ES index:', error.message);
    }
  }

  /**
   * Build combinationText from combination map for full-text search
   * e.g. { RAM: "16GB", CPU: "i7-12700H" } => "RAM 16GB CPU i7-12700H"
   */
  private buildCombinationText(combination: Record<string, string>): string {
    if (!combination) return '';
    return Object.entries(combination)
      .map(([key, value]) => `${key} ${value}`)
      .join(' ');
  }

  /**
   * Index a single variant (create or update)
   */
  async indexVariant(data: {
    variant: any;
    product: any;
    brand?: any;
    category?: any;
  }) {
    try {
      const { variant, product, brand, category } = data;
      const combination = variant.combination || {};
      // Handle Map or plain object
      const combinationObj =
        combination instanceof Map
          ? Object.fromEntries(combination)
          : combination;

      const doc: ProductVariantDoc = {
        variantId: variant._id?.toString() || variant._id,
        sku: variant.sku || '',
        subDescription: variant.subDescription || '',
        price: variant.price || 0,
        stock: variant.stock || 0,
        discount: variant.discount || 0,
        images: variant.images || [],
        combination: combinationObj,
        combinationText: this.buildCombinationText(combinationObj),
        productId: product._id?.toString() || product._id,
        productName: product.name || '',
        productSlug: product.slug || '',
        productStatus: product.status || 'ACTIVE',
        productDescription: product.description || '',
        brandName: brand?.name || '',
        brandId: brand?._id?.toString() || brand?._id || '',
        categoryName: category?.name || '',
        categorySlug: category?.slug || '',
        categoryId: category?._id?.toString() || category?._id || '',
        displayPrice:
          (variant.price || 0) * (1 - (variant.discount || 0) / 100),
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
        isDeleted: variant.isDeleted || false,
      };

      await this.esClient.index({
        index: PRODUCT_VARIANT_INDEX,
        id: doc.variantId,
        document: doc,
      });

      this.logger.log(
        `Indexed variant ${doc.variantId} for product "${doc.productName}"`,
      );
    } catch (error) {
      this.logger.error(`Failed to index variant: ${error.message}`);
    }
  }

  /**
   * Index multiple variants at once (bulk)
   */
  async indexVariantsBulk(
    variants: {
      variant: any;
      product: any;
      brand?: any;
      category?: any;
    }[],
  ) {
    if (!variants || variants.length === 0) return;

    try {
      const body = variants.flatMap((item) => {
        const { variant, product, brand, category } = item;
        const combination = variant.combination || {};
        const combinationObj =
          combination instanceof Map
            ? Object.fromEntries(combination)
            : combination;

        const variantId = variant._id?.toString() || variant._id;

        const doc: ProductVariantDoc = {
          variantId,
          sku: variant.sku || '',
          subDescription: variant.subDescription || '',
          price: variant.price || 0,
          stock: variant.stock || 0,
          discount: variant.discount || 0,
          images: variant.images || [],
          combination: combinationObj,
          combinationText: this.buildCombinationText(combinationObj),
          productId: product._id?.toString() || product._id,
          productName: product.name || '',
          productSlug: product.slug || '',
          productStatus: product.status || 'ACTIVE',
          productDescription: product.description || '',
          brandName: brand?.name || '',
          brandId: brand?._id?.toString() || brand?._id || '',
          categoryName: category?.name || '',
          categorySlug: category?.slug || '',
          categoryId: category?._id?.toString() || category?._id || '',
          displayPrice:
            (variant.price || 0) * (1 - (variant.discount || 0) / 100),
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
          isDeleted: variant.isDeleted || false,
        };

        return [
          { index: { _index: PRODUCT_VARIANT_INDEX, _id: variantId } },
          doc,
        ];
      });

      const result = await this.esClient.bulk({
        operations: body,
        refresh: true,
      });

      if (result.errors) {
        const errorItems = result.items.filter(
          (item: any) => item.index?.error,
        );
        this.logger.error(
          `Bulk index had ${errorItems.length} errors`,
          JSON.stringify(errorItems.slice(0, 3)),
        );
      } else {
        this.logger.log(`Bulk indexed ${variants.length} variants`);
      }
    } catch (error) {
      this.logger.error(`Bulk index failed: ${error.message}`);
    }
  }

  /**
   * Remove a variant from the index
   */
  async removeVariant(variantId: string) {
    try {
      await this.esClient.delete({
        index: PRODUCT_VARIANT_INDEX,
        id: variantId,
      });
      this.logger.log(`Removed variant ${variantId} from index`);
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        this.logger.warn(`Variant ${variantId} not found in index`);
      } else {
        this.logger.error(`Failed to remove variant: ${error.message}`);
      }
    }
  }

  /**
   * Remove all variants by productId
   */
  async removeByProductId(productId: string) {
    try {
      const result = await this.esClient.deleteByQuery({
        index: PRODUCT_VARIANT_INDEX,
        query: { term: { productId } },
      });
      this.logger.log(
        `Removed ${result.deleted} variants for product ${productId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove variants for product ${productId}: ${error.message}`,
      );
    }
  }

  /**
   * Update product info across all its variants (when product name/status changes)
   */
  async updateProductInfo(data: {
    productId: string;
    product: any;
    brand?: any;
    category?: any;
  }) {
    try {
      const { productId, product, brand, category } = data;
      await this.esClient.updateByQuery({
        index: PRODUCT_VARIANT_INDEX,
        query: { term: { productId } },
        script: {
          source: `
            ctx._source.productName = params.name;
            ctx._source.productSlug = params.slug;
            ctx._source.productStatus = params.status;
            ctx._source.productDescription = params.description;
            ctx._source.brandName = params.brandName;
            ctx._source.brandId = params.brandId;
            ctx._source.categoryName = params.categoryName;
            ctx._source.categorySlug = params.categorySlug;
            ctx._source.categoryId = params.categoryId;
          `,
          params: {
            name: product.name || '',
            slug: product.slug || '',
            status: product.status || 'ACTIVE',
            description: product.description || '',
            brandName: brand?.name || '',
            brandId: brand?._id?.toString() || '',
            categoryName: category?.name || '',
            categorySlug: category?.slug || '',
            categoryId: category?._id?.toString() || '',
          },
        },
        refresh: true,
      });

      this.logger.log(`Updated product info for product ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to update product info: ${error.message}`);
    }
  }

  /**
   * Search product variants with flexible query
   * Supports searching by product name, combination values, brand, category, sku, etc.
   */
  async searchProductVariants(query: {
    q: string;
    page?: number;
    limit?: number;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    brand?: string;
  }) {
    const {
      q,
      page = 1,
      limit = 20,
      sort,
      minPrice,
      maxPrice,
      category,
      brand,
    } = query;

    const from = (page - 1) * limit;

    // Build bool query
    const must: any[] = [];
    const filter: any[] = [
      { term: { isDeleted: false } },
      { term: { productStatus: 'ACTIVE' } },
    ];

    if (q && q.trim()) {
      must.push({
        multi_match: {
          query: q.trim(),
          fields: [
            'productName^3',
            'combinationText^2',
            'sku',
            'brandName^2',
            'categoryName',
            'productDescription',
            'subDescription',
          ],
          type: 'best_fields',
          fuzziness: 'AUTO',
          operator: 'or',
        },
      });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const range: any = {};
      if (minPrice !== undefined) range.gte = minPrice;
      if (maxPrice !== undefined) range.lte = maxPrice;
      filter.push({ range: { displayPrice: range } });
    }

    if (category) {
      filter.push({ term: { categorySlug: category } });
    }

    if (brand) {
      filter.push({ term: { 'brandName.keyword': brand } });
    }

    // Sort
    let sortArr: any[] = [{ _score: 'desc' }];
    if (sort) {
      const lastUnderscore = sort.lastIndexOf('_');
      if (lastUnderscore > 0) {
        const field = sort.substring(0, lastUnderscore);
        const order =
          sort.substring(lastUnderscore + 1) === '-1' ? 'desc' : 'asc';

        const fieldMap: Record<string, string> = {
          displayPrice: 'displayPrice',
          price: 'displayPrice',
          minPrice: 'displayPrice',
          createdAt: 'createdAt',
          name: 'productName.keyword',
        };

        const esField = fieldMap[field] || field;
        sortArr = [{ [esField]: order }, { _score: 'desc' }];
      }
    }

    try {
      const result = await this.esClient.search({
        index: PRODUCT_VARIANT_INDEX,
        from,
        size: limit,
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter,
          },
        },
        sort: sortArr,
      });

      const hits = result.hits.hits;
      const total =
        typeof result.hits.total === 'number'
          ? result.hits.total
          : (result.hits.total as any)?.value || 0;

      const items = hits.map((hit: any) => ({
        _id: hit._id,
        _score: hit._score,
        ...hit._source,
      }));

      return {
        data: items,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      return {
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
        },
      };
    }
  }

  /**
   * Quick search (returns limited results for autocomplete/instant search)
   */
  async quickSearch(q: string, limit: number = 10) {
    if (!q || !q.trim()) return [];

    try {
      const result = await this.esClient.search({
        index: PRODUCT_VARIANT_INDEX,
        size: limit,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: q.trim(),
                  fields: [
                    'productName^3',
                    'combinationText^2',
                    'sku',
                    'brandName^2',
                    'categoryName',
                  ],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                },
              },
            ],
            filter: [
              { term: { isDeleted: false } },
              { term: { productStatus: 'ACTIVE' } },
            ],
          },
        },
      });

      return result.hits.hits.map((hit: any) => ({
        _id: hit._id,
        _score: hit._score,
        ...hit._source,
      }));
    } catch (error) {
      this.logger.error(`Quick search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Reindex all — triggered manually via message pattern
   */
  async reindexAll(
    allVariants: {
      variant: any;
      product: any;
      brand?: any;
      category?: any;
    }[],
  ) {
    try {
      // Delete and recreate index
      const exists = await this.esClient.indices.exists({
        index: PRODUCT_VARIANT_INDEX,
      });
      if (exists) {
        await this.esClient.indices.delete({ index: PRODUCT_VARIANT_INDEX });
      }
      await this.ensureIndex();

      // Bulk index
      if (allVariants.length > 0) {
        await this.indexVariantsBulk(allVariants);
      }

      this.logger.log(`Reindexed ${allVariants.length} variants`);
      return { success: true, count: allVariants.length };
    } catch (error) {
      this.logger.error(`Reindex failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
