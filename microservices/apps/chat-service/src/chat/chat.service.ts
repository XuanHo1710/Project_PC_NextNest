import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
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
   * Verify that the requester is a participant of the conversation.
   * Throws UnauthorizedException when the conversation does not exist or
   * the requester is not a member (avoids leaking conversation existence).
   */
  private async assertConversationMembership(
    conversationId: string,
    requesterId: string,
  ) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .select('participants')
      .lean();

    if (!conversation || !conversation.participants?.some(
      (p) => p.userId === requesterId,
    )) {
      throw new UnauthorizedException('Bạn không phải thành viên hội thoại này');
    }

    return conversation;
  }

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
   * Get conversations for a user, sorted by last activity.
   * Capped at the 50 most recent to keep payloads and query cost bounded.
   */
  async getConversationsByUser(userId: string) {
    return this.conversationModel
      .find({ 'participants.userId': userId })
      .sort({ updatedAt: -1 })
      .limit(50)
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
    requesterId?: string;
  }) {
    if (data.content && data.content.length > 4000) {
      throw new BadRequestException('Tin nhắn quá dài (tối đa 4000 ký tự)');
    }

    let senderId = data.senderId;
    let senderName = data.senderName;

    if (data.requesterId) {
      const conversation = await this.assertConversationMembership(
        data.conversationId,
        data.requesterId,
      );

      // Server-side identity: ignore client-sent sender identity
      senderId = data.requesterId;
      const participant = conversation.participants.find(
        (p) => p.userId === data.requesterId,
      );
      senderName = participant?.name || senderName;
    }

    const message = await this.messageModel.create({
      conversationId: new Types.ObjectId(data.conversationId),
      senderId,
      senderName,
      content: data.content,
      type: data.type || 'TEXT',
      readBy: [senderId],
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
          senderId,
          timestamp: new Date(),
        },
      };

      // Increment unread count for all participants except sender
      for (const p of conversation.participants) {
        if (p.userId !== senderId) {
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
    requesterId?: string,
  ) {
    if (requesterId) {
      await this.assertConversationMembership(conversationId, requesterId);
    }

    // Clamp limit to a safe range (1..100, default 20)
    const safeLimit = Math.min(Math.max(parseInt(String(limit)) || 20, 1), 100);

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
      .limit(safeLimit + 1) // Fetch one extra to check if there are more
      .lean();

    const hasMore = messages.length > safeLimit;
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
  async markAsRead(
    conversationId: string,
    userId: string,
    requesterId?: string,
  ) {
    if (requesterId) {
      await this.assertConversationMembership(conversationId, requesterId);
    }

    // Server-side identity when the gateway provides an authenticated requester
    const effectiveUserId = requesterId || userId;

    await this.messageModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        readBy: { $ne: effectiveUserId },
      },
      { $addToSet: { readBy: effectiveUserId } },
    );

    // Reset unread count for this user
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${effectiveUserId}`]: 0 },
    });

    return { success: true };
  }

  /**
   * Get a single conversation by ID
   */
  async getConversationById(conversationId: string, requesterId?: string) {
    if (requesterId) {
      await this.assertConversationMembership(conversationId, requesterId);
    }

    return this.conversationModel.findById(conversationId).lean();
  }

  /**
   * Get total unread count for a user across all conversations.
   * unreadCount is a map keyed by participant userId; a single aggregation
   * unwinds participants and sums only the requesting user's counter.
   */
  async getUnreadCount(userId: string) {
    const result = await this.conversationModel
      .aggregate<{ _id: null; totalUnread?: number }>([
        { $match: { 'participants.userId': userId } },
        { $unwind: '$participants' },
        { $match: { 'participants.userId': userId } },
        {
          $group: {
            _id: null,
            totalUnread: {
              $sum: {
                $map: {
                  input: { $objectToArray: { $ifNull: ['$unreadCount', {}] } },
                  as: 'entry',
                  in: {
                    $cond: [
                      { $eq: ['$$entry.k', '$participants.userId'] },
                      '$$entry.v',
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
      ])
      .exec();

    return { unreadCount: result[0]?.totalUnread || 0 };
  }
}
