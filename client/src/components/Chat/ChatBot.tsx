'use client';

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { FiSend, FiX, FiSmile, FiChevronDown } from 'react-icons/fi';
import { RiRobot2Fill, RiRobot2Line, RiUser3Fill } from 'react-icons/ri';
import { IoMdChatboxes } from 'react-icons/io';
import { BiSupport } from 'react-icons/bi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { chatbotClientService } from '@/services/client';
import { IProductCard } from '@/types/product';
import Link from 'next/link';
import {
    getProductDisplayPrice,
    getProductImage,
    getProductDiscount,
    getProductOriginalPrice,
    formatCurrencyVND,
} from '@/utils/productHelpers';

const EmojiPicker = lazy(() => import('@emoji-mart/react'));

interface ChatMessage {
    text: string;
    sender: 'bot' | 'user';
    time: string;
    suggestions?: string[];
    products?: IProductCard[];
}

interface StreamingState {
    fullText: string;
    displayedChars: number;
    products: IProductCard[];
    suggestions: string[];
    time: string;
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
    const [streaming, setStreaming] = useState<StreamingState | null>(null);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const isAtBottomRef = useRef(true);

    // ── Scroll helpers ──────────────────────────────────────────────
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    }, []);

    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const threshold = 60;
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        isAtBottomRef.current = distanceFromBottom < threshold;
        setShowScrollBtn(distanceFromBottom > 120);
    }, []);

    useEffect(() => {
        if (isAtBottomRef.current) {
            scrollToBottom();
        }
    }, [messages, isTyping, streaming?.displayedChars, scrollToBottom]);

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

    // ── Streaming: auto-scroll during SSE ─────────────────────────────────
    // (No interval needed — SSE tokens update displayedChars directly)
    useEffect(() => {
        if (!streaming) return;
        if (isAtBottomRef.current) {
            scrollToBottom();
        }
    }, [streaming?.displayedChars, scrollToBottom]);

    const addEmoji = (emojiData: any) => {
        setInputValue(prev => prev + emojiData.native);
    };

    const buildHistory = useCallback(() => {
        return messages
            .filter(m => m !== WELCOME_MESSAGE)
            .map(m => ({
                role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
                content: m.text,
            }));
    }, [messages]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isTyping || streaming) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg: ChatMessage = { text, sender: 'user', time };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        // Reset textarea height
        const textarea = document.getElementById('chat-input') as HTMLTextAreaElement;
        if (textarea) textarea.style.height = 'auto';
        isAtBottomRef.current = true;

        setIsTyping(true);

        try {
            const userId =
                localStorage.getItem('chat_user_id') ||
                'guest-' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('chat_user_id', userId);

            const history = buildHistory();

            // Use SSE streaming for real-time token display
            let streamedText = '';
            setIsTyping(false);
            setStreaming({
                fullText: '',
                displayedChars: 0,
                products: [],
                suggestions: [],
                time,
            });

            await chatbotClientService.sendMessageStream(text, userId, history, {
                onToken: (token) => {
                    streamedText += token;
                    setStreaming(prev => prev ? {
                        ...prev,
                        fullText: streamedText,
                        displayedChars: streamedText.length,
                    } : null);
                },
                onReplace: (newText) => {
                    streamedText = newText;
                    setStreaming(prev => prev ? {
                        ...prev,
                        fullText: newText,
                        displayedChars: newText.length,
                    } : null);
                },
                onDone: (data) => {
                    const responseTime = data.timestamp
                        ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : time;
                    // Finalize: add to messages and clear streaming state
                    setMessages(prev => [
                        ...prev,
                        {
                            text: streamedText,
                            sender: 'bot',
                            time: responseTime,
                            suggestions: data.suggestions,
                            products: data.products,
                        },
                    ]);
                    setStreaming(null);
                },
                onError: (error) => {
                    setMessages(prev => [
                        ...prev,
                        { text: error, sender: 'bot', time },
                    ]);
                    setStreaming(null);
                },
            });
        } catch {
            setIsTyping(false);
            setStreaming(null);
            setMessages(prev => [
                ...prev,
                {
                    text: 'Xin lỗi, đang có lỗi kết nối. Vui lòng thử lại sau.',
                    sender: 'bot',
                    time,
                },
            ]);
        }
    }, [isTyping, streaming, buildHistory]);

    const handleSend = () => {
        sendMessage(inputValue.trim());
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
    };

    const isInputDisabled = isTyping || !!streaming;

    // ── Product Card ────────────────────────────────────────────────
    const ProductCard = ({ product }: { product: IProductCard }) => {
        const image = getProductImage(product);
        const displayPrice = getProductDisplayPrice(product);
        const originalPrice = getProductOriginalPrice(product);
        const discount = getProductDiscount(product);
        const stock = product.defaultVariant?.stock ?? 0;

        return (
            <Link
                href={`/product/${product.slug || product._id}`}
                target="_blank"
                className="block min-w-[200px] max-w-[200px] bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden group"
            >
                {/* Image */}
                <div className="relative w-full h-[120px] bg-gray-50 flex items-center justify-center p-2 overflow-hidden">
                    {image && image !== '/placeholder-product.png' ? (
                        <img
                            src={image}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                        />
                    ) : (
                        <div className="text-gray-300 text-3xl">📦</div>
                    )}
                    {discount > 0 && (
                        <span className="absolute top-1.5 right-1.5 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-md shadow-sm">
                            -{discount.toFixed(0)}%
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                    {/* Brand */}
                    {product.brand?.name && (
                        <span className="text-[10px] text-blue-500 font-medium uppercase tracking-wide">
                            {product.brand.name}
                        </span>
                    )}

                    {/* Name */}
                    <p className="text-[12px] font-semibold text-gray-800 line-clamp-2 leading-tight mt-0.5 min-h-[32px]">
                        {product.name}
                    </p>

                    {/* Price */}
                    <div className="mt-1.5">
                        <p className="text-[14px] font-bold text-red-500">
                            {formatCurrencyVND(displayPrice)}
                        </p>
                        {discount > 0 && (
                            <p className="text-[11px] text-gray-400 line-through mt-0.5">
                                {formatCurrencyVND(originalPrice)}
                            </p>
                        )}
                    </div>

                    {/* Stock & CTA */}
                    <div className="mt-2 flex items-center justify-between">
                        <span className={`text-[10px] font-medium ${stock > 0 ? 'text-green-500' : 'text-red-400'}`}>
                            {stock > 0 ? `Còn ${stock} sp` : 'Hết hàng'}
                        </span>
                        <span className="text-[10px] text-blue-500 font-medium group-hover:underline">
                            Xem chi tiết →
                        </span>
                    </div>
                </div>
            </Link>
        );
    };

    // ── Render ──────────────────────────────────────────────────────
    return (
        <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-5 z-50 flex flex-col items-end">
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg hover:shadow-blue-300/50 hover:scale-105 active:scale-95 transition-all mb-2 sm:mb-3"
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? (
                    <FiX size={24} className="transition-transform group-hover:rotate-90" />
                ) : (
                    <IoMdChatboxes size={24} className="animate-pulse" />
                )}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div
                    className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-24px)] sm:w-[440px] overflow-hidden mb-2 border border-blue-100 flex flex-col"
                    style={{
                        maxWidth: '480px',
                        maxHeight: 'min(650px, calc(100vh - 100px))',
                        animation: 'chatSlideUp 0.25s ease-out forwards',
                    }}
                >
                    {/* ── Header ── */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 flex items-center flex-shrink-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <RiRobot2Fill className="text-blue-500 text-lg sm:text-xl" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <h3 className="font-bold flex items-center text-sm">
                                Arisu AI Assistant
                                <HiOutlineSparkles className="ml-1 text-yellow-200 animate-pulse" />
                            </h3>
                            <p className="text-xs text-blue-200">
                                {isTyping ? 'Đang suy nghĩ...' : streaming ? 'Đang trả lời...' : 'Online · Hỏi tôi bất cứ điều gì'}
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
                        className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-blue-50/30 to-white relative"
                        style={{ minHeight: '200px' }}
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
                                <div className="flex flex-col max-w-[90%] sm:max-w-[88%]">
                                    <div
                                        className={`rounded-2xl py-2.5 px-3.5 shadow-sm ${msg.sender === 'user'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                            : 'bg-white text-gray-800 border border-blue-100/60 rounded-bl-md'
                                            }`}
                                    >
                                        <p className="leading-relaxed text-[13px] whitespace-pre-wrap break-words">{msg.text}</p>
                                    </div>

                                    {/* Product cards */}
                                    {msg.sender === 'bot' && msg.products && msg.products.length > 0 && (
                                        <div className="mt-3">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className="text-sm">🛒</span>
                                                <p className="text-[12px] text-gray-600 font-semibold">Sản phẩm gợi ý cho bạn</p>
                                            </div>
                                            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
                                                {msg.products.map((product) => (
                                                    <div key={product._id} className="snap-start">
                                                        <ProductCard product={product} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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
                                                    className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-600 py-1 px-2.5 rounded-full border border-blue-200/60 transition-colors whitespace-nowrap"
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

                        {/* Streaming message (typewriter effect) */}
                        {streaming && (
                            <div className="mb-3 flex justify-start" style={{ animation: 'chatMsgIn 0.2s ease-out both' }}>
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                    <RiRobot2Line className="text-white text-sm" />
                                </div>
                                <div className="flex flex-col max-w-[90%] sm:max-w-[88%]">
                                    <div className="bg-white text-gray-800 border border-blue-100/60 rounded-2xl rounded-bl-md py-2.5 px-3.5 shadow-sm">
                                        {streaming.displayedChars === 0 ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                                <span className="text-[12px] text-gray-400 italic">AI đang soạn tin...</span>
                                            </div>
                                        ) : (
                                            <p className="leading-relaxed text-[13px] whitespace-pre-wrap break-words">
                                                {streaming.fullText.substring(0, streaming.displayedChars)}
                                                <span className="inline-block w-[2px] h-[14px] bg-blue-500 ml-0.5 align-middle animate-pulse" />
                                            </p>
                                        )}
                                    </div>

                                    {/* Show product cards once text streaming is complete */}
                                    {streaming.displayedChars >= streaming.fullText.length && streaming.products.length > 0 && (
                                        <div className="mt-3" style={{ animation: 'chatMsgIn 0.3s ease-out both' }}>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className="text-sm">🛒</span>
                                                <p className="text-[12px] text-gray-600 font-semibold">Sản phẩm gợi ý cho bạn</p>
                                            </div>
                                            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
                                                {streaming.products.map((product) => (
                                                    <div key={product._id} className="snap-start">
                                                        <ProductCard product={product} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Typing indicator (waiting for stream connection) */}
                        {isTyping && (
                            <div className="mb-3 flex justify-start" style={{ animation: 'chatMsgIn 0.2s ease-out both' }}>
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                    <RiRobot2Line className="text-white text-sm" />
                                </div>
                                <div className="bg-white rounded-2xl rounded-bl-md py-3 px-4 shadow-sm border border-blue-100/60">
                                    <div className="flex items-center gap-2">
                                        <div className="flex space-x-1.5">
                                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-[12px] text-gray-400 italic">Đang kết nối AI...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Scroll-to-bottom FAB */}
                    {showScrollBtn && (
                        <div className="flex justify-end px-4 py-1 bg-transparent">
                            <button
                                onClick={() => {
                                    isAtBottomRef.current = true;
                                    scrollToBottom();
                                }}
                                className="w-8 h-8 rounded-full bg-white shadow-lg border border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors z-10"
                                style={{ animation: 'chatMsgIn 0.15s ease-out both' }}
                            >
                                <FiChevronDown size={18} />
                            </button>
                        </div>
                    )}

                    {/* ── Input area ── */}
                    <div className="p-2.5 sm:p-3 border-t border-blue-100/60 bg-white flex-shrink-0">
                        <div className="relative">
                            {showEmoji && (
                                <div
                                    ref={emojiPickerRef}
                                    className="absolute bottom-full right-0 mb-2 z-[1000]"
                                >
                                    <Suspense
                                        fallback={
                                            <div className="w-[300px] sm:w-[352px] h-[400px] sm:h-[435px] bg-white rounded-lg shadow-lg border border-blue-100 flex items-center justify-center text-gray-400">
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

                            <div className="relative flex items-end gap-1.5 bg-gray-50/80 rounded-2xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                <textarea
                                    ref={inputRef}
                                    id="chat-input"
                                    placeholder={isInputDisabled ? 'Đang xử lý...' : 'Nhập tin nhắn...'}
                                    value={inputValue}
                                    onChange={e => {
                                        setInputValue(e.target.value);
                                        // Auto-grow textarea
                                        const el = e.target;
                                        el.style.height = 'auto';
                                        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    className="flex-1 resize-none bg-transparent pl-4 pr-2 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none disabled:text-gray-400 disabled:cursor-not-allowed"
                                    rows={1}
                                    style={{ maxHeight: '120px', overflowY: 'auto', scrollbarWidth: 'none' }}
                                    disabled={isInputDisabled}
                                />
                                <div className="flex items-center pr-1.5 pb-1.5 shrink-0">
                                    <button
                                        onClick={() => setShowEmoji(!showEmoji)}
                                        className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 emoji-trigger mr-1 transition-colors"
                                    >
                                        <FiSmile size={18} />
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${inputValue.trim() && !isInputDisabled
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:opacity-90 active:scale-95'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        disabled={!inputValue.trim() || isInputDisabled}
                                    >
                                        <FiSend size={14} />
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