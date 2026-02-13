'use client';

import { useState, useRef, useEffect } from 'react';
import { Input, Button, Avatar, Empty } from 'antd';
import { SendOutlined, ArrowLeftOutlined, SmileOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import useAuthUser from '@/hooks/useAuthUser';
import Link from 'next/link';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'me' | 'other';
    timestamp: Date;
}

export default function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const sellerId = searchParams.get('sellerId');
    const sellerName = searchParams.get('sellerName') || 'Người bán';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: input.trim(),
            sender: 'me',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');

        // Simulated auto-reply (placeholder until real chat backend exists)
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: 'Cảm ơn bạn đã nhắn tin. Tính năng chat đang được phát triển, người bán sẽ sớm phản hồi bạn!',
                sender: 'other',
                timestamp: new Date(),
            }]);
        }, 1000);
    };

    const formatTime = (date: Date) =>
        date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (!sellerId) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4">
                <Empty description="Không tìm thấy cuộc hội thoại" />
                <div className="text-center mt-4">
                    <Link href="/">
                        <Button type="primary">Về trang chủ</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl h-[calc(100vh-80px)] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden my-4 mx-4 md:mx-auto">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    className="!p-1"
                />
                <Avatar
                    className="bg-blue-500 shrink-0"
                    size={40}
                >
                    {sellerName.charAt(0).toUpperCase()}
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 dark:text-white truncate m-0">
                        {sellerName}
                    </p>
                    <p className="text-xs text-green-500 m-0">Người bán</p>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <SmileOutlined className="text-4xl mb-3" />
                        <p className="text-sm">Bắt đầu cuộc trò chuyện với {sellerName}</p>
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
        </div>
    );
}
