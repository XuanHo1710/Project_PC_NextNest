import axiosClient from "@/config/axiosClient";

// ==================== Types ====================
export interface IChatParticipant {
  userId: string;
  name: string;
  avatar: string;
  role: "buyer" | "seller";
}

export interface IConversation {
  _id: string;
  participants: IChatParticipant[];
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: string;
  } | null;
  unreadCount?: Record<string, number>;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface IChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "SYSTEM";
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IMessagesResponse {
  items: IChatMessage[];
  hasMore: boolean;
  nextCursor: string | null;
}

// ==================== Service ====================
class ChatClientService {
  /**
   * Find or create a conversation with another user
   */
  async findOrCreateConversation(data: {
    userId: string;
    userName: string;
    userAvatar?: string;
    userRole: "buyer" | "seller";
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar?: string;
    otherUserRole: "buyer" | "seller";
  }): Promise<IConversation> {
    const res = await axiosClient.post("/chat/conversation", data);
    return res.data;
  }

  /**
   * Get all conversations for the authenticated user (identity from cookie)
   */
  async getConversations(_userId?: string): Promise<IConversation[]> {
    const res = await axiosClient.get(`/chat/conversations`);
    return res.data;
  }

  /**
   * Send a message. senderId is derived server-side from the cookie.
   */
  async sendMessage(data: {
    conversationId: string;
    senderId?: string;
    senderName?: string;
    content: string;
    type?: string;
  }): Promise<IChatMessage> {
    const res = await axiosClient.post("/chat/message", data);
    return res.data;
  }

  /**
   * Get messages for a conversation (cursor-based pagination)
   */
  async getMessages(
    conversationId: string,
    limit: number = 30,
    cursor?: string,
  ): Promise<IMessagesResponse> {
    const params: Record<string, string | number> = { limit };
    if (cursor) params.cursor = cursor;
    const res = await axiosClient.get(`/chat/messages/${conversationId}`, {
      params,
    });
    return res.data;
  }

  /**
   * Mark messages as read for the authenticated user
   */
  async markAsRead(conversationId: string, _userId?: string): Promise<void> {
    await axiosClient.patch(`/chat/read/${conversationId}`, {});
  }

  /**
   * Get unread count for the authenticated user
   */
  async getUnreadCount(_userId?: string): Promise<{ unreadCount: number }> {
    const res = await axiosClient.get(`/chat/unread`);
    return res.data;
  }
}

export const chatClientService = new ChatClientService();
