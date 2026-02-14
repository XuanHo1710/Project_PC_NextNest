import { Controller } from '@nestjs/common';
import {
  Ctx,
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
  constructor(private readonly productService: ProductService) {}

  // ============= PRODUCT ENDPOINTS =============
  @MessagePattern('product.create')
  async createProduct(
    @Payload() data: { createProductDto: CreateProductDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.createProduct(
      data.createProductDto,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.findAll')
  async findAllProducts(
    @Payload() data: { searchDto?: SearchProductDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findAllProducts(data?.searchDto);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.findOne')
  async findOneProduct(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findOneProduct(data.id);
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.updateProduct(
      data.id,
      data.updateProductDto,
      data.createdBy,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.remove')
  async removeProduct(
    @Payload() data: { id: string; createdBy?: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.removeProduct(
      data.id,
      data.createdBy,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.updateMany')
  async updateManyProducts(
    @Payload() data: { ids: string[]; typeUpdate: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.updateManyProducts(
      data.ids,
      data.typeUpdate,
    );
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findMyProducts(
      data.createdBy,
      data.page,
      data.limit,
      data.search,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.search')
  async searchProducts(
    @Payload() data: { searchDto: SearchProductDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findAllProducts(data.searchDto);
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findByCollection(
      data.slug,
      data.page,
      data.limit,
      data.sort,
      { cpu: data.cpu, ram: data.ram, storage: data.storage },
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.findAllClient')
  async findAllClientProducts(
    @Payload() data: { page?: number; limit?: number },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findAllClientProducts(
      data?.page,
      data?.limit,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.topDiscount')
  async getTopDiscountProducts(
    @Payload() data: { limit?: number },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.getTopDiscountProducts(
      data?.limit,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.findBySlug')
  async findBySlug(
    @Payload() data: { slug: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findBySlug(data.slug);
    channel.ack(msg);
    return result;
  }

  // ============= PRODUCT VARIANT ENDPOINTS =============
  @MessagePattern('product.variant.create')
  async createProductVariant(
    @Payload() data: { createProductVariantDto: CreateProductVariantDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.createProductVariant(
      data.createProductVariantDto,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.variant.createBulk')
  async createBulkProductVariants(
    @Payload() data: { variants: CreateProductVariantDto[] },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.createBulkProductVariants(
      data.variants,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.variant.updateBulk')
  async updateBulkProductVariants(
    @Payload()
    data: {
      updates: { id: string; data: UpdateProductVariantDto }[];
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.updateBulkProductVariants(
      data.updates,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.variant.deleteAll')
  async deleteAllProductVariants(
    @Payload() data: { productId: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.deleteAllProductVariants(
      data.productId,
    );
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.deleteAndRecreateProductVariants(
      data.productId,
      data.variants,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.variant.findAll')
  async findAllProductVariants(
    @Payload() data: { productId?: string; page?: number; limit?: number },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findAllProductVariants(
      data?.productId,
      data?.page,
      data?.limit,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.variant.findOne')
  async findOneProductVariant(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findOneProductVariant(data.id);
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.updateProductVariant(
      data.id,
      data.updateProductVariantDto,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.variant.remove')
  async removeProductVariant(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.removeProductVariant(data.id);
    channel.ack(msg);
    return result;
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
        channel.publish(
          'product.dlx.exchange',
          'product.dlq',
          Buffer.from(JSON.stringify(data)),
          {
            persistent: true,
          },
        );
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
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
        channel.publish(
          'product.dlx.exchange',
          'product.dlq',
          Buffer.from(JSON.stringify(data)),
          {
            persistent: true,
          },
        );
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
    }
  }

  // ============= PRODUCT ATTRIBUTE ENDPOINTS =============
  @MessagePattern('product.attribute.create')
  async createProductAttribute(
    @Payload() data: { createProductAttributeDto: CreateProductAttributeDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.createProductAttribute(
      data.createProductAttributeDto,
    );
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findAllProductAttributes(
      data?.page,
      data?.limit,
      data?.createdBy,
      data?.search,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.attribute.findOne')
  async findOneProductAttribute(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findOneProductAttribute(data.id);
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.updateProductAttribute(
      data.id,
      data.updateProductAttributeDto,
      data.createdBy,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.attribute.remove')
  async removeProductAttribute(
    @Payload() data: { id: string; createdBy?: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.removeProductAttribute(
      data.id,
      data.createdBy,
    );
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.createProductAttributeValue(
      data.createProductAttributeValueDto,
    );
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findAllProductAttributeValues(
      data?.attributeId,
      data?.page,
      data?.limit,
      data?.createdBy,
      data?.search,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.attributeValue.findOne')
  async findOneProductAttributeValue(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findOneProductAttributeValue(
      data.id,
    );
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.updateProductAttributeValue(
      data.id,
      data.updateProductAttributeValueDto,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.attributeValue.remove')
  async removeProductAttributeValue(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.removeProductAttributeValue(
      data.id,
    );
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.createProductAttributeAllowValue(
      data.createProductAttributeAllowValueDto,
    );
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findAllProductAttributeAllowValues(
      data?.productId,
      data?.page,
      data?.limit,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.attributeAllowValue.findOne')
  async findOneProductAttributeAllowValue(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.findOneProductAttributeAllowValue(
      data.id,
    );
    channel.ack(msg);
    return result;
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
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.updateProductAttributeAllowValue(
      data.id,
      data.updateProductAttributeAllowValueDto,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.attributeAllowValue.remove')
  async removeProductAttributeAllowValue(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.removeProductAttributeAllowValue(
      data.id,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.getVariantIdsByCreator')
  async getVariantIdsByCreator(
    @Payload() data: { createdBy: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.getVariantIdsByCreator(
      data.createdBy,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('product.getProductIdsByCreator')
  async getProductIdsByCreator(
    @Payload() data: { createdBy: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = await this.productService.getProductIdsByCreator(
      data.createdBy,
    );
    channel.ack(msg);
    return result;
  }
}
