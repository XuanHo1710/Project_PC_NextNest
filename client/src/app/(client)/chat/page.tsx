'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Spin } from 'antd';
import useAuthUser from '@/hooks/useAuthUser';
import {
    useConversations,
    useFindOrCreateConversation,
} from '@/hooks/client/useChat';
import ChatContent from '@/components/client/Chat/ChatContent';

/**
 * /chat — Chat landing page.
 *
 * When ?sellerId=X&sellerName=Y is present, the page finds or creates a
 * conversation and then redirects to /chat/:conversationId.
 * Otherwise it renders the chat UI without a pre-selected conversation.
 */
export default function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthUser();

    const userId = user?._id;
    const userName = user?.email?.split('@')[0] || 'Khách';

    const sellerId = searchParams.get('sellerId');
    const sellerName = searchParams.get('sellerName') || 'Người bán';

    const { data: conversations = [] } = useConversations(userId);
    const findOrCreate = useFindOrCreateConversation();
    const didRedirect = useRef(false);

    // ==================== Auto-redirect when sellerId is present ====================
    useEffect(() => {
        if (!sellerId || !userId || didRedirect.current) return;

        // Check if a conversation with this user already exists
        const existing = conversations.find((c) =>
            c.participants.some((p) => p.userId === sellerId),
        );

        if (existing) {
            didRedirect.current = true;
            router.replace(`/chat/${existing._id}`);
            return;
        }

        // Conversations loaded but no match — create one
        if (conversations.length > 0 || !findOrCreate.isPending) {
            if (!findOrCreate.isPending && !findOrCreate.isSuccess) {
                findOrCreate.mutate(
                    {
                        userId,
                        userName,
                        userRole: 'buyer',
                        otherUserId: sellerId,
                        otherUserName: sellerName,
                        otherUserRole: 'seller',
                    },
                    {
                        onSuccess: (conv) => {
                            didRedirect.current = true;
                            router.replace(`/chat/${conv._id}`);
                        },
                    },
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sellerId, userId, conversations]);

    // Show spinner while redirecting
    if (sellerId && !didRedirect.current) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <Spin size="large" tip="Đang mở cuộc trò chuyện..." />
            </div>
        );
    }

    // No sellerId params — render normal chat with no active conversation
    return <ChatContent />;
}
