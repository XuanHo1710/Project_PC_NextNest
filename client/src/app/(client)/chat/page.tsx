'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Input, Button, Avatar, Empty, Badge } from 'antd';
import { SendOutlined, ArrowLeftOutlined, SmileOutlined, MessageOutlined, SearchOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import useAuthUser from '@/hooks/useAuthUser';
import Link from 'next/link';
import Breadcrumb from '@/components/client/Breadcrumb/Breadcrumb';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'me' | 'other';
    timestamp: Date;
}

interface Conversation {
    id: string;
    name: string;
    avatar?: string;
    lastMessage?: string;
    lastTime?: Date;
    unread: number;
    role: 'seller' | 'buyer';
}

export default function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');
    const [messagesByConv, setMessagesByConv] = useState<Record<string, ChatMessage[]>>({});
    const [searchConv, setSearchConv] = useState('');

    const sellerId = searchParams.get('sellerId');
    const sellerName = searchParams.get('sellerName') || 'Người bán';

    // Active conversation
    const [activeConvId, setActiveConvId] = useState<string | null>(sellerId);

    // Build conversation list from URL params + any existing conversations
    const conversations = useMemo<Conversation[]>(() => {
        const convs: Conversation[] = [];
        if (sellerId) {
            convs.push({
                id: sellerId,
                name: sellerName,
                lastMessage: messagesByConv[sellerId]?.slice(-1)[0]?.text || undefined,
                lastTime: messagesByConv[sellerId]?.slice(-1)[0]?.timestamp || undefined,
                unread: 0,
                role: 'seller',
            });
        }
        // In future: fetch real conversations from chat service
        return convs;
    }, [sellerId, sellerName, messagesByConv]);

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchConv.toLowerCase())
    );

    const activeConv = conversations.find(c => c.id === activeConvId);
    const messages = activeConvId ? (messagesByConv[activeConvId] || []) : [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (sellerId && !activeConvId) {
            setActiveConvId(sellerId);
        }
    }, [sellerId, activeConvId]);

    const handleSend = () => {
        if (!input.trim() || !activeConvId) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: input.trim(),
            sender: 'me',
            timestamp: new Date(),
        };

        setMessagesByConv(prev => ({
            ...prev,
            [activeConvId]: [...(prev[activeConvId] || []), newMessage],
        }));
        setInput('');

        // Simulated auto-reply
        setTimeout(() => {
            setMessagesByConv(prev => ({
                ...prev,
                [activeConvId]: [...(prev[activeConvId] || []), {
                    id: (Date.now() + 1).toString(),
                    text: 'Cảm ơn bạn đã nhắn tin. Tính năng chat đang được phát triển, người bán sẽ sớm phản hồi bạn!',
                    sender: 'other',
                    timestamp: new Date(),
                }],
            }));
        }, 1000);
    };

    const formatTime = (date: Date) =>
        date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const formatConvTime = (date?: Date) => {
        if (!date) return '';
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60_000) return 'Vừa xong';
        if (diff < 3600_000) return `${Math.floor(diff / 60_000)}p`;
        if (diff < 86400_000) return formatTime(date);
        return date.toLocaleDateString('vi-VN');
    };

    if (!sellerId) {
        return (
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white min-h-screen">
                <div className='mx-5 xl:mx-20'>
                    <Breadcrumb items={[
                        { label: 'Tin nhắn' },
                    ]} />
                </div>
                <div className="max-w-2xl mx-auto py-20 px-4">
                    <Empty
                        image={<MessageOutlined className="text-6xl text-gray-300" />}
                        description="Chưa có cuộc hội thoại nào"
                    >
                        <p className="text-gray-400 text-sm mb-4">
                            Hãy truy cập trang sản phẩm và nhấn &quot;Chat với người bán&quot; để bắt đầu
                        </p>
                        <Link href="/">
                            <Button type="primary">Về trang chủ</Button>
                        </Link>
                    </Empty>
                </div>
            </div>
        );
    }

    return (
        <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white min-h-screen">
            <div className='mx-5 xl:mx-20'>
                <Breadcrumb items={[
                    { label: 'Tin nhắn' },
                    ...(activeConv ? [{ label: activeConv.name }] : []),
                ]} />
            </div>
            <div className="max-w-7xl h-[calc(100vh-140px)] flex bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden my-4 mx-5 xl:mx-20">
                {/* Sidebar - Conversation List */}
                <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
                    {/* Sidebar Header */}
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

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Không có cuộc trò chuyện
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${activeConvId === conv.id
                                        ? 'bg-blue-50 dark:bg-gray-700 border-l-2 border-l-blue-500'
                                        : ''
                                        }`}
                                    onClick={() => setActiveConvId(conv.id)}
                                >
                                    <Badge count={conv.unread} size="small">
                                        <Avatar className="bg-blue-500 shrink-0" size={40}>
                                            {conv.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="font-medium text-sm m-0 truncate">{conv.name}</p>
                                            <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                                                {formatConvTime(conv.lastTime)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 m-0 truncate">
                                            {conv.lastMessage || 'Bắt đầu trò chuyện...'}
                                        </p>
                                        <span className="text-[10px] text-blue-400">
                                            {conv.role === 'seller' ? 'Người bán' : 'Người mua'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {activeConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                                <Avatar className="bg-blue-500 shrink-0" size={40}>
                                    {activeConv.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-white truncate m-0">
                                        {activeConv.name}
                                    </p>
                                    <p className="text-xs text-green-500 m-0">
                                        {activeConv.role === 'seller' ? 'Người bán' : 'Người mua'}
                                    </p>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <SmileOutlined className="text-4xl mb-3" />
                                        <p className="text-sm">Bắt đầu cuộc trò chuyện với {activeConv.name}</p>
                                        <p className="text-xs">Hãy gửi tin nhắn đầu tiên!</p>
                                    </div>
                                )}

                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[75%] ${msg.sender === 'me' ? 'order-2' : ''}`}>
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'me'
                                                    ? 'bg-blue-500 text-white rounded-br-sm'
                                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                            <p className={`text-[10px] text-gray-400 mt-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'
                                                }`}>
                                                {formatTime(msg.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Nhập tin nhắn..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
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
                                <p className="text-[10px] text-gray-400 mt-2 text-center">
                                    Tính năng chat trực tiếp đang được phát triển. Tin nhắn hiện tại chỉ là bản demo.
                                </p>
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
