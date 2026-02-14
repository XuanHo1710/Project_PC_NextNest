import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ProductInteractionService } from './product-interaction.service';
import {
  CreateProductCommentDto,
  UpdateProductCommentDto,
  ToggleReactionDto,
} from '@project-pc/common';
import { Channel, ConsumeMessage } from 'amqplib';

@Controller()
export class ProductInteractionController {
  constructor(private readonly interactionService: ProductInteractionService) {}

  // ============= COMMENTS =============

  @MessagePattern('interaction.comment.create')
  createComment(
    @Payload() data: { dto: CreateProductCommentDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.interactionService.createComment(data.dto);
    channel.ack(msg);
    return result;
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
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.interactionService.getCommentsByProduct(
      data.productId,
      data.page,
      data.limit,
      data.guestId,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('interaction.comment.update')
  updateComment(
    @Payload()
    data: {
      commentId: string;
      guestId: string;
      dto: UpdateProductCommentDto;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.interactionService.updateComment(
      data.commentId,
      data.guestId,
      data.dto,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('interaction.comment.delete')
  deleteComment(
    @Payload() data: { commentId: string; guestId: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.interactionService.deleteComment(
      data.commentId,
      data.guestId,
    );
    channel.ack(msg);
    return result;
  }

  // ============= REACTIONS =============

  @MessagePattern('interaction.reaction.toggle')
  toggleReaction(
    @Payload() data: { dto: ToggleReactionDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.interactionService.toggleReaction(data.dto);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('interaction.reaction.getMyReactions')
  getMyReactions(
    @Payload() data: { guestId: string; commentIds: string[] },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.interactionService.getMyReactions(
      data.guestId,
      data.commentIds,
    );
    channel.ack(msg);
    return result;
  }
}
