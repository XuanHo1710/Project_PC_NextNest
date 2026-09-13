'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import useAuthUser from '@/hooks/useAuthUser';
import useOnlineUsersStore from '@/hooks/useOnlineUsers';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL + '/chat';

/**
 * Global chat socket provider — connects once when user is logged in.
 * Listens for `message:new` to invalidate unread count in real-time,
 * and tracks global online status for all users via Zustand store.
 */
export default function ChatSocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthUser();
    const queryClient = useQueryClient();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const userId = user?._id;
        const { addOnlineUser, removeOnlineUser, setOnlineUsers } = useOnlineUsersStore.getState();

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
            // Identity comes from the httpOnly cookie verified server-side.
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 3000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            // Fetch the initial list of online users on connect/reconnect
            socket.emit('users:online', {}, (res: { onlineUsers: string[] }) => {
                if (res?.onlineUsers) {
                    setOnlineUsers(res.onlineUsers);
                }
            });
        });

        // ---- Online status (global) ----
        socket.on('user:online', (data: { userId: string }) => {
            addOnlineUser(data.userId);
        });

        socket.on('user:offline', (data: { userId: string; lastActive: string }) => {
            removeOnlineUser(data.userId, data.lastActive);
        });

        // ---- Message / conversation notifications ----
        socket.on('message:new', () => {
            queryClient.invalidateQueries({ queryKey: ['chat-unread'] });
            queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        });

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
