import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MICROSERVICE,
  CreateProductCommentDto,
  UpdateProductCommentDto,
  ToggleReactionDto,
} from '@project-pc/common';
import { Guest, Public } from '../../decorators/customize';

@Controller('/client/product-interaction')
export class ProductInteractionController {
  constructor(
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  // ============= COMMENTS =============

  /**
   * POST /client/product-interaction/comment
   * Tạo comment/review sản phẩm hoặc reply comment
   */
  @Post('comment')
  createComment(@Body() dto: CreateProductCommentDto, @Guest() guest: any) {
    dto.guest = guest._id;
    return this.productService.send('interaction.comment.create', { dto });
  }

  /**
   * GET /client/product-interaction/comments/:productId
   * Lấy comments + replies + thống kê rating cho 1 sản phẩm (Public)
   */
  @Get('comments/:productId')
  @Public()
  getCommentsByProduct(
    @Param('productId') productId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('guestId') guestId?: string,
  ) {
    return this.productService.send('interaction.comment.getByProduct', {
      productId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      guestId: guestId || undefined,
    });
  }

  /**
   * PATCH /client/product-interaction/comment/:id
   * Cập nhật comment (chỉ chủ comment)
   */
  @Patch('comment/:id')
  updateComment(
    @Param('id') id: string,
    @Body() dto: UpdateProductCommentDto,
    @Guest() guest: any,
  ) {
    return this.productService.send('interaction.comment.update', {
      commentId: id,
      guestId: guest._id,
      dto,
    });
  }

  /**
   * DELETE /client/product-interaction/comment/:id
   * Xóa comment (chỉ chủ comment)
   */
  @Delete('comment/:id')
  deleteComment(@Param('id') id: string, @Guest() guest: any) {
    return this.productService.send('interaction.comment.delete', {
      commentId: id,
      guestId: guest._id,
    });
  }

  // ============= REACTIONS (Like/Dislike) =============

  /**
   * POST /client/product-interaction/reaction
   * Toggle like/dislike trên 1 comment
   */
  @Post('reaction')
  toggleReaction(@Body() dto: ToggleReactionDto, @Guest() guest: any) {
    dto.guest = guest._id;
    return this.productService.send('interaction.reaction.toggle', { dto });
  }

  /**
   * POST /client/product-interaction/my-reactions
   * Lấy reactions của current guest trên nhiều comments
   */
  @Post('my-reactions')
  getMyReactions(@Body() body: { commentIds: string[] }, @Guest() guest: any) {
    return this.productService.send('interaction.reaction.getMyReactions', {
      guestId: guest._id,
      commentIds: body.commentIds,
    });
  }
}
