'use client';

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Input } from 'antd';
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
    text: 'Xin chÃ o! TÃ´i lÃ  AI Assistant cá»§a Arisu Store ðŸ¤–\nTÃ´i cÃ³ thá»ƒ giÃºp báº¡n tÆ° váº¥n sáº£n pháº©m, so sÃ¡nh cáº¥u hÃ¬nh, hoáº·c giáº£i Ä‘Ã¡p má»i tháº¯c máº¯c. HÃ£y há»i tÃ´i báº¥t cá»© Ä‘iá»u gÃ¬!',
    sender: 'bot',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: ['TÆ° váº¥n PC Gaming 20 triá»‡u', 'Laptop cho sinh viÃªn', 'So sÃ¡nh RTX 4060 vs 4070'],
};

const CHARS_PER_TICK = 3;
const TICK_INTERVAL = 20;

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
    const inputRef = useRef<HTMLInputElement>(null);
    const isAtBottomRef = useRef(true);
    const streamingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // â”€â”€ Scroll helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Streaming typewriter effect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (!streaming) return;

        if (streaming.displayedChars >= streaming.fullText.length) {
            setMessages(prev => [
                ...prev,
                {
                    text: streaming.fullText,
                    sender: 'bot',
                    time: streaming.time,
                    suggestions: streaming.suggestions,
                    products: streaming.products,
                },
            ]);
            setStreaming(null);
            return;
        }

        streamingRef.current = setInterval(() => {
            setStreaming(prev => {
                if (!prev) return null;
                const next = prev.displayedChars + CHARS_PER_TICK;
                if (next >= prev.fullText.length) {
                    return { ...prev, displayedChars: prev.fullText.length };
                }
                return { ...prev, displayedChars: next };
            });
        }, TICK_INTERVAL);

        return () => {
            if (streamingRef.current) {
                clearInterval(streamingRef.current);
                streamingRef.current = null;
            }
        };
    }, [streaming?.displayedChars, streaming?.fullText.length]);

    useEffect(() => {
        return () => {
            if (streamingRef.current) clearInterval(streamingRef.current);
        };
    }, []);

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

            // Start typewriter streaming
            setStreaming({
                fullText: response.text,
                displayedChars: 0,
                products: response.products || [],
                suggestions: response.suggestions || [],
                time: responseTime,
            });
        } catch {
            setIsTyping(false);
            setMessages(prev => [
                ...prev,
                {
                    text: 'Xin lá»—i, Ä‘ang cÃ³ lá»—i káº¿t ná»‘i. Vui lÃ²ng thá»­ láº¡i sau.',
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

    // â”€â”€ Product Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const ProductCard = ({ product }: { product: IProductCard }) => {
        const image = getProductImage(product);
        const displayPrice = getProductDisplayPrice(product);
        const originalPrice = getProductOriginalPrice(product);
        const discount = getProductDiscount(product);

        return (
            <Link
                href={`/product/${product.slug || product._id}`}
                target="_blank"
                className="block min-w-[130px] max-w-[130px] bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
            >
                <div className="w-full h-[90px] bg-gray-50 flex items-center justify-center p-2 overflow-hidden">
                    {image ? (
                        <img
                            src={image}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                        />
                    ) : (
                        <div className="text-gray-300 text-2xl">ðŸ“¦</div>
                    )}
                </div>
                <div className="p-2">
                    <p className="text-[11px] font-medium text-gray-700 line-clamp-2 leading-tight mb-1.5 min-h-[28px]">
                        {product.name}
                    </p>
                    <p className="text-[12px] font-bold text-blue-600">
                        {formatCurrencyVND(displayPrice)}
                    </p>
                    {discount > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-gray-400 line-through">
                                {formatCurrencyVND(originalPrice)}
                            </span>
                            <span className="text-[9px] bg-red-50 text-red-500 px-1 rounded font-medium">
                                -{discount.toFixed(0)}%
                            </span>
                        </div>
                    )}
                </div>
            </Link>
        );
    };

    // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return (
        <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-5 z-50 flex flex-col items-end">
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
                    className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-24px)] sm:w-96 overflow-hidden mb-2 border border-blue-100 flex flex-col"
                    style={{
                        maxWidth: '420px',
                        maxHeight: 'min(600px, calc(100vh - 140px))',
                        animation: 'chatSlideUp 0.25s ease-out forwards',
                    }}
                >
                    {/* â”€â”€ Header â”€â”€ */}
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
                                {isTyping ? 'Äang suy nghÄ©...' : streaming ? 'Äang tráº£ lá»i...' : 'Online Â· Há»i tÃ´i báº¥t cá»© Ä‘iá»u gÃ¬'}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* â”€â”€ Messages â”€â”€ */}
                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-blue-50/30 to-white relative"
                        style={{ minHeight: '300px' }}
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
                                <div className="flex flex-col max-w-[82%] sm:max-w-[78%]">
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
                                        <div className="mt-2 -mx-1">
                                            <p className="text-[11px] text-gray-500 font-medium mb-1.5 px-1">ðŸ›’ Sáº£n pháº©m gá»£i Ã½:</p>
                                            <div className="flex gap-2 overflow-x-auto pb-1.5 px-1 scrollbar-thin">
                                                {msg.products.map((product) => (
                                                    <ProductCard key={product._id} product={product} />
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
                                <div className="flex flex-col max-w-[82%] sm:max-w-[78%]">
                                    <div className="bg-white text-gray-800 border border-blue-100/60 rounded-2xl rounded-bl-md py-2.5 px-3.5 shadow-sm">
                                        <p className="leading-relaxed text-[13px] whitespace-pre-wrap break-words">
                                            {streaming.fullText.substring(0, streaming.displayedChars)}
                                            <span className="inline-block w-[2px] h-[14px] bg-blue-500 ml-0.5 align-middle animate-pulse" />
                                        </p>
                                    </div>

                                    {/* Show product cards once text streaming is complete */}
                                    {streaming.displayedChars >= streaming.fullText.length && streaming.products.length > 0 && (
                                        <div className="mt-2 -mx-1" style={{ animation: 'chatMsgIn 0.3s ease-out both' }}>
                                            <p className="text-[11px] text-gray-500 font-medium mb-1.5 px-1">ðŸ›’ Sáº£n pháº©m gá»£i Ã½:</p>
                                            <div className="flex gap-2 overflow-x-auto pb-1.5 px-1 scrollbar-thin">
                                                {streaming.products.map((product) => (
                                                    <ProductCard key={product._id} product={product} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Typing indicator (waiting for API) */}
                        {isTyping && (
                            <div className="mb-3 flex justify-start" style={{ animation: 'chatMsgIn 0.2s ease-out both' }}>
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                    <RiRobot2Line className="text-white text-sm" />
                                </div>
                                <div className="bg-white rounded-2xl rounded-bl-md py-3 px-4 shadow-sm border border-blue-100/60">
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

                    {/* â”€â”€ Input area â”€â”€ */}
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

                            <div className="relative flex">
                                <Input
                                    ref={inputRef as any}
                                    id="chat-input"
                                    placeholder={isInputDisabled ? 'Äang xá»­ lÃ½...' : 'Nháº­p tin nháº¯n...'}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onPressEnter={handleSend}
                                    className="flex-grow rounded-full pr-24 sm:pr-28 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    size="large"
                                    disabled={isInputDisabled}
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex items-center">
                                    <button
                                        onClick={() => setShowEmoji(!showEmoji)}
                                        className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 emoji-trigger mr-1 transition-colors"
                                    >
                                        <FiSmile size={18} />
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        className={`px-3 h-8 rounded-full flex items-center justify-center transition-all ${inputValue.trim() && !isInputDisabled
                                            ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-sm hover:opacity-90 active:scale-95'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        disabled={!inputValue.trim() || isInputDisabled}
                                    >
                                        <FiSend size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-400 text-center mt-1.5 flex items-center justify-center">
                            <BiSupport className="mr-1" /> Powered by Arisu AI Â· Ollama LLM
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