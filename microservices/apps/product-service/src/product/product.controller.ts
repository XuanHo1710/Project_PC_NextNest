import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ProductService } from './product.service';
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
import { Channel, ConsumeMessage } from 'amqplib';

@Controller()
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  /**
   * Shared RabbitMQ handler: ack on success, nack on error.
   */
  private async handleRmq<T>(
    context: RmqContext,
    handler: () => Promise<T>,
  ): Promise<T> {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await handler();
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  // ============= PRODUCT ENDPOINTS =============
  @MessagePattern('product.create')
  async createProduct(
    @Payload() data: { createProductDto: CreateProductDto },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.createProduct(data.createProductDto),
    );
  }

  @MessagePattern('product.findAll')
  async findAllProducts(
    @Payload() data: { searchDto?: SearchProductDto },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findAllProducts(data?.searchDto),
    );
  }

  @MessagePattern('product.findOne')
  async findOneProduct(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findOneProduct(data.id),
    );
  }

  @MessagePattern('product.update')
  async updateProduct(
    @Payload()
    data: {
      id: string;
      updateProductDto: UpdateProductDto;
      createdBy?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.updateProduct(
        data.id,
        data.updateProductDto,
        data.createdBy,
      ),
    );
  }

  @MessagePattern('product.remove')
  async removeProduct(
    @Payload() data: { id: string; createdBy?: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.removeProduct(data.id, data.createdBy),
    );
  }

  @MessagePattern('product.updateMany')
  async updateManyProducts(
    @Payload() data: { ids: string[]; typeUpdate: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.updateManyProducts(data.ids, data.typeUpdate),
    );
  }

  @MessagePattern('product.findMyProducts')
  async findMyProducts(
    @Payload()
    data: {
      createdBy: string;
      page?: number;
      limit?: number;
      search?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findMyProducts(
        data.createdBy,
        data.page,
        data.limit,
        data.search,
      ),
    );
  }

  @MessagePattern('product.search')
  async searchProducts(
    @Payload() data: { searchDto: SearchProductDto },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findAllProducts(data.searchDto),
    );
  }

  @MessagePattern('product.findByCollection')
  async findByCollection(
    @Payload()
    data: {
      slug: string;
      page?: number;
      limit?: number;
      sort?: string;
      cpu?: string;
      ram?: string;
      storage?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findByCollection(
        data.slug,
        data.page,
        data.limit,
        data.sort,
        { cpu: data.cpu, ram: data.ram, storage: data.storage },
      ),
    );
  }

  @MessagePattern('product.findByCategorySlug')
  async findByCategorySlug(
    @Payload()
    data: {
      slug: string;
      page?: number;
      limit?: number;
      sort?: string;
      cpu?: string;
      ram?: string;
      storage?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findByCategorySlug(
        data.slug,
        data.page,
        data.limit,
        data.sort,
        { cpu: data.cpu, ram: data.ram, storage: data.storage },
      ),
    );
  }

  @MessagePattern('product.findByBrandSlug')
  async findByBrandSlug(
    @Payload()
    data: {
      slug: string;
      page?: number;
      limit?: number;
      sort?: string;
      cpu?: string;
      ram?: string;
      storage?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findByBrandSlug(
        data.slug,
        data.page,
        data.limit,
        data.sort,
        { cpu: data.cpu, ram: data.ram, storage: data.storage },
      ),
    );
  }

  @MessagePattern('product.findAllClient')
  async findAllClientProducts(
    @Payload() data: { page?: number; limit?: number },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findAllClientProducts(data?.page, data?.limit),
    );
  }

  @MessagePattern('product.topDiscount')
  async getTopDiscountProducts(
    @Payload() data: { limit?: number },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.getTopDiscountProducts(data?.limit),
    );
  }

  @MessagePattern('product.findBySlug')
  async findBySlug(
    @Payload() data: { slug: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findBySlug(data.slug),
    );
  }

  // ============= PRODUCT VARIANT ENDPOINTS =============
  @MessagePattern('product.variant.create')
  async createProductVariant(
    @Payload() data: { createProductVariantDto: CreateProductVariantDto },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.createProductVariant(data.createProductVariantDto),
    );
  }

  @MessagePattern('product.variant.createBulk')
  async createBulkProductVariants(
    @Payload() data: { variants: CreateProductVariantDto[] },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.createBulkProductVariants(data.variants),
    );
  }

  @MessagePattern('product.variant.updateBulk')
  async updateBulkProductVariants(
    @Payload()
    data: {
      updates: { id: string; data: UpdateProductVariantDto }[];
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.updateBulkProductVariants(data.updates),
    );
  }

  @MessagePattern('product.variant.deleteAll')
  async deleteAllProductVariants(
    @Payload() data: { productId: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.deleteAllProductVariants(data.productId),
    );
  }

  @MessagePattern('product.variant.deleteAndRecreate')
  async deleteAndRecreateProductVariants(
    @Payload()
    data: {
      productId: string;
      variants: CreateProductVariantDto[];
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.deleteAndRecreateProductVariants(
        data.productId,
        data.variants,
      ),
    );
  }

  @MessagePattern('product.variant.findAll')
  async findAllProductVariants(
    @Payload() data: { productId?: string; page?: number; limit?: number },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findAllProductVariants(
        data?.productId,
        data?.page,
        data?.limit,
      ),
    );
  }

  @MessagePattern('product.variant.findOne')
  async findOneProductVariant(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findOneProductVariant(data.id),
    );
  }

  @MessagePattern('product.variant.update')
  async updateProductVariant(
    @Payload()
    data: {
      id: string;
      updateProductVariantDto: UpdateProductVariantDto;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.updateProductVariant(
        data.id,
        data.updateProductVariantDto,
      ),
    );
  }

  @MessagePattern('product.variant.remove')
  async removeProductVariant(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.removeProductVariant(data.id),
    );
  }

  @MessagePattern('product.variant.decrementStock')
  async decrementVariantStock(
    @Payload() data: { variantId: string; quantity: number },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.productService.decrementVariantStock(
        data.variantId,
        data.quantity,
      );
      channel.ack(msg);
      return result;
    } catch (err) {
      const xDeath = msg.properties.headers?.['x-death'] || [];
      const retryCount =
        xDeath?.find((d) => d.queue === 'product.main')?.count || 0;
      if (retryCount >= 5) {
        this.logger.error(
          `decrementStock DLQ: variant=${data.variantId}, qty=${data.quantity}, error=${err.message}`,
        );
        channel.publish(
          'product.dlx.exchange',
          'product.dlq',
          Buffer.from(JSON.stringify(data)),
          {
            persistent: true,
          },
        );
        channel.ack(msg);
        return { error: true, message: err.message };
      } else {
        channel.nack(msg, false, false);
        return { error: true, message: err.message, retrying: true };
      }
    }
  }

  @MessagePattern('product.variant.incrementStock')
  async incrementVariantStock(
    @Payload() data: { variantId: string; quantity: number },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.productService.incrementVariantStock(
        data.variantId,
        data.quantity,
      );
      channel.ack(msg);
      return result;
    } catch (err) {
      const xDeath = msg.properties.headers?.['x-death'] || [];
      const retryCount =
        xDeath?.find((d) => d.queue === 'product.main')?.count || 0;
      if (retryCount >= 5) {
        this.logger.error(
          `incrementStock DLQ: variant=${data.variantId}, qty=${data.quantity}, error=${err.message}`,
        );
        channel.publish(
          'product.dlx.exchange',
          'product.dlq',
          Buffer.from(JSON.stringify(data)),
          {
            persistent: true,
          },
        );
        channel.ack(msg);
        return { error: true, message: err.message };
      } else {
        channel.nack(msg, false, false);
        return { error: true, message: err.message, retrying: true };
      }
    }
  }

  @MessagePattern('product.variant.decrementStockBulk')
  async decrementVariantStockBulk(
    @Payload()
    data: { items: Array<{ variantId: string; quantity: number }> },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.decrementVariantsStockBulk(data.items),
    );
  }

  @MessagePattern('product.variant.incrementStockBulk')
  async incrementVariantStockBulk(
    @Payload()
    data: { items: Array<{ variantId: string; quantity: number }> },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.incrementVariantsStockBulk(data.items),
    );
  }

  // ============= PRODUCT ATTRIBUTE ENDPOINTS =============
  @MessagePattern('product.attribute.create')
  async createProductAttribute(
    @Payload() data: { createProductAttributeDto: CreateProductAttributeDto },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.createProductAttribute(
        data.createProductAttributeDto,
      ),
    );
  }

  @MessagePattern('product.attribute.findAll')
  async findAllProductAttributes(
    @Payload()
    data: {
      page?: number;
      limit?: number;
      createdBy?: string;
      search?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findAllProductAttributes(
        data?.page,
        data?.limit,
        data?.createdBy,
        data?.search,
      ),
    );
  }

  @MessagePattern('product.attribute.findOne')
  async findOneProductAttribute(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findOneProductAttribute(data.id),
    );
  }

  @MessagePattern('product.attribute.update')
  async updateProductAttribute(
    @Payload()
    data: {
      id: string;
      updateProductAttributeDto: UpdateProductAttributeDto;
      createdBy?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.updateProductAttribute(
        data.id,
        data.updateProductAttributeDto,
        data.createdBy,
      ),
    );
  }

  @MessagePattern('product.attribute.remove')
  async removeProductAttribute(
    @Payload() data: { id: string; createdBy?: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.removeProductAttribute(data.id, data.createdBy),
    );
  }

  // ============= PRODUCT ATTRIBUTE VALUE ENDPOINTS =============
  @MessagePattern('product.attributeValue.create')
  async createProductAttributeValue(
    @Payload()
    data: {
      createProductAttributeValueDto: CreateProductAttributeValueDto;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.createProductAttributeValue(
        data.createProductAttributeValueDto,
      ),
    );
  }

  @MessagePattern('product.attributeValue.findAll')
  async findAllProductAttributeValues(
    @Payload()
    data: {
      attributeId?: string;
      page?: number;
      limit?: number;
      createdBy?: string;
      search?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findAllProductAttributeValues(
        data?.attributeId,
        data?.page,
        data?.limit,
        data?.createdBy,
        data?.search,
      ),
    );
  }

  @MessagePattern('product.attributeValue.findOne')
  async findOneProductAttributeValue(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findOneProductAttributeValue(data.id),
    );
  }

  @MessagePattern('product.attributeValue.update')
  async updateProductAttributeValue(
    @Payload()
    data: {
      id: string;
      updateProductAttributeValueDto: UpdateProductAttributeValueDto;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.updateProductAttributeValue(
        data.id,
        data.updateProductAttributeValueDto,
      ),
    );
  }

  @MessagePattern('product.attributeValue.remove')
  async removeProductAttributeValue(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.removeProductAttributeValue(data.id),
    );
  }

  // ============= PRODUCT ATTRIBUTE ALLOW VALUE ENDPOINTS =============
  @MessagePattern('product.attributeAllowValue.create')
  async createProductAttributeAllowValue(
    @Payload()
    data: {
      createProductAttributeAllowValueDto: CreateProductAttributeAllowValueDto;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.createProductAttributeAllowValue(
        data.createProductAttributeAllowValueDto,
      ),
    );
  }

  @MessagePattern('product.attributeAllowValue.findAll')
  async findAllProductAttributeAllowValues(
    @Payload()
    data: {
      productId?: string;
      page?: number;
      limit?: number;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findAllProductAttributeAllowValues(
        data?.productId,
        data?.page,
        data?.limit,
      ),
    );
  }

  @MessagePattern('product.attributeAllowValue.findOne')
  async findOneProductAttributeAllowValue(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.findOneProductAttributeAllowValue(data.id),
    );
  }

  @MessagePattern('product.attributeAllowValue.update')
  async updateProductAttributeAllowValue(
    @Payload()
    data: {
      id: string;
      updateProductAttributeAllowValueDto: UpdateProductAttributeAllowValueDto;
    },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.updateProductAttributeAllowValue(
        data.id,
        data.updateProductAttributeAllowValueDto,
      ),
    );
  }

  @MessagePattern('product.attributeAllowValue.remove')
  async removeProductAttributeAllowValue(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.removeProductAttributeAllowValue(data.id),
    );
  }

  @MessagePattern('product.getVariantIdsByCreator')
  async getVariantIdsByCreator(
    @Payload() data: { createdBy: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.getVariantIdsByCreator(data.createdBy),
    );
  }

  @MessagePattern('product.getProductIdsByCreator')
  async getProductIdsByCreator(
    @Payload() data: { createdBy: string },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.getProductIdsByCreator(data.createdBy),
    );
  }

  @EventPattern('product.createView')
  async createProductView(
    @Payload() data: { productId: string; guestId: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const msg = context.getMessage();
    try {
      await this.productService.createOrUpdateView(
        data.productId,
        data.guestId,
      );
      channel.ack(msg);
    } catch (err) {
      // Non-critical: just ack and log
      this.logger.warn(
        `Failed to track product view: ${err instanceof Error ? err.message : err}`,
      );
      channel.ack(msg);
    }
  }

  @MessagePattern('product.getRecentlyViewed')
  async getRecentlyViewed(
    @Payload() data: { guestId: string; limit?: number },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.getRecentlyViewedProducts(
        data.guestId,
        data.limit || 20,
      ),
    );
  }

  @MessagePattern('product.checkVariantsStock')
  async checkVariantsStock(
    @Payload()
    data: { items: Array<{ variantId: string; quantity: number }> },
    @Ctx() context: RmqContext,
  ) {
    return this.handleRmq(context, () =>
      this.productService.checkVariantsStock(data.items),
    );
  }

  // ============= ELASTICSEARCH REINDEX =============
  @MessagePattern('product.reindex.elasticsearch')
  async reindexElasticsearch(@Payload() data: any, @Ctx() context: RmqContext) {
    return this.handleRmq(context, () =>
      this.productService.reindexAllToElasticsearch(),
    );
  }
}
