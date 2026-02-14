'use client';

import { use } from 'react';
import ChatContent from '@/components/client/Chat/ChatContent';

interface ChatConversationPageProps {
    params: Promise<{ conversationId: string }>;
}

export default function ChatConversationPage({ params }: ChatConversationPageProps) {
    const { conversationId } = use(params);
    return <ChatContent initialConversationId={conversationId} />;
}
