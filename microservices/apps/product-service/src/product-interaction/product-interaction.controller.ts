import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductInteractionService } from './product-interaction.service';
import {
  CreateProductCommentDto,
  UpdateProductCommentDto,
  ToggleReactionDto,
} from '@project-pc/common';

@Controller()
export class ProductInteractionController {
  constructor(private readonly interactionService: ProductInteractionService) {}

  // ============= COMMENTS =============

  @MessagePattern('interaction.comment.create')
  createComment(@Payload() data: { dto: CreateProductCommentDto }) {
    return this.interactionService.createComment(data.dto);
  }

  @MessagePattern('interaction.comment.getByProduct')
  getCommentsByProduct(
    @Payload()
    data: {
      productId: string;
      page?: number;
      limit?: number;
      guestId?: string;
    },
  ) {
    return this.interactionService.getCommentsByProduct(
      data.productId,
      data.page,
      data.limit,
      data.guestId,
    );
  }

  @MessagePattern('interaction.comment.update')
  updateComment(
    @Payload()
    data: {
      commentId: string;
      guestId: string;
      dto: UpdateProductCommentDto;
    },
  ) {
    return this.interactionService.updateComment(
      data.commentId,
      data.guestId,
      data.dto,
    );
  }

  @MessagePattern('interaction.comment.delete')
  deleteComment(@Payload() data: { commentId: string; guestId: string }) {
    return this.interactionService.deleteComment(data.commentId, data.guestId);
  }

  // ============= REACTIONS =============

  @MessagePattern('interaction.reaction.toggle')
  toggleReaction(@Payload() data: { dto: ToggleReactionDto }) {
    return this.interactionService.toggleReaction(data.dto);
  }

  @MessagePattern('interaction.reaction.getMyReactions')
  getMyReactions(@Payload() data: { guestId: string; commentIds: string[] }) {
    return this.interactionService.getMyReactions(
      data.guestId,
      data.commentIds,
    );
  }
}
