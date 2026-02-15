import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ProductSearchService } from './product-search.service';

@Controller()
export class ProductSearchController {
  private readonly logger = new Logger(ProductSearchController.name);

  constructor(private readonly productSearchService: ProductSearchService) {}

  private ackMsg(context: RmqContext) {
    try {
      const channel = context.getChannelRef();
      const msg = context.getMessage();
      channel.ack(msg);
    } catch {
      // Ignore if not RMQ context (e.g., TCP)
    }
  }

  // ============= EVENT HANDLERS (from product-service via RMQ) =============

  /**
   * Product created — index all its variants
   */
  @EventPattern('es.product.created')
  async handleProductCreated(
    @Payload()
    data: {
      product: any;
      variants: any[];
      brand?: any;
      category?: any;
      attributeMap?: Record<string, string>;
    },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Product created: ${data.product?.name}`);
    const items = (data.variants || []).map((v) => ({
      variant: v,
      product: data.product,
      brand: data.brand,
      category: data.category,
      attributeMap: data.attributeMap,
    }));
    if (items.length > 0) {
      await this.productSearchService.indexVariantsBulk(items);
    }
    this.ackMsg(context);
  }

  /**
   * Product updated — update product info across all variants
   */
  @EventPattern('es.product.updated')
  async handleProductUpdated(
    @Payload()
    data: {
      productId: string;
      product: any;
      brand?: any;
      category?: any;
    },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Product updated: ${data.product?.name}`);
    await this.productSearchService.updateProductInfo(data);
    this.ackMsg(context);
  }

  /**
   * Product deleted — remove all variants from index
   */
  @EventPattern('es.product.deleted')
  async handleProductDeleted(
    @Payload() data: { productId: string },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Product deleted: ${data.productId}`);
    await this.productSearchService.removeByProductId(data.productId);
    this.ackMsg(context);
  }

  /**
   * Variant created or updated — index the variant
   */
  @EventPattern('es.variant.upserted')
  async handleVariantUpserted(
    @Payload()
    data: {
      variant: any;
      product: any;
      brand?: any;
      category?: any;
      attributeMap?: Record<string, string>;
    },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Variant upserted: ${data.variant?._id}`);
    await this.productSearchService.indexVariant(data);
    this.ackMsg(context);
  }

  /**
   * Variants bulk upserted (create/recreate)
   */
  @EventPattern('es.variant.bulkUpserted')
  async handleVariantBulkUpserted(
    @Payload()
    data: {
      variants: any[];
      product: any;
      brand?: any;
      category?: any;
    },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(
      `Variants bulk upserted: ${data.variants?.length} for product ${data.product?.name}`,
    );
    const items = (data.variants || []).map((v) => ({
      variant: v,
      product: data.product,
      brand: data.brand,
      category: data.category,
      attributeMap: (data as any).attributeMap,
    }));
    if (items.length > 0) {
      await this.productSearchService.indexVariantsBulk(items);
    }
    this.ackMsg(context);
  }

  /**
   * Variant deleted
   */
  @EventPattern('es.variant.deleted')
  async handleVariantDeleted(
    @Payload() data: { variantId: string },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Variant deleted: ${data.variantId}`);
    await this.productSearchService.removeVariant(data.variantId);
    this.ackMsg(context);
  }

  /**
   * All variants for a product deleted
   */
  @EventPattern('es.variant.allDeleted')
  async handleAllVariantsDeleted(
    @Payload() data: { productId: string },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`All variants deleted for product: ${data.productId}`);
    await this.productSearchService.removeByProductId(data.productId);
    this.ackMsg(context);
  }

  /**
   * Variants delete and recreate — remove old, index new
   */
  @EventPattern('es.variant.deleteAndRecreate')
  async handleDeleteAndRecreate(
    @Payload()
    data: {
      productId: string;
      variants: any[];
      product: any;
      brand?: any;
      category?: any;
      attributeMap?: Record<string, string>;
    },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Variants delete+recreate for product: ${data.productId}`);
    await this.productSearchService.removeByProductId(data.productId);
    const items = (data.variants || []).map((v) => ({
      variant: v,
      product: data.product,
      brand: data.brand,
      category: data.category,
      attributeMap: data.attributeMap,
    }));
    if (items.length > 0) {
      await this.productSearchService.indexVariantsBulk(items);
    }
    this.ackMsg(context);
  }

  // ============= TCP MESSAGE PATTERNS (from gateway) =============

  /**
   * Search product variants (full search with pagination)
   */
  @MessagePattern('es.search.productVariants')
  async searchProductVariants(
    @Payload()
    data: {
      q: string;
      page?: number;
      limit?: number;
      sort?: string;
      minPrice?: number;
      maxPrice?: number;
      category?: string;
      brand?: string;
    },
  ) {
    return this.productSearchService.searchProductVariants(data);
  }

  /**
   * Quick search (instant/autocomplete)
   */
  @MessagePattern('es.search.quick')
  async quickSearch(@Payload() data: { q: string; limit?: number }) {
    return this.productSearchService.quickSearch(data.q, data.limit);
  }

  /**
   * Full reindex (admin operation)
   */
  @MessagePattern('es.reindex.all')
  async reindexAll(
    @Payload()
    data: {
      variants: {
        variant: any;
        product: any;
        brand?: any;
        category?: any;
      }[];
    },
  ) {
    return this.productSearchService.reindexAll(data.variants);
  }
}
