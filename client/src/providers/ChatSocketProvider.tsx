'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import useAuthUser from '@/hooks/useAuthUser';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL + '/chat';

/**
 * Global chat socket provider — connects once when user is logged in.
 * Listens for `message:new` to invalidate unread count in real-time,
 * so the Header badge updates instantly without polling.
 */
export default function ChatSocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthUser();
    const queryClient = useQueryClient();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const userId = user?._id;
        if (!userId) {
            // Disconnect if user logs out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        // Already connected for this user
        if (socketRef.current?.connected) return;

        const socket = io(SOCKET_URL, {
            query: { userId },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 3000,
        });

        socketRef.current = socket;

        // When a new message arrives globally, refresh unread count + conversation list
        socket.on('message:new', () => {
            queryClient.invalidateQueries({ queryKey: ['chat-unread'] });
            queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        });

        // Also refresh when conversations are created
        socket.on('conversation:created', () => {
            queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user?._id, queryClient]);

    return <>{children}</>;
}
