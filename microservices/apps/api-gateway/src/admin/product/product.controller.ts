import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MICROSERVICE,
  SearchProductDto,
  CreateProductDto,
  UpdateProductDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
  CreateProductAttributeValueDto,
  UpdateProductAttributeValueDto,
  CreateProductAttributeAllowValueDto,
  UpdateProductAttributeAllowValueDto,
} from '@project-pc/common';

// ============= PRODUCT =============
@Controller('/admin/product')
export class ProductController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.send('product.create', { createProductDto });
  }

  @Get()
  findAllProducts(@Query() searchDto?: SearchProductDto) {
    return this.productService.send('product.findAll', { searchDto });
  }

  @Get('search')
  searchProducts(@Query() searchDto: SearchProductDto) {
    return this.productService.send('product.search', { searchDto });
  }

  @Get(':id')
  findOneProduct(@Param('id') id: string) {
    return this.productService.send('product.findOne', { id });
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.send('product.update', {
      id,
      updateProductDto,
    });
  }

  @Delete(':id')
  removeProduct(@Param('id') id: string) {
    return this.productService.send('product.remove', { id });
  }
}

// ============= PRODUCT VARIANT =============
@Controller('/admin/product-variant')
export class ProductVariantController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Post()
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productService.send('product.variant.create', {
      createProductVariantDto,
    });
  }

  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.productService.send('product.variant.findAll', { productId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.send('product.variant.findOne', { id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productService.send('product.variant.update', {
      id,
      updateProductVariantDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.send('product.variant.remove', { id });
  }
}

// ============= PRODUCT ATTRIBUTE =============
@Controller('/admin/product-attribute')
export class ProductAttributeController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Post()
  create(@Body() createProductAttributeDto: CreateProductAttributeDto) {
    return this.productService.send('product.attribute.create', {
      createProductAttributeDto,
    });
  }

  @Get()
  findAll() {
    return this.productService.send('product.attribute.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.send('product.attribute.findOne', { id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductAttributeDto: UpdateProductAttributeDto,
  ) {
    return this.productService.send('product.attribute.update', {
      id,
      updateProductAttributeDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.send('product.attribute.remove', { id });
  }
}

// ============= PRODUCT ATTRIBUTE VALUE =============
@Controller('/admin/product-attribute-value')
export class ProductAttributeValueController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Post()
  create(
    @Body()
    createProductAttributeValueDto: CreateProductAttributeValueDto,
  ) {
    return this.productService.send('product.attributeValue.create', {
      createProductAttributeValueDto,
    });
  }

  @Get()
  findAll(@Query('attributeId') attributeId?: string) {
    return this.productService.send('product.attributeValue.findAll', {
      attributeId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.send('product.attributeValue.findOne', { id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductAttributeValueDto: UpdateProductAttributeValueDto,
  ) {
    return this.productService.send('product.attributeValue.update', {
      id,
      updateProductAttributeValueDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.send('product.attributeValue.remove', { id });
  }
}

// ============= PRODUCT ATTRIBUTE ALLOW VALUE =============
@Controller('/admin/product-attribute-allow-value')
export class ProductAttributeAllowValueController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  @Post()
  create(
    @Body()
    createProductAttributeAllowValueDto: CreateProductAttributeAllowValueDto,
  ) {
    return this.productService.send('product.attributeAllowValue.create', {
      createProductAttributeAllowValueDto,
    });
  }

  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.productService.send('product.attributeAllowValue.findAll', {
      productId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.send('product.attributeAllowValue.findOne', {
      id,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateProductAttributeAllowValueDto: UpdateProductAttributeAllowValueDto,
  ) {
    return this.productService.send('product.attributeAllowValue.update', {
      id,
      updateProductAttributeAllowValueDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.send('product.attributeAllowValue.remove', {
      id,
    });
  }
}
