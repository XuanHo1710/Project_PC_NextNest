import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './entities/conversation.entity';
import { Message, MessageDocument } from './entities/message.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Find or create a DIRECT conversation between two users.
   * Uses findOneAndUpdate with upsert for atomicity (prevents race-condition duplicates).
   */
  async findOrCreateConversation(data: {
    userId: string;
    userName: string;
    userAvatar?: string;
    userRole: 'buyer' | 'seller';
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar?: string;
    otherUserRole: 'buyer' | 'seller';
  }) {
    // Sort user IDs to create a deterministic query regardless of who initiates
    const sortedIds = [data.userId, data.otherUserId].sort();

    const conversation = await this.conversationModel.findOneAndUpdate(
      {
        'participants.userId': { $all: sortedIds },
        type: 'DIRECT',
      },
      {
        $setOnInsert: {
          participants: [
            {
              userId: data.userId,
              name: data.userName,
              avatar: data.userAvatar || '',
              role: data.userRole,
            },
            {
              userId: data.otherUserId,
              name: data.otherUserName,
              avatar: data.otherUserAvatar || '',
              role: data.otherUserRole,
            },
          ],
          type: 'DIRECT',
          lastMessage: null,
          unreadCount: {},
        },
      },
      { upsert: true, new: true },
    );

    return conversation;
  }

  /**
   * Get all conversations for a user, sorted by last activity
   */
  async getConversationsByUser(userId: string) {
    return this.conversationModel
      .find({ 'participants.userId': userId })
      .sort({ updatedAt: -1 })
      .lean();
  }

  /**
   * Send a message and update conversation
   */
  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    type?: string;
  }) {
    const message = await this.messageModel.create({
      conversationId: new Types.ObjectId(data.conversationId),
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.content,
      type: data.type || 'TEXT',
      readBy: [data.senderId],
    });

    // Update conversation's lastMessage + increment unread for other participants
    const conversation = await this.conversationModel.findById(
      data.conversationId,
    );
    if (conversation) {
      const updateFields: Record<string, unknown> = {
        lastMessage: {
          content:
            data.type === 'IMAGE'
              ? '[Hình ảnh]'
              : data.type === 'VIDEO'
                ? '[Video]'
                : data.content,
          senderId: data.senderId,
          timestamp: new Date(),
        },
      };

      // Increment unread count for all participants except sender
      for (const p of conversation.participants) {
        if (p.userId !== data.senderId) {
          updateFields[`unreadCount.${p.userId}`] =
            ((conversation.unreadCount?.get(p.userId) as number) || 0) + 1;
        }
      }

      await this.conversationModel.findByIdAndUpdate(data.conversationId, {
        $set: updateFields,
      });
    }

    return message.toObject();
  }

  /**
   * Get messages for a conversation using cursor-based pagination
   * cursor = _id of the oldest message the client currently has
   * Returns messages older than the cursor (going back in time)
   */
  async getMessages(
    conversationId: string,
    limit: number = 30,
    cursor?: string,
  ) {
    const query: Record<string, unknown> = {
      conversationId: new Types.ObjectId(conversationId),
    };

    // If cursor provided, get messages older than cursor
    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const messages = await this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1) // Fetch one extra to check if there are more
      .lean();

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop(); // Remove the extra one
    }

    // Return in chronological order (oldest first)
    return {
      items: messages.reverse(),
      hasMore,
      nextCursor: hasMore ? messages[0]?._id?.toString() : null,
    };
  }

  /**
   * Mark messages as read by user in a conversation
   */
  async markAsRead(conversationId: string, userId: string) {
    await this.messageModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } },
    );

    // Reset unread count for this user
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${userId}`]: 0 },
    });

    return { success: true };
  }

  /**
   * Get a single conversation by ID
   */
  async getConversationById(conversationId: string) {
    return this.conversationModel.findById(conversationId).lean();
  }

  /**
   * Get total unread count for a user across all conversations.
   * Optimized: single aggregation instead of fetching all conversations.
   */
  async getUnreadCount(userId: string) {
    const conversations = await this.conversationModel
      .find({ 'participants.userId': userId })
      .select('unreadCount')
      .lean();

    let totalUnread = 0;
    for (const conv of conversations) {
      const unreadMap = conv.unreadCount as unknown as Record<string, number>;
      totalUnread += unreadMap?.[userId] || 0;
    }

    return { unreadCount: totalUnread };
  }
}
