import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Channel, ConsumeMessage } from 'amqplib';
import { ProductSearchService } from './product-search.service';

const RETRY_QUEUE = 'elasticsearch.retry';
const DLQ_QUEUE = 'elasticsearch.dlq';
const MAX_RETRIES = 3;

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

  /**
   * Total number of completed retry cycles recorded by the broker.
   * RabbitMQ appends an x-death entry each time a message is dead-lettered
   * out of elasticsearch.retry (after its TTL expires).
   */
  private getRetryCount(
    msg: ReturnType<RmqContext['getMessage']> | null,
  ): number {
    const headers = (msg as { properties?: { headers?: Record<string, any> } })
      ?.properties?.headers;
    const xDeath = headers?.['x-death'];
    if (!Array.isArray(xDeath)) return 0;
    let total = 0;
    for (const d of xDeath) {
      if (d?.queue === RETRY_QUEUE && typeof d.count === 'number') {
        total += d.count;
      }
    }
    return total;
  }

  /**
   * Bounded retry for ES sync event handlers.
   * On failure: attempts < MAX_RETRIES → copy message into elasticsearch.retry
   * (5s TTL, then dead-letters back into elasticsearch.main) and ack the
   * original. After exhausting retries → park the poison message in
   * elasticsearch.dlq and ack, instead of looping forever.
   */
  private async runWithRetry(
    context: RmqContext,
    pattern: string,
    data: unknown,
    fn: () => Promise<void>,
  ) {
    let channel: Channel;
    let msg: ReturnType<RmqContext['getMessage']>;
    try {
      channel = context.getChannelRef();
      msg = context.getMessage();
    } catch {
      // Non-RMQ context (e.g., TCP): no ack semantics available
      await fn();
      return;
    }

    try {
      await fn();
      this.ackMsg(context);
    } catch (error) {
      const retriesDone = this.getRetryCount(msg);

      if (retriesDone < MAX_RETRIES) {
        this.logger.warn(
          `${pattern} failed (retry ${retriesDone + 1}/${MAX_RETRIES}): ${error.message} — scheduling for retry`,
        );
        try {
          // Rebuild the full NestJS envelope {pattern, data} so the redelivered
          // message routes back to the same handler; preserve headers (x-death)
          channel.sendToQueue(
            RETRY_QUEUE,
            Buffer.from(JSON.stringify({ pattern, data })),
            {
              persistent: true,
              headers: { ...(msg.properties?.headers || {}) },
            },
          );
          this.ackMsg(context);
        } catch (publishErr) {
          this.logger.error(
            `${pattern}: failed to publish to ${RETRY_QUEUE} (${publishErr.message}) — requeueing original`,
          );
          channel.nack(msg as ConsumeMessage, false, true);
        }
      } else {
        this.logger.error(
          `${pattern}: dropping poison message after ${retriesDone} retries — parked in ${DLQ_QUEUE}. Error: ${error.message}`,
        );
        try {
          channel.sendToQueue(
            DLQ_QUEUE,
            Buffer.from(
              JSON.stringify({
                pattern,
                error: error.message,
                retries: retriesDone,
                failedAt: new Date().toISOString(),
                data,
              }),
            ),
            { persistent: true },
          );
        } catch (dlqErr) {
          this.logger.error(
            `${pattern}: failed to publish to ${DLQ_QUEUE}: ${dlqErr.message}`,
          );
        }
        this.ackMsg(context);
      }
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
    await this.runWithRetry(context, 'es.product.created', data, async () => {
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
    });
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
    await this.runWithRetry(context, 'es.product.updated', data, async () => {
      await this.productSearchService.updateProductInfo(data);
    });
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
    await this.runWithRetry(context, 'es.product.deleted', data, async () => {
      await this.productSearchService.removeByProductId(data.productId);
    });
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
    await this.runWithRetry(context, 'es.variant.upserted', data, async () => {
      await this.productSearchService.indexVariant(data);
    });
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
    await this.runWithRetry(
      context,
      'es.variant.bulkUpserted',
      data,
      async () => {
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
      },
    );
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
    await this.runWithRetry(context, 'es.variant.deleted', data, async () => {
      await this.productSearchService.removeVariant(data.variantId);
    });
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
    await this.runWithRetry(context, 'es.variant.allDeleted', data, async () => {
      await this.productSearchService.removeByProductId(data.productId);
    });
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
    await this.runWithRetry(
      context,
      'es.variant.deleteAndRecreate',
      data,
      async () => {
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
      },
    );
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
