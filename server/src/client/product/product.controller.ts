import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { TypeQueryProduct } from 'types/product';
import { CreateProductInteractionDto } from 'src/admin/product/dto/create-product-interaction.entity';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get("/get-by-category/:categoryId")
  findProductByIdCategory(@Param("categoryId") categoryId: string,
    @Query("page") page: number = 1,
    @Query("sort") sort: string = "",
    @Query("cpu") cpu: string = "",
    @Query("ram") ram: string = "",
    @Query("price") price: string = ""
  ) {
    return this.productService.findProductByIdCategory(categoryId, page, sort, cpu, ram, price);
  }

  @Get("/search")
  searchProductByName(@Query("keyword") keyword: string) {
    return this.productService.searchProductByName(keyword);
  }

  @Get("/get-banner-products")
  getBannerProducts(@Query("type") type: string) {
    return this.productService.getBannerProducts(type);
  }


  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productService.findOne(slug);
  }


  @Post('/post-comment')
  postCommentOnProduct(@Body() createProductInteractionDto: CreateProductInteractionDto) {
    return this.productService.postCommentOnProduct(createProductInteractionDto);
  }


  @Get('/get-comment/:productId')
  getCommentOfProduct(@Param("productId") productId: string, @Query("page") page: number = 1) {
    return this.productService.getAllCommentByProductId(productId, page);
  }

  @Post('/reply-comment')
  replyCommentProduct(@Body() { commentId, guestReplyId, content, images, isAdminReply = false }: { commentId: string, guestReplyId: string, content: string, images: string[], isAdminReply?: boolean }) {
    return this.productService.replyCommentProduct(commentId, guestReplyId, content, images, isAdminReply);
  }

  @Post('/interact-comment')
  interactCommentProduct(@Body() { commentId, guestIdInteractedBy, isLike }: { commentId: string, guestIdInteractedBy: string, isLike: boolean }) {
    return this.productService.interactCommentProduct(commentId, guestIdInteractedBy, isLike);
  }


  @Post('/handle-favorite')
  addProductToWishlist(@Body() { guestId, productId, isWishlisted }: { guestId: string, productId: string, isWishlisted: boolean }) {
    return this.productService.handleWishlist(guestId, productId, isWishlisted);
  }

  @Get('/get-wishlist/:guestId')
  isWishlistByGuestAndProduct(@Param("guestId") guestId: string, @Query("productId") productId: string) {
    return this.productService.isWishlistByGuestAndProduct(guestId, productId);
  }




}
