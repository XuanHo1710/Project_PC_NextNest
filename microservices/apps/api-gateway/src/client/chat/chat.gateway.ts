import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '@project-pc/common';
import { firstValueFrom } from 'rxjs';

// userId -> Set<socketId> (multiple devices/tabs)
const userSockets = new Map<string, Set<string>>();

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('ChatGateway');

  constructor(
    @Inject(MICROSERVICE.CHAT_SERVICE)
    private readonly chatClient: ClientProxy,
  ) {}

  // ============ CONNECTION ============

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.query.userId as string;

      if (!userId) {
        this.logger.warn(`Client ${client.id} connected without userId`);
        client.disconnect();
        return;
      }

      client.data.userId = userId;

      // Track socket per user (multi-device support)
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(client.id);

      // Join personal room
      client.join(`user:${userId}`);

      // Join all conversation rooms
      try {
        const conversations = await firstValueFrom(
          this.chatClient.send('chat.getConversationsByUser', { userId }),
        );
        if (Array.isArray(conversations)) {
          conversations.forEach((conv: { _id: string }) => {
            client.join(`room:${conv._id}`);
          });
        }
      } catch {
        this.logger.warn(`Failed to fetch conversations for user ${userId}`);
      }

      // Broadcast online status (only on first connection)
      const isFirstConnection = userSockets.get(userId)!.size === 1;
      if (isFirstConnection) {
        this.server.emit('user:online', { userId });
        this.logger.log(`User ${userId} is now ONLINE`);
      }
    } catch (error) {
      this.logger.error('Connection error:', error);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = client.data.userId as string;

      if (userId && userSockets.has(userId)) {
        const sockets = userSockets.get(userId)!;
        sockets.delete(client.id);

        // Only broadcast offline when all sockets gone
        if (sockets.size === 0) {
          userSockets.delete(userId);
          this.server.emit('user:offline', {
            userId,
            lastActive: new Date().toISOString(),
          });
          this.logger.log(`User ${userId} is now OFFLINE`);
        }
      }
    } catch (error) {
      this.logger.error('Disconnect error:', error);
    }
  }

  // ============ JOIN ROOM ============

  @SubscribeMessage('room:join')
  handleJoinRoom(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`room:${data.conversationId}`);
    return { success: true };
  }

  // ============ NOTIFY CONVERSATION CREATED (called from HTTP controller) ============

  notifyConversationCreated(conversation: {
    _id: string;
    participants: { userId: string }[];
  }) {
    // Notify all participants via their personal rooms
    for (const p of conversation.participants) {
      this.server
        .to(`user:${p.userId}`)
        .emit('conversation:created', conversation);

      // Auto-join their sockets to the new conversation room
      const sockets = userSockets.get(p.userId);
      if (sockets) {
        for (const socketId of sockets) {
          const s = this.server.sockets.sockets.get(socketId);
          if (s) {
            s.join(`room:${conversation._id}`);
          }
        }
      }
    }

    this.logger.log(
      `Notified participants of new conversation ${conversation._id}`,
    );
  }

  // ============ SEND MESSAGE ============

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: string;
      senderId: string;
      senderName: string;
      content: string;
      type?: string; // TEXT | IMAGE | VIDEO | SYSTEM
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId as string;
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const savedMessage = await firstValueFrom(
        this.chatClient.send('chat.sendMessage', {
          conversationId: data.conversationId,
          senderId: userId,
          senderName: data.senderName,
          content: data.content,
          type: data.type || 'TEXT',
        }),
      );

      // Broadcast to conversation room
      this.server
        .to(`room:${data.conversationId}`)
        .emit('message:new', savedMessage);

      // ALSO emit to personal rooms of all participants
      // (ensures delivery even if they haven't joined the conversation room yet)
      try {
        const conversation = await firstValueFrom(
          this.chatClient.send('chat.getConversationById', {
            conversationId: data.conversationId,
          }),
        );
        if (conversation?.participants) {
          for (const p of conversation.participants) {
            // Emit to personal room (client handles dedup)
            this.server
              .to(`user:${p.userId}`)
              .emit('message:new', savedMessage);

            // Auto-join their sockets to the room if not already
            const sockets = userSockets.get(p.userId);
            if (sockets) {
              for (const socketId of sockets) {
                const s = this.server.sockets.sockets.get(socketId);
                if (s) {
                  s.join(`room:${data.conversationId}`);
                }
              }
            }
          }
        }
      } catch {
        // Non-critical: personal room notification failed
        this.logger.warn('Failed to notify personal rooms');
      }

      return { success: true, message: savedMessage };
    } catch (err) {
      this.logger.error('Failed to send message:', err);
      return { success: false, error: 'Failed to send message' };
    }
  }

  // ============ TYPING INDICATOR ============

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    client.to(`room:${data.conversationId}`).emit('typing:start', {
      conversationId: data.conversationId,
      userId,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    client.to(`room:${data.conversationId}`).emit('typing:stop', {
      conversationId: data.conversationId,
      userId,
    });
  }

  // ============ MARK AS READ ============

  @SubscribeMessage('message:read')
  async handleMarkAsRead(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId as string;
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      await firstValueFrom(
        this.chatClient.send('chat.markAsRead', {
          conversationId: data.conversationId,
          userId,
        }),
      );

      // Notify others in the room
      client.to(`room:${data.conversationId}`).emit('message:read:updated', {
        conversationId: data.conversationId,
        userId,
      });

      return { success: true };
    } catch (err) {
      this.logger.error('Failed to mark as read:', err);
      return { success: false };
    }
  }

  // ============ USER STATUS ============

  @SubscribeMessage('user:status')
  handleGetUserStatus(@MessageBody() data: { userId: string }) {
    const isOnline =
      userSockets.has(data.userId) && userSockets.get(data.userId)!.size > 0;
    return { userId: data.userId, isOnline };
  }

  @SubscribeMessage('users:online')
  handleGetOnlineUsers() {
    return { onlineUsers: Array.from(userSockets.keys()) };
  }
}
