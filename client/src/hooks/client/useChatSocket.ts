import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  IChatMessage,
  IConversation,
} from "@/services/client/chat.client.service";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL + "/chat";

interface UseChatSocketOptions {
  userId: string | undefined;
  activeConversationId: string | null;
  onNewMessage?: (message: IChatMessage) => void;
}

export function useChatSocket({
  userId,
  activeConversationId,
  onNewMessage,
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [lastActiveMap, setLastActiveMap] = useState<Record<string, string>>(
    {},
  );

  // Connect socket
  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Chat Socket] Connected:", socket.id);

      // Get initial online users
      socket.emit("users:online", {}, (res: { onlineUsers: string[] }) => {
        if (res?.onlineUsers) {
          setOnlineUsers(new Set(res.onlineUsers));
        }
      });
    });

    socket.on("disconnect", () => {
      console.log("[Chat Socket] Disconnected");
    });

    // ---- Online status ----
    socket.on("user:online", (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.add(data.userId);
        return next;
      });
    });

    socket.on(
      "user:offline",
      (data: { userId: string; lastActive: string }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
        setLastActiveMap((prev) => ({
          ...prev,
          [data.userId]: data.lastActive,
        }));
      },
    );

    // ---- Typing ----
    socket.on(
      "typing:start",
      (data: { conversationId: string; userId: string }) => {
        setTypingUsers((prev) => {
          const users = prev[data.conversationId] || [];
          if (users.includes(data.userId)) return prev;
          return {
            ...prev,
            [data.conversationId]: [...users, data.userId],
          };
        });
      },
    );

    socket.on(
      "typing:stop",
      (data: { conversationId: string; userId: string }) => {
        setTypingUsers((prev) => {
          const users = prev[data.conversationId] || [];
          return {
            ...prev,
            [data.conversationId]: users.filter((u) => u !== data.userId),
          };
        });
      },
    );

    // ---- Read status ----
    socket.on(
      "message:read:updated",
      (data: { conversationId: string; userId: string }) => {
        // Invalidate messages to refresh read status
        queryClient.invalidateQueries({
          queryKey: ["chat-messages", data.conversationId],
        });
      },
    );

    // ---- New conversation created ----
    socket.on("conversation:created", (conversation: IConversation) => {
      // Join the new conversation room
      socket.emit("room:join", { conversationId: conversation._id });

      // Refresh conversation list
      queryClient.invalidateQueries({
        queryKey: ["chat-conversations"],
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Listen for new messages
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewMessage = (message: IChatMessage) => {
      // Add message to TanStack Query cache
      queryClient.setQueryData<{
        pages: {
          items: IChatMessage[];
          hasMore: boolean;
          nextCursor: string | null;
        }[];
        pageParams: unknown[];
      }>(["chat-messages", message.conversationId], (old) => {
        if (!old) return old;
        const newPages = [...old.pages];
        // The first page contains the newest messages
        const firstPage = { ...newPages[0] };
        // Avoid duplicates
        if (firstPage.items.some((m) => m._id === message._id)) return old;
        firstPage.items = [...firstPage.items, message];
        newPages[0] = firstPage;
        return { ...old, pages: newPages };
      });

      // Update conversation list (lastMessage)
      queryClient.invalidateQueries({
        queryKey: ["chat-conversations"],
      });

      // Update unread count
      queryClient.invalidateQueries({
        queryKey: ["chat-unread"],
      });

      onNewMessage?.(message);
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [queryClient, onNewMessage]);

  // Join / leave conversation room
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId) return;

    socket.emit("room:join", { conversationId: activeConversationId });
  }, [activeConversationId]);

  // ---- Actions ----

  const sendMessage = useCallback(
    (data: {
      conversationId: string;
      senderName: string;
      content: string;
      type?: string;
    }) => {
      const socket = socketRef.current;
      if (!socket || !userId) return;

      socket.emit(
        "message:send",
        { ...data, senderId: userId },
        (res: { success: boolean; message?: IChatMessage; error?: string }) => {
          if (!res.success) {
            console.error("[Chat Socket] Send failed:", res.error);
          }
        },
      );
    },
    [userId],
  );

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing:start", { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing:stop", { conversationId });
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    socketRef.current?.emit("message:read", { conversationId });
  }, []);

  const isUserOnline = useCallback(
    (uid: string) => onlineUsers.has(uid),
    [onlineUsers],
  );

  const getTypingUsers = useCallback(
    (conversationId: string) => typingUsers[conversationId] || [],
    [typingUsers],
  );

  const getLastActive = useCallback(
    (uid: string) => lastActiveMap[uid] || null,
    [lastActiveMap],
  );

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    onlineUsers,
    lastActiveMap,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    isUserOnline,
    getTypingUsers,
    getLastActive,
  };
}
