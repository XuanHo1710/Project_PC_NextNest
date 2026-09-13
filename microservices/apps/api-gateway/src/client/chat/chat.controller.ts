import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '@project-pc/common';
import { firstValueFrom } from 'rxjs';
import { ChatGateway } from './chat.gateway';
import { Guest } from '../../decorators/customize';

@Controller('/client/chat')
export class ChatController {
  constructor(
    @Inject(MICROSERVICE.CHAT_SERVICE)
    private readonly chatClient: ClientProxy,
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * Find or create a conversation with another user.
   * The caller is derived from the JWT — client only supplies the other party.
   */
  @Post('conversation')
  async findOrCreateConversation(
    @Guest() guest: any,
    @Body()
    body: {
      userName?: string;
      userAvatar?: string;
      userRole?: 'buyer' | 'seller';
      otherUserId: string;
      otherUserName?: string;
      otherUserAvatar?: string;
      otherUserRole: 'buyer' | 'seller';
    },
  ) {
    if (!guest?._id) {
      throw new BadRequestException('Bạn chưa đăng nhập');
    }
    if (!body?.otherUserId) {
      throw new BadRequestException('Thiếu thông tin người nhận');
    }

    const payload = {
      userId: guest._id,
      userName: body.userName ?? guest.fullname ?? '',
      userAvatar: body.userAvatar ?? guest.avatar ?? '',
      userRole: body.userRole ?? 'buyer',
      otherUserId: body.otherUserId,
      otherUserName: body.otherUserName,
      otherUserAvatar: body.otherUserAvatar,
      otherUserRole: body.otherUserRole,
    };

    const conversation = await firstValueFrom(
      this.chatClient.send('chat.findOrCreateConversation', payload),
    );

    // Notify all participants via socket (real-time)
    if (conversation?._id && conversation?.participants) {
      this.chatGateway.notifyConversationCreated(conversation);
    }

    return conversation;
  }

  /**
   * Get conversations for the authenticated user
   */
  @Get('conversations')
  async getConversations(@Guest() guest: any) {
    if (!guest?._id) {
      throw new BadRequestException('Bạn chưa đăng nhập');
    }
    return firstValueFrom(
      this.chatClient.send('chat.getConversationsByUser', {
        userId: guest._id,
      }),
    );
  }

  /**
   * Send a message. senderId is forced to the authenticated identity.
   */
  @Post('message')
  async sendMessage(
    @Guest() guest: any,
    @Body()
    body: {
      conversationId: string;
      senderName?: string;
      content: string;
      type?: string;
    },
  ) {
    if (!guest?._id) {
      throw new BadRequestException('Bạn chưa đăng nhập');
    }

    return firstValueFrom(
      this.chatClient.send('chat.sendMessage', {
        conversationId: body.conversationId,
        senderId: guest._id,
        requesterId: guest._id,
        senderName: body.senderName ?? guest.fullname,
        content: body.content,
        type: body.type || 'TEXT',
      }),
    );
  }

  /**
   * Get messages for a conversation (cursor-based). Membership enforced by chat-service.
   */
  @Get('messages/:conversationId')
  async getMessages(
    @Guest() guest: any,
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    if (!guest?._id) {
      throw new BadRequestException('Bạn chưa đăng nhập');
    }
    return firstValueFrom(
      this.chatClient.send('chat.getMessages', {
        conversationId,
        requesterId: guest._id,
        limit: limit ? parseInt(limit) : 30,
        cursor: cursor || undefined,
      }),
    );
  }

  /**
   * Mark messages as read for the authenticated user
   */
  @Patch('read/:conversationId')
  async markAsRead(
    @Guest() guest: any,
    @Param('conversationId') conversationId: string,
  ) {
    if (!guest?._id) {
      throw new BadRequestException('Bạn chưa đăng nhập');
    }
    return firstValueFrom(
      this.chatClient.send('chat.markAsRead', {
        conversationId,
        userId: guest._id,
        requesterId: guest._id,
      }),
    );
  }

  /**
   * Get unread message count for the authenticated user
   */
  @Get('unread')
  async getUnreadCount(@Guest() guest: any) {
    if (!guest?._id) {
      throw new BadRequestException('Bạn chưa đăng nhập');
    }
    return firstValueFrom(
      this.chatClient.send('chat.getUnreadCount', { userId: guest._id }),
    );
  }
}
