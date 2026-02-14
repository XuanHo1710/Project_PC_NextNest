'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Input, Button, Avatar, Empty, Badge, Spin } from 'antd';
import {
    SendOutlined,
    ArrowLeftOutlined,
    SmileOutlined,
    MessageOutlined,
    SearchOutlined,
    LoadingOutlined,
    PictureOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import useAuthUser from '@/hooks/useAuthUser';
import Link from 'next/link';
import Breadcrumb from '@/components/client/Breadcrumb/Breadcrumb';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import {
    useConversations,
    useFindOrCreateConversation,
    useMessages,
    useMarkAsRead,
} from '@/hooks/client/useChat';
import { useChatSocket } from '@/hooks/client/useChatSocket';
import { IConversation, IChatMessage } from '@/services/client/chat.client.service';

export default function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthUser();
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [input, setInput] = useState('');
    const [searchConv, setSearchConv] = useState('');
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const userId = user?._id;
    const userName = user?.email?.split('@')[0] || 'Khách';

    const sellerId = searchParams.get('sellerId');
    const sellerName = searchParams.get('sellerName') || 'Người bán';

    // ==================== API Hooks ====================
    const { data: conversations = [], isLoading: loadingConvs } = useConversations(userId);
    const findOrCreate = useFindOrCreateConversation();
    const {
        data: messagesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: loadingMessages,
    } = useMessages(activeConvId);
    const markAsReadMut = useMarkAsRead();

    // ==================== Socket ====================
    const {
        sendMessage: socketSendMessage,
        startTyping,
        stopTyping,
        markAsRead: socketMarkAsRead,
        isUserOnline,
        getTypingUsers,
    } = useChatSocket({
        userId,
        activeConversationId: activeConvId,
        onNewMessage: useCallback(
            (msg: IChatMessage) => {
                // Auto-scroll when receiving new messages in active conversation
                if (msg.conversationId === activeConvId) {
                    setTimeout(() => {
                        virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'smooth' });
                    }, 100);

                    // Auto mark as read
                    if (msg.senderId !== userId) {
                        socketMarkAsRead(activeConvId);
                    }
                }
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [activeConvId, userId],
        ),
    });

    // Flatten paginated messages (oldest first for Virtuoso)
    const messages = useMemo<IChatMessage[]>(() => {
        if (!messagesData?.pages) return [];
        // Pages: first page = newest, subsequent pages = older
        // Each page's items are already in chronological order
        // Reverse pages order so older pages come first
        const allPages = [...messagesData.pages].reverse();
        return allPages.flatMap((page) => page.items);
    }, [messagesData]);

    // ==================== Auto-create conversation from URL params ====================
    useEffect(() => {
        if (sellerId && userId && !findOrCreate.isPending) {
            const existing = conversations.find((c) =>
                c.participants.some((p) => p.userId === sellerId),
            );
            if (existing) {
                setActiveConvId(existing._id);
            } else if (!findOrCreate.isSuccess) {
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
                            setActiveConvId((conv as unknown as IConversation)._id);
                        },
                    },
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sellerId, userId, conversations]);

    // Mark as read when switching conversations
    useEffect(() => {
        if (activeConvId && userId) {
            socketMarkAsRead(activeConvId);
            markAsReadMut.mutate({ conversationId: activeConvId, userId });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConvId, userId]);

    // Virtuoso firstItemIndex for prepending older messages
    const START_INDEX = 10000;
    const firstItemIndex = useMemo(() => Math.max(0, START_INDEX - messages.length), [messages.length]);

    const handleStartReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ==================== Send message via socket ====================
    const handleSend = () => {
        if (!input.trim() || !activeConvId || !userId) return;

        socketSendMessage({
            conversationId: activeConvId,
            senderName: userName,
            content: input.trim(),
            type: 'TEXT',
        });

        setInput('');
        stopTyping(activeConvId);

        setTimeout(() => {
            virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'smooth' });
        }, 100);
    };

    // ==================== Typing indicator ====================
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);

        if (!activeConvId) return;

        // Start typing
        startTyping(activeConvId);

        // Auto-stop typing after 2s of inactivity
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            if (activeConvId) stopTyping(activeConvId);
        }, 2000);
    };

    // ==================== Helpers ====================
    const getOtherParticipant = (conv: IConversation) => {
        return conv.participants.find((p) => p.userId !== userId) || conv.participants[0];
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatConvTime = (timestamp?: string) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60_000) return 'Vừa xong';
        if (diff < 3600_000) return `${Math.floor(diff / 60_000)}p`;
        if (diff < 86400_000) return formatTime(timestamp);
        return date.toLocaleDateString('vi-VN');
    };

    const shouldShowDateSeparator = (index: number) => {
        if (index === 0) return true;
        const current = messages[index];
        const prev = messages[index - 1];
        if (!current || !prev) return false;
        return new Date(current.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
    };

    const filteredConversations = conversations.filter((c) => {
        const other = getOtherParticipant(c);
        return other.name.toLowerCase().includes(searchConv.toLowerCase());
    });

    const activeConv = conversations.find((c) => c._id === activeConvId);
    const activeOther = activeConv ? getOtherParticipant(activeConv) : null;
    const activeTyping = activeConvId ? getTypingUsers(activeConvId) : [];

    const VirtuosoHeader = () => (
        <div className="flex justify-center py-3">
            {isFetchingNextPage ? (
                <Spin indicator={<LoadingOutlined className="text-blue-500" />} size="small" />
            ) : hasNextPage ? (
                <span className="text-xs text-gray-400">Cuộn lên để tải thêm</span>
            ) : (
                <span className="text-xs text-gray-400">Đầu cuộc trò chuyện</span>
            )}
        </div>
    );

    // ==================== Render message content based on type ====================
    const renderMessageContent = (msg: IChatMessage) => {
        switch (msg.type) {
            case 'IMAGE':
                return (
                    <div className="max-w-xs">
                        <img
                            src={msg.content}
                            alt="Ảnh"
                            className="rounded-lg max-w-full h-auto cursor-pointer"
                            onClick={() => window.open(msg.content, '_blank')}
                        />
                    </div>
                );
            case 'VIDEO':
                return (
                    <div className="max-w-xs">
                        <video
                            src={msg.content}
                            controls
                            className="rounded-lg max-w-full h-auto"
                        />
                    </div>
                );
            default:
                return <>{msg.content}</>;
        }
    };

    // ==================== No user — unauthenticated ====================
    if (!userId) {
        return (
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white min-h-screen">
                <div className="mx-5 xl:mx-20">
                    <Breadcrumb items={[{ label: 'Tin nhắn' }]} />
                </div>
                <div className="max-w-2xl mx-auto py-20 px-4">
                    <Empty
                        image={<MessageOutlined className="text-6xl text-gray-300" />}
                        description="Vui lòng đăng nhập để sử dụng tin nhắn"
                    >
                        <Link href="/login">
                            <Button type="primary">Đăng nhập</Button>
                        </Link>
                    </Empty>
                </div>
            </div>
        );
    }

    // ==================== Render ====================
    return (
        <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white min-h-screen">
            <div className="mx-5 xl:mx-20">
                <Breadcrumb
                    items={[
                        { label: 'Tin nhắn' },
                        ...(activeOther ? [{ label: activeOther.name }] : []),
                    ]}
                />
            </div>
            <div className="max-w-7xl h-[calc(100vh-140px)] flex bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden my-4 mx-5 xl:mx-20">
                {/* Sidebar - Conversation List */}
                <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => router.back()}
                                className="!p-1"
                                size="small"
                            />
                            <h3 className="font-semibold text-base m-0 flex-1">Tin nhắn</h3>
                        </div>
                        <Input
                            placeholder="Tìm cuộc trò chuyện..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            size="small"
                            value={searchConv}
                            onChange={(e) => setSearchConv(e.target.value)}
                            className="!rounded-full"
                            allowClear
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingConvs ? (
                            <div className="flex justify-center py-8">
                                <Spin size="small" />
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Không có cuộc trò chuyện
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const other = getOtherParticipant(conv);
                                const online = isUserOnline(other.userId);
                                const unread = conv.unreadCount?.[userId!] || 0;

                                return (
                                    <div
                                        key={conv._id}
                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${activeConvId === conv._id
                                            ? 'bg-blue-50 dark:bg-gray-700 border-l-2 border-l-blue-500'
                                            : ''
                                            }`}
                                        onClick={() => setActiveConvId(conv._id)}
                                    >
                                        <Badge count={unread} size="small">
                                            <div className="relative">
                                                <Avatar
                                                    className="bg-blue-500 shrink-0"
                                                    size={40}
                                                    src={other.avatar || undefined}
                                                >
                                                    {other.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                {/* Online indicator dot */}
                                                {online && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                                                )}
                                            </div>
                                        </Badge>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="font-medium text-sm m-0 truncate">{other.name}</p>
                                                <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                                                    {formatConvTime(conv.lastMessage?.timestamp)}
                                                </span>
                                            </div>
                                            <p className={`text-xs m-0 truncate ${unread > 0 ? 'text-gray-800 dark:text-white font-semibold' : 'text-gray-500'}`}>
                                                {conv.lastMessage?.content || 'Bắt đầu trò chuyện...'}
                                            </p>
                                            <span className="text-[10px] text-blue-400">
                                                {other.role === 'seller' ? 'Người bán' : 'Người mua'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {activeConv && activeOther ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                                <div className="relative">
                                    <Avatar
                                        className="bg-blue-500 shrink-0"
                                        size={40}
                                        src={activeOther.avatar || undefined}
                                    >
                                        {activeOther.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    {isUserOnline(activeOther.userId) && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-white truncate m-0">
                                        {activeOther.name}
                                    </p>
                                    <p className={`text-xs m-0 ${isUserOnline(activeOther.userId) ? 'text-green-500' : 'text-gray-400'}`}>
                                        {isUserOnline(activeOther.userId)
                                            ? 'Đang hoạt động'
                                            : activeOther.role === 'seller'
                                                ? 'Người bán'
                                                : 'Người mua'}
                                    </p>
                                </div>
                            </div>

                            {/* Chat Messages — Virtuoso */}
                            <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
                                {loadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Spin size="large" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <SmileOutlined className="text-4xl mb-3" />
                                        <p className="text-sm">Bắt đầu cuộc trò chuyện với {activeOther.name}</p>
                                        <p className="text-xs">Hãy gửi tin nhắn đầu tiên!</p>
                                    </div>
                                ) : (
                                    <Virtuoso
                                        key={activeConvId}
                                        ref={virtuosoRef}
                                        style={{ height: '100%' }}
                                        data={messages}
                                        firstItemIndex={firstItemIndex}
                                        initialTopMostItemIndex={messages.length - 1}
                                        followOutput="smooth"
                                        startReached={handleStartReached}
                                        components={{ Header: VirtuosoHeader }}
                                        itemContent={(index, msg) => {
                                            const actualIndex = index - firstItemIndex;
                                            const showDate = shouldShowDateSeparator(actualIndex);

                                            if (msg.type === 'SYSTEM') {
                                                return (
                                                    <div className="px-4">
                                                        <div className="flex justify-center my-2">
                                                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-500 text-xs px-3 py-1 rounded-full">
                                                                {msg.content}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            const isMe = msg.senderId === userId;

                                            return (
                                                <div className="px-4">
                                                    {showDate && (
                                                        <div className="flex items-center justify-center my-3">
                                                            <div className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[11px] px-3 py-1 rounded-full">
                                                                {new Date(msg.createdAt).toLocaleDateString('vi-VN', {
                                                                    weekday: 'long',
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        {!isMe && (
                                                            <Avatar
                                                                className="bg-blue-500 shrink-0 mt-1 mr-2"
                                                                size={28}
                                                                src={activeOther.avatar || undefined}
                                                            >
                                                                {activeOther.name.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                        )}
                                                        <div className="max-w-[75%]">
                                                            <div
                                                                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                                                                    ? 'bg-blue-500 text-white rounded-br-sm'
                                                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
                                                                    }`}
                                                            >
                                                                {renderMessageContent(msg)}
                                                            </div>
                                                            <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                                                {formatTime(msg.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                )}
                            </div>

                            {/* Typing indicator */}
                            {activeTyping.length > 0 && (
                                <div className="px-4 py-1 bg-gray-50 dark:bg-gray-900">
                                    <p className="text-xs text-gray-400 italic m-0">
                                        {activeOther.name} đang nhập...
                                    </p>
                                </div>
                            )}

                            {/* Chat Input */}
                            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Nhập tin nhắn..."
                                        value={input}
                                        onChange={handleInputChange}
                                        onPressEnter={handleSend}
                                        className="!rounded-full"
                                        size="large"
                                    />
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        size="large"
                                        icon={<SendOutlined />}
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <MessageOutlined className="text-5xl mb-3" />
                                <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
