'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Input, Button, Avatar, Empty, Badge, Spin, message as antMessage, Tooltip } from 'antd';
import {
    SendOutlined,
    ArrowLeftOutlined,
    SmileOutlined,
    MessageOutlined,
    SearchOutlined,
    LoadingOutlined,
    PictureOutlined,
    VideoCameraOutlined,
    PaperClipOutlined,
    CloseCircleFilled,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useAuthUser from '@/hooks/useAuthUser';
import Link from 'next/link';
import Breadcrumb from '@/components/client/Breadcrumb/Breadcrumb';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import {
    useConversations,
    useMessages,
    useMarkAsRead,
} from '@/hooks/client/useChat';
import { useChatSocket } from '@/hooks/client/useChatSocket';
import { IConversation, IChatMessage } from '@/services/client/chat.client.service';
import { timeAgo } from '@/utils/formatDateTime';
import { UploadImage } from '@/utils/uploadImage';

interface ChatContentProps {
    /** Pre-selected conversation ID from URL */
    initialConversationId?: string;
}

export default function ChatContent({ initialConversationId }: ChatContentProps) {
    const router = useRouter();
    const { user } = useAuthUser();
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState('');
    const [searchConv, setSearchConv] = useState('');
    const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId ?? null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [uploading, setUploading] = useState(false);
    const [previewFiles, setPreviewFiles] = useState<{ file: File; url: string; type: 'IMAGE' | 'VIDEO' }[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const userId = user?._id;
    const userName = user?.fullname || 'Khách';

    // Sync when initialConversationId changes (e.g., from URL navigation)
    useEffect(() => {
        if (initialConversationId) {
            setActiveConvId(initialConversationId);
        }
    }, [initialConversationId]);

    // ==================== API Hooks ====================
    const { data: conversations = [], isLoading: loadingConvs } = useConversations(userId);
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
        getLastActive,
    } = useChatSocket({
        userId,
        activeConversationId: activeConvId,
        onNewMessage: useCallback(
            (msg: IChatMessage) => {
                if (msg.conversationId === activeConvId) {
                    setTimeout(() => {
                        virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'smooth' });
                    }, 100);

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
        const allPages = [...messagesData.pages].reverse();
        return allPages.flatMap((page) => page.items);
    }, [messagesData]);

    // Mark as read when switching conversations
    useEffect(() => {
        if (activeConvId && userId) {
            socketMarkAsRead(activeConvId);
            markAsReadMut.mutate({ conversationId: activeConvId, userId });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConvId, userId]);

    // Update URL when switching conversations in sidebar (no page reload)
    const handleSelectConversation = useCallback(
        (convId: string) => {
            setActiveConvId(convId);
            window.history.replaceState({}, '', `/chat/${convId}`);
        },
        [],
    );

    // Virtuoso firstItemIndex for prepending older messages
    const START_INDEX = 10000;
    const firstItemIndex = useMemo(() => Math.max(0, START_INDEX - messages.length), [messages.length]);

    const handleStartReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ==================== Send message via socket ====================
    const handleSend = async () => {
        if (!activeConvId || !userId) return;

        // Send pending media files
        if (previewFiles.length > 0) {
            setUploading(true);
            try {
                for (const pf of previewFiles) {
                    const url = await UploadImage(pf.file);
                    socketSendMessage({
                        conversationId: activeConvId,
                        senderName: userName,
                        content: url,
                        type: pf.type,
                    });
                }
                setPreviewFiles([]);
            } catch {
                antMessage.error('Upload thất bại, vui lòng thử lại');
            } finally {
                setUploading(false);
            }
        }

        // Send text if any
        if (input.trim()) {
            socketSendMessage({
                conversationId: activeConvId,
                senderName: userName,
                content: input.trim(),
                type: 'TEXT',
            });
            setInput('');
            stopTyping(activeConvId);
        }

        setTimeout(() => {
            virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'smooth' });
        }, 150);
    };

    // ==================== File upload helpers ====================
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newPreviews: typeof previewFiles = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 50 * 1024 * 1024) {
                antMessage.warning(`${file.name} vượt quá 50MB, bỏ qua`);
                continue;
            }
            const isVideo = file.type.startsWith('video/');
            const isImage = file.type.startsWith('image/');
            if (!isVideo && !isImage) {
                antMessage.warning(`${file.name} không phải ảnh/video, bỏ qua`);
                continue;
            }
            newPreviews.push({
                file,
                url: URL.createObjectURL(file),
                type: isVideo ? 'VIDEO' : 'IMAGE',
            });
        }
        if (newPreviews.length > 0) {
            setPreviewFiles((prev) => [...prev, ...newPreviews]);
        }
    };

    const removePreview = (index: number) => {
        setPreviewFiles((prev) => {
            const removed = prev[index];
            URL.revokeObjectURL(removed.url);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Drag & drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ==================== Typing indicator ====================
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);

        if (!activeConvId) return;

        startTyping(activeConvId);

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
                Spin indicator={<LoadingOutlined className="text-blue-500" />} size="small" />
            ) : hasNextPage ? (
            <span className="text-xs text-gray-400">Cuộn lên để tải thêm</span>
            ) : messages.length > 0 ? (
            <span className="text-xs text-gray-400">Đầu cuộc trò chuyện</span>
            ) : null}
        </div>
    );

    // ==================== Render message content based on type ====================
    const renderMessageContent = (msg: IChatMessage, isMe: boolean) => {
        switch (msg.type) {
            case 'IMAGE':
                return (
                    <div className="max-w-[280px]">
                        <img
                            src={msg.content}
                            alt="Ảnh"
                            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                            loading="lazy"
                            onClick={() => window.open(msg.content, '_blank')}
                        />
                    </div>
                );
            case 'VIDEO':
                return (
                    <div className="max-w-[320px]">
                        <video
                            src={msg.content}
                            controls
                            preload="metadata"
                            className="rounded-lg max-w-full h-auto"
                        />
                    </div>
                );
            default:
                return <span className="break-words whitespace-pre-wrap">{msg.content}</span>;
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
            <div className="max-w-7xl h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] flex bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden my-2 md:my-4 mx-2 md:mx-5 xl:mx-20">
                {/* Sidebar - Conversation List */}
                <div className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex-col shrink-0 ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
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
                                        onClick={() => handleSelectConversation(conv._id)}
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
                <div
                    className={`flex-1 flex-col min-w-0 relative ${activeConvId ? 'flex' : 'hidden md:flex'} ${isDragging ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
                    onDragOver={activeConv ? handleDragOver : undefined}
                    onDragLeave={activeConv ? handleDragLeave : undefined}
                    onDrop={activeConv ? handleDrop : undefined}
                >
                    {/* Drag overlay */}
                    {isDragging && (
                        <div className="absolute inset-0 bg-blue-50/80 dark:bg-blue-900/40 z-50 flex items-center justify-center pointer-events-none">
                            <div className="bg-white dark:bg-gray-800 rounded-xl px-8 py-6 shadow-lg text-center">
                                <PictureOutlined className="text-4xl text-blue-500 mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300 m-0">Thả ảnh/video vào đây</p>
                            </div>
                        </div>
                    )}

                    {activeConv && activeOther ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                                {/* Mobile back button */}
                                <button
                                    onClick={() => {
                                        setActiveConvId(null);
                                        window.history.replaceState({}, '', '/chat');
                                    }}
                                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
                                >
                                    <ArrowLeftOutlined className="text-gray-600 dark:text-gray-300" />
                                </button>
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
                                            : getLastActive(activeOther.userId)
                                                ? `Hoạt động ${timeAgo(getLastActive(activeOther.userId)!)}`
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
                                        overscan={{ main: 200, reverse: 400 }}
                                        increaseViewportBy={{ top: 400, bottom: 200 }}
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
                                                        <div className={`max-w-[75%] ${msg.type === 'IMAGE' || msg.type === 'VIDEO' ? '' : ''}`}>
                                                            <div
                                                                className={`${msg.type === 'IMAGE' || msg.type === 'VIDEO'
                                                                    ? 'p-1 rounded-xl'
                                                                    : 'px-4 py-2.5 rounded-2xl text-sm leading-relaxed'
                                                                    } ${isMe
                                                                        ? msg.type === 'IMAGE' || msg.type === 'VIDEO'
                                                                            ? 'bg-blue-500/10 rounded-br-sm'
                                                                            : 'bg-blue-500 text-white rounded-br-sm'
                                                                        : msg.type === 'IMAGE' || msg.type === 'VIDEO'
                                                                            ? 'bg-white dark:bg-gray-700 rounded-bl-sm shadow-sm'
                                                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
                                                                    }`}
                                                            >
                                                                {renderMessageContent(msg, isMe)}
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

                            {/* File preview strip */}
                            {previewFiles.length > 0 && (
                                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {previewFiles.map((pf, i) => (
                                            <div key={i} className="relative shrink-0 group">
                                                {pf.type === 'IMAGE' ? (
                                                    <img
                                                        src={pf.url}
                                                        alt="Preview"
                                                        className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                                        <VideoCameraOutlined className="text-xl text-gray-500" />
                                                    </div>
                                                )}
                                                <CloseCircleFilled
                                                    className="absolute -top-1.5 -right-1.5 text-red-500 text-sm cursor-pointer bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removePreview(i)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chat Input */}
                            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={(e) => {
                                        handleFileSelect(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                                <div className="flex items-center gap-2">
                                    <Tooltip title="Gửi ảnh/video">
                                        <Button
                                            type="text"
                                            icon={<PaperClipOutlined />}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="!text-gray-500 hover:!text-blue-500"
                                            disabled={uploading}
                                        />
                                    </Tooltip>
                                    <Input
                                        placeholder="Nhập tin nhắn..."
                                        value={input}
                                        onChange={handleInputChange}
                                        onPressEnter={handleSend}
                                        className="!rounded-full"
                                        size="large"
                                        disabled={uploading}
                                    />
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        size="large"
                                        icon={uploading ? <LoadingOutlined /> : <SendOutlined />}
                                        onClick={handleSend}
                                        disabled={(!input.trim() && previewFiles.length === 0) || uploading}
                                        loading={uploading}
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
