import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ============= PRODUCT ENDPOINTS =============
  @MessagePattern('product.create')
  createProduct(@Payload() data: { createProductDto: CreateProductDto }) {
    return this.productService.createProduct(data.createProductDto);
  }

  @MessagePattern('product.findAll')
  findAllProducts(@Payload() data: { searchDto?: SearchProductDto }) {
    return this.productService.findAllProducts(data?.searchDto);
  }

  @MessagePattern('product.findOne')
  findOneProduct(@Payload() data: { id: string }) {
    return this.productService.findOneProduct(data.id);
  }

  @MessagePattern('product.update')
  updateProduct(
    @Payload() data: { id: string; updateProductDto: UpdateProductDto },
  ) {
    return this.productService.updateProduct(data.id, data.updateProductDto);
  }

  @MessagePattern('product.remove')
  removeProduct(@Payload() data: { id: string }) {
    return this.productService.removeProduct(data.id);
  }

  @MessagePattern('product.search')
  searchProducts(@Payload() data: { searchDto: SearchProductDto }) {
    return this.productService.findAllProducts(data.searchDto);
  }

  @MessagePattern('product.findByCollection')
  findByCollection(
    @Payload()
    data: {
      slug: string;
      page?: number;
      limit?: number;
      sort?: string;
      cpu?: string;
      ram?: string;
    },
  ) {
    return this.productService.findByCollection(
      data.slug,
      data.page,
      data.limit,
      data.sort,
      { cpu: data.cpu, ram: data.ram },
    );
  }

  @MessagePattern('product.findAllClient')
  findAllClientProducts(@Payload() data: { page?: number; limit?: number }) {
    return this.productService.findAllClientProducts(data?.page, data?.limit);
  }

  @MessagePattern('product.topDiscount')
  getTopDiscountProducts(@Payload() data: { limit?: number }) {
    return this.productService.getTopDiscountProducts(data?.limit);
  }

  @MessagePattern('product.findBySlug')
  findBySlug(@Payload() data: { slug: string }) {
    return this.productService.findBySlug(data.slug);
  }

  // ============= PRODUCT VARIANT ENDPOINTS =============
  @MessagePattern('product.variant.create')
  createProductVariant(
    @Payload() data: { createProductVariantDto: CreateProductVariantDto },
  ) {
    return this.productService.createProductVariant(
      data.createProductVariantDto,
    );
  }

  @MessagePattern('product.variant.findAll')
  findAllProductVariants(
    @Payload() data?: { productId?: string; page?: number; limit?: number },
  ) {
    return this.productService.findAllProductVariants(
      data?.productId,
      data?.page,
      data?.limit,
    );
  }

  @MessagePattern('product.variant.findOne')
  findOneProductVariant(@Payload() data: { id: string }) {
    return this.productService.findOneProductVariant(data.id);
  }

  @MessagePattern('product.variant.update')
  updateProductVariant(
    @Payload()
    data: {
      id: string;
      updateProductVariantDto: UpdateProductVariantDto;
    },
  ) {
    return this.productService.updateProductVariant(
      data.id,
      data.updateProductVariantDto,
    );
  }

  @MessagePattern('product.variant.remove')
  removeProductVariant(@Payload() data: { id: string }) {
    return this.productService.removeProductVariant(data.id);
  }

  // ============= PRODUCT ATTRIBUTE ENDPOINTS =============
  @MessagePattern('product.attribute.create')
  createProductAttribute(
    @Payload() data: { createProductAttributeDto: CreateProductAttributeDto },
  ) {
    return this.productService.createProductAttribute(
      data.createProductAttributeDto,
    );
  }

  @MessagePattern('product.attribute.findAll')
  findAllProductAttributes(
    @Payload()
    data?: {
      page?: number;
      limit?: number;
      createdBy?: string;
      search?: string;
    },
  ) {
    return this.productService.findAllProductAttributes(
      data?.page,
      data?.limit,
      data?.createdBy,
      data?.search,
    );
  }

  @MessagePattern('product.attribute.findOne')
  findOneProductAttribute(@Payload() data: { id: string }) {
    return this.productService.findOneProductAttribute(data.id);
  }

  @MessagePattern('product.attribute.update')
  updateProductAttribute(
    @Payload()
    data: {
      id: string;
      updateProductAttributeDto: UpdateProductAttributeDto;
      createdBy?: string;
    },
  ) {
    return this.productService.updateProductAttribute(
      data.id,
      data.updateProductAttributeDto,
      data.createdBy,
    );
  }

  @MessagePattern('product.attribute.remove')
  removeProductAttribute(@Payload() data: { id: string; createdBy?: string }) {
    return this.productService.removeProductAttribute(data.id, data.createdBy);
  }

  // ============= PRODUCT ATTRIBUTE VALUE ENDPOINTS =============
  @MessagePattern('product.attributeValue.create')
  createProductAttributeValue(
    @Payload()
    data: {
      createProductAttributeValueDto: CreateProductAttributeValueDto;
    },
  ) {
    return this.productService.createProductAttributeValue(
      data.createProductAttributeValueDto,
    );
  }

  @MessagePattern('product.attributeValue.findAll')
  findAllProductAttributeValues(
    @Payload()
    data?: {
      attributeId?: string;
      page?: number;
      limit?: number;
      createdBy?: string;
      search?: string;
    },
  ) {
    return this.productService.findAllProductAttributeValues(
      data?.attributeId,
      data?.page,
      data?.limit,
      data?.createdBy,
      data?.search,
    );
  }

  @MessagePattern('product.attributeValue.findOne')
  findOneProductAttributeValue(@Payload() data: { id: string }) {
    return this.productService.findOneProductAttributeValue(data.id);
  }

  @MessagePattern('product.attributeValue.update')
  updateProductAttributeValue(
    @Payload()
    data: {
      id: string;
      updateProductAttributeValueDto: UpdateProductAttributeValueDto;
    },
  ) {
    return this.productService.updateProductAttributeValue(
      data.id,
      data.updateProductAttributeValueDto,
    );
  }

  @MessagePattern('product.attributeValue.remove')
  removeProductAttributeValue(@Payload() data: { id: string }) {
    return this.productService.removeProductAttributeValue(data.id);
  }

  // ============= PRODUCT ATTRIBUTE ALLOW VALUE ENDPOINTS =============
  @MessagePattern('product.attributeAllowValue.create')
  createProductAttributeAllowValue(
    @Payload()
    data: {
      createProductAttributeAllowValueDto: CreateProductAttributeAllowValueDto;
    },
  ) {
    return this.productService.createProductAttributeAllowValue(
      data.createProductAttributeAllowValueDto,
    );
  }

  @MessagePattern('product.attributeAllowValue.findAll')
  findAllProductAttributeAllowValues(
    @Payload()
    data?: {
      productId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    return this.productService.findAllProductAttributeAllowValues(
      data?.productId,
      data?.page,
      data?.limit,
    );
  }

  @MessagePattern('product.attributeAllowValue.findOne')
  findOneProductAttributeAllowValue(@Payload() data: { id: string }) {
    return this.productService.findOneProductAttributeAllowValue(data.id);
  }

  @MessagePattern('product.attributeAllowValue.update')
  updateProductAttributeAllowValue(
    @Payload()
    data: {
      id: string;
      updateProductAttributeAllowValueDto: UpdateProductAttributeAllowValueDto;
    },
  ) {
    return this.productService.updateProductAttributeAllowValue(
      data.id,
      data.updateProductAttributeAllowValueDto,
    );
  }

  @MessagePattern('product.attributeAllowValue.remove')
  removeProductAttributeAllowValue(@Payload() data: { id: string }) {
    return this.productService.removeProductAttributeAllowValue(data.id);
  }
}
