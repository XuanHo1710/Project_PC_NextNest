import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  chatClientService,
  IConversation,
  IChatMessage,
  IMessagesResponse,
} from "@/services/client/chat.client.service";
import { message } from "antd";

// ==================== Conversations ====================

export function useConversations(userId: string | undefined) {
  return useQuery<IConversation[]>({
    queryKey: ["chat-conversations", userId],
    queryFn: () => chatClientService.getConversations(userId!),
    enabled: !!userId,
    refetchInterval: 30000, // Fallback poll (real-time via socket)
  });
}

export function useFindOrCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      userName: string;
      userAvatar?: string;
      userRole: "buyer" | "seller";
      otherUserId: string;
      otherUserName: string;
      otherUserAvatar?: string;
      otherUserRole: "buyer" | "seller";
    }) => chatClientService.findOrCreateConversation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-conversations", variables.userId],
      });
    },
  });
}

// ==================== Messages ====================

export function useMessages(
  conversationId: string | null,
  enabled: boolean = true,
) {
  return useInfiniteQuery<IMessagesResponse>({
    queryKey: ["chat-messages", conversationId],
    queryFn: ({ pageParam }) =>
      chatClientService.getMessages(
        conversationId!,
        30,
        pageParam as string | undefined,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!conversationId && enabled,
  });
}

/**
 * HTTP fallback for sending messages (used when socket is unavailable)
 * In normal flow, messages are sent via socket in useChatSocket.
 */
export function useSendMessageHttp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      conversationId: string;
      senderId: string;
      senderName: string;
      content: string;
      type?: string;
    }) => chatClientService.sendMessage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chat-conversations"],
      });
    },
    onError: () => {
      message.error("Gửi tin nhắn thất bại");
    },
  });
}

// ==================== Read Status ====================

export function useMarkAsRead() {
  return useMutation({
    mutationFn: (data: { conversationId: string; userId: string }) =>
      chatClientService.markAsRead(data.conversationId, data.userId),
  });
}

export function useUnreadCount(userId: string | undefined) {
  return useQuery<{ unreadCount: number }>({
    queryKey: ["chat-unread", userId],
    queryFn: () => chatClientService.getUnreadCount(userId!),
    enabled: !!userId,
    refetchInterval: 60000, // Fallback poll every 60s (real-time via socket)
  });
}
