'use client';

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Input } from 'antd';
import { FiSend, FiX, FiSmile, FiChevronDown } from 'react-icons/fi';
import { RiRobot2Fill, RiRobot2Line, RiUser3Fill } from 'react-icons/ri';
import { IoMdChatboxes } from 'react-icons/io';
import { BiSupport } from 'react-icons/bi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { chatbotClientService } from '@/services/client';

const EmojiPicker = lazy(() => import('@emoji-mart/react'));

interface ChatMessage {
    text: string;
    sender: 'bot' | 'user';
    time: string;
    suggestions?: string[];
}

const WELCOME_MESSAGE: ChatMessage = {
    text: 'Xin chào! Tôi là AI Assistant của Arisu Store 🤖\nTôi có thể giúp bạn tư vấn sản phẩm, so sánh cấu hình, hoặc giải đáp mọi thắc mắc. Hãy hỏi tôi bất cứ điều gì!',
    sender: 'bot',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: ['Tư vấn PC Gaming 20 triệu', 'Laptop cho sinh viên', 'So sánh RTX 4060 vs 4070'],
};

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [inputValue, setInputValue] = useState('');

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isAtBottomRef = useRef(true);

    // ── Scroll helpers ──────────────────────────────────────────────
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    }, []);

    // Check if user scrolled away from bottom
    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const threshold = 60;
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        isAtBottomRef.current = distanceFromBottom < threshold;
        setShowScrollBtn(distanceFromBottom > 120);
    }, []);

    // Auto-scroll when new messages arrive (only if already at bottom)
    useEffect(() => {
        if (isAtBottomRef.current) {
            scrollToBottom();
        }
    }, [messages, isTyping, scrollToBottom]);

    // Always scroll to bottom when chat opens
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => {
                scrollToBottom('instant');
                inputRef.current?.focus();
            });
        } else {
            setShowEmoji(false);
        }
    }, [isOpen, scrollToBottom]);

    // Close emoji picker on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target as Node) &&
                !(event.target as Element).closest('.emoji-trigger')
            ) {
                setShowEmoji(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addEmoji = (emojiData: any) => {
        setInputValue(prev => prev + emojiData.native);
    };

    // ── Build conversation history for the API ──────────────────────
    const buildHistory = useCallback(() => {
        return messages
            .filter(m => m !== WELCOME_MESSAGE)
            .map(m => ({
                role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
                content: m.text,
            }));
    }, [messages]);

    // ── Send message ────────────────────────────────────────────────
    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isTyping) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg: ChatMessage = { text, sender: 'user', time };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        isAtBottomRef.current = true;

        setIsTyping(true);

        try {
            const userId =
                localStorage.getItem('chat_user_id') ||
                'guest-' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('chat_user_id', userId);

            const history = buildHistory();
            const response = await chatbotClientService.sendMessage(text, userId, history);

            const responseTime = new Date(response.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });

            setIsTyping(false);
            setMessages(prev => [
                ...prev,
                {
                    text: response.text,
                    sender: 'bot',
                    time: responseTime,
                    suggestions: response.suggestions,
                },
            ]);
        } catch {
            setIsTyping(false);
            setMessages(prev => [
                ...prev,
                {
                    text: 'Xin lỗi, đang có lỗi kết nối. Vui lòng thử lại sau.',
                    sender: 'bot',
                    time,
                },
            ]);
        }
    }, [isTyping, buildHistory]);

    const handleSend = () => {
        sendMessage(inputValue.trim());
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
    };

    // ── Render ──────────────────────────────────────────────────────
    return (
        <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end">
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg hover:shadow-blue-300/50 hover:scale-105 active:scale-95 transition-all mb-3"
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? (
                    <FiX size={26} className="transition-transform group-hover:rotate-90" />
                ) : (
                    <IoMdChatboxes size={26} className="animate-pulse" />
                )}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div
                    className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden mb-2 border border-blue-100 flex flex-col"
                    style={{
                        maxHeight: 'min(580px, calc(100vh - 180px))',
                        animation: 'chatSlideUp 0.25s ease-out forwards',
                    }}
                >
                    {/* ── Header ── */}
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 flex items-center flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <RiRobot2Fill className="text-blue-500 text-xl" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <h3 className="font-bold flex items-center text-sm">
                                Arisu AI Assistant
                                <HiOutlineSparkles className="ml-1 text-yellow-200 animate-pulse" />
                            </h3>
                            <p className="text-xs text-blue-100">
                                {isTyping ? 'Đang soạn tin...' : 'Online · Hỏi tôi bất cứ điều gì'}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* ── Messages ── */}
                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50/40 to-white relative"
                        style={{ minHeight: '320px' }}
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                style={{ animation: `chatMsgIn 0.25s ease-out ${index > 0 ? '0.05s' : '0s'} both` }}
                            >
                                {msg.sender === 'bot' && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                        <RiRobot2Line className="text-white text-sm" />
                                    </div>
                                )}
                                <div className="flex flex-col max-w-[78%]">
                                    <div
                                        className={`rounded-2xl py-2.5 px-3.5 shadow-sm ${msg.sender === 'user'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                            : 'bg-white text-gray-800 border border-blue-100 rounded-bl-md'
                                            }`}
                                    >
                                        <p className="leading-relaxed text-[13px] whitespace-pre-wrap break-words">{msg.text}</p>
                                    </div>
                                    <span className={`text-[10px] mt-1 px-1 ${msg.sender === 'user' ? 'text-gray-400 text-right' : 'text-gray-400'}`}>
                                        {msg.time}
                                    </span>

                                    {/* Quick-reply chips */}
                                    {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                                        <div className="mt-1.5 flex flex-wrap gap-1">
                                            {msg.suggestions.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSuggestionClick(s)}
                                                    className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-600 py-1 px-2.5 rounded-full border border-blue-200 transition-colors whitespace-nowrap"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {msg.sender === 'user' && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                                        <RiUser3Fill className="text-white text-xs" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="mb-3 flex justify-start" style={{ animation: 'chatMsgIn 0.2s ease-out both' }}>
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                    <RiRobot2Line className="text-white text-sm" />
                                </div>
                                <div className="bg-white rounded-2xl rounded-bl-md py-3 px-4 shadow-sm border border-blue-100">
                                    <div className="flex space-x-1.5">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Scroll-to-bottom FAB */}
                    {showScrollBtn && (
                        <button
                            onClick={() => {
                                isAtBottomRef.current = true;
                                scrollToBottom();
                            }}
                            className="absolute bottom-[72px] right-4 w-8 h-8 rounded-full bg-white shadow-lg border border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors z-10"
                            style={{ animation: 'chatMsgIn 0.15s ease-out both' }}
                        >
                            <FiChevronDown size={18} />
                        </button>
                    )}

                    {/* ── Input area ── */}
                    <div className="p-3 border-t border-blue-100 bg-white flex-shrink-0">
                        <div className="relative">
                            {showEmoji && (
                                <div
                                    ref={emojiPickerRef}
                                    className="absolute bottom-full right-0 mb-2 z-[1000]"
                                >
                                    <Suspense
                                        fallback={
                                            <div className="w-[352px] h-[435px] bg-white rounded-lg shadow-lg border border-blue-100 flex items-center justify-center text-gray-400">
                                                Loading...
                                            </div>
                                        }
                                    >
                                        <EmojiPicker
                                            onEmojiSelect={addEmoji}
                                            theme="light"
                                            locale="vi"
                                            previewPosition="none"
                                            skinTonePosition="none"
                                            set="native"
                                        />
                                    </Suspense>
                                </div>
                            )}

                            <div className="relative flex">
                                <Input
                                    ref={inputRef as any}
                                    id="chat-input"
                                    placeholder="Nhập tin nhắn..."
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onPressEnter={handleSend}
                                    className="flex-grow rounded-full pr-24 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    size="large"
                                    disabled={isTyping}
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex items-center">
                                    <button
                                        onClick={() => setShowEmoji(!showEmoji)}
                                        className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 emoji-trigger mr-1.5 transition-colors"
                                    >
                                        <FiSmile size={20} />
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        className={`px-3 h-8 rounded-full flex items-center justify-center transition-all ${inputValue.trim() && !isTyping
                                            ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-sm hover:opacity-90 active:scale-95'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        disabled={!inputValue.trim() || isTyping}
                                    >
                                        <FiSend size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-400 text-center mt-1.5 flex items-center justify-center">
                            <BiSupport className="mr-1" /> Powered by Arisu AI · Ollama LLM
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes chatSlideUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes chatMsgIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ChatBot;