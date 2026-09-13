import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern('chat.findOrCreateConversation')
  async findOrCreateConversation(
    @Payload()
    data: {
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
    return await this.chatService.findOrCreateConversation(data);
  }

  @MessagePattern('chat.getConversationsByUser')
  async getConversationsByUser(@Payload() data: { userId: string }) {
    return await this.chatService.getConversationsByUser(data.userId);
  }

  @MessagePattern('chat.sendMessage')
  async sendMessage(
    @Payload()
    data: {
      conversationId: string;
      senderId: string;
      senderName: string;
      content: string;
      type?: string;
      requesterId?: string;
    },
  ) {
    return await this.chatService.sendMessage(data);
  }

  @MessagePattern('chat.getMessages')
  async getMessages(
    @Payload()
    data: {
      conversationId: string;
      limit?: number;
      cursor?: string;
      requesterId?: string;
    },
  ) {
    return await this.chatService.getMessages(
      data.conversationId,
      data.limit,
      data.cursor,
      data.requesterId,
    );
  }

  @MessagePattern('chat.markAsRead')
  async markAsRead(
    @Payload() data: { conversationId: string; userId: string; requesterId?: string },
  ) {
    return await this.chatService.markAsRead(
      data.conversationId,
      data.userId,
      data.requesterId,
    );
  }

  @MessagePattern('chat.getConversationById')
  async getConversationById(
    @Payload() data: { conversationId: string; requesterId?: string },
  ) {
    return await this.chatService.getConversationById(
      data.conversationId,
      data.requesterId,
    );
  }

  @MessagePattern('chat.getUnreadCount')
  async getUnreadCount(@Payload() data: { userId: string }) {
    return await this.chatService.getUnreadCount(data.userId);
  }
}
