import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Inject,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '@project-pc/common';
import { firstValueFrom } from 'rxjs';
import { ChatGateway } from './chat.gateway';

@Controller('/client/chat')
export class ChatController {
  constructor(
    @Inject(MICROSERVICE.CHAT_SERVICE)
    private readonly chatClient: ClientProxy,
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * Find or create a conversation with another user
   */
  @Post('conversation')
  async findOrCreateConversation(
    @Body()
    body: {
      userId: string;
      userName: string;
      userAvatar?: string;
      userRole: 'buyer' | 'seller';
      otherUserId: string;
      otherUserName: string;
      otherUserAvatar?: string;
      otherUserRole: 'buyer' | 'seller';
    },
  ) {
    const conversation = await firstValueFrom(
      this.chatClient.send('chat.findOrCreateConversation', body),
    );

    // Notify all participants via socket (real-time)
    if (conversation?._id && conversation?.participants) {
      this.chatGateway.notifyConversationCreated(conversation);
    }

    return conversation;
  }

  /**
   * Get conversations for current user
   */
  @Get('conversations/:userId')
  async getConversations(@Param('userId') userId: string) {
    return firstValueFrom(
      this.chatClient.send('chat.getConversationsByUser', { userId }),
    );
  }

  /**
   * Send a message
   */
  @Post('message')
  async sendMessage(
    @Body()
    body: {
      conversationId: string;
      senderId: string;
      senderName: string;
      content: string;
      type?: string;
    },
  ) {
    return firstValueFrom(this.chatClient.send('chat.sendMessage', body));
  }

  /**
   * Get messages for a conversation (cursor-based)
   */
  @Get('messages/:conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return firstValueFrom(
      this.chatClient.send('chat.getMessages', {
        conversationId,
        limit: limit ? parseInt(limit) : 30,
        cursor: cursor || undefined,
      }),
    );
  }

  /**
   * Mark messages as read
   */
  @Patch('read/:conversationId')
  async markAsRead(
    @Param('conversationId') conversationId: string,
    @Body() body: { userId: string },
  ) {
    return firstValueFrom(
      this.chatClient.send('chat.markAsRead', {
        conversationId,
        userId: body.userId,
      }),
    );
  }

  /**
   * Get unread message count
   */
  @Get('unread/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    return firstValueFrom(
      this.chatClient.send('chat.getUnreadCount', { userId }),
    );
  }
}
