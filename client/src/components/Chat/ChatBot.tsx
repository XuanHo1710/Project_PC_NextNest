'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Input } from 'antd';
import { FiSend, FiX, FiSmile } from 'react-icons/fi';
import { RiRobot2Fill, RiRobot2Line, RiUser3Fill } from 'react-icons/ri';
import { IoMdChatboxes } from 'react-icons/io';
import { BiSupport } from 'react-icons/bi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { chatbotClientService } from '@/services/client';

// Lazy load emoji picker for performance
const EmojiPicker = lazy(() => import('@emoji-mart/react'));

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [messages, setMessages] = useState<{ text: string; sender: 'bot' | 'user'; time: string; suggestions?: string[] }[]>([
        {
            text: 'Xin chào! Tôi là Bot hỗ trợ của Arisu Store. Tôi có thể giúp gì cho bạn?',
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: ['Sản phẩm PC Gaming mới nhất', 'Khuyến mãi hiện tại', 'Chính sách bảo hành']
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Handle adding emoji from emoji-mart
    const addEmoji = (emojiData: any) => {
        setInputValue(prev => prev + emojiData.native);
    };

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const inputElement = document.getElementById('chat-input');
                if (inputElement) {
                    inputElement.focus();
                }
            }, 300);
        } else {
            setShowEmoji(false);
        }
    }, [isOpen]);

    // Auto scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close emoji picker when clicking outside
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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSend = async () => {
        if (inputValue.trim() === '') return;

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Add user message
        setMessages([...messages, { text: inputValue, sender: 'user', time: currentTime }]);
        const userQuestion = inputValue;
        setInputValue('');

        // Show typing indicator
        setIsTyping(true);

        try {
            // Use unique ID for the user session or use a default one
            // Could store userId in localStorage for persistence
            const userId = localStorage.getItem('chat_user_id') || 'guest-' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('chat_user_id', userId);

            // API call to chatbot service
            const response = await chatbotClientService.sendMessage(userQuestion, userId);

            // Add a small delay to make it feel more natural
            setTimeout(() => {
                setIsTyping(false);

                // Format the timestamp to match our time format
                const responseTime = new Date(response.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                setMessages(prev => [...prev, {
                    text: response.text,
                    sender: 'bot',
                    time: responseTime,
                    suggestions: response.suggestions
                }]);
            }, 800);
        } catch (err) {
            console.error('Error connecting to chatbot service:', err);
            // Handle error case
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    text: "Xin lỗi, đang có lỗi kết nối. Vui lòng thử lại sau.",
                    sender: 'bot',
                    time: currentTime
                }]);
            }, 800);
        }
    };

    return (
        <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end">
            {/* Chat bot button — light blue theme */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg hover:shadow-blue-300/50 hover:scale-105 transition-all mb-3"
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? (
                    <FiX size={26} className="text-white" />
                ) : (
                    <IoMdChatboxes size={26} className="text-white animate-pulse" />
                )}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div
                    className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden transform transition-all duration-300 mb-2 border border-blue-100 animate-fade-in-down"
                    style={{
                        animation: 'fadeInDown 0.3s ease-out forwards'
                    }}
                >
                    {/* Chat header */}
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <RiRobot2Fill className="text-blue-500 text-xl" />
                        </div>
                        <div className="ml-3">
                            <h3 className="font-bold flex items-center text-sm">
                                Arisu Assistant
                                <HiOutlineSparkles className="ml-1 text-yellow-200 animate-pulse" />
                            </h3>
                            <p className="text-xs text-blue-100">Online - Sẵn sàng hỗ trợ bạn</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="ml-auto text-white/80 hover:text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                            aria-label="Close chat"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Chat messages */}
                    <div className="p-4 h-80 overflow-y-auto bg-blue-50/30">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
                            >
                                {msg.sender === 'bot' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0">
                                        <RiRobot2Line className="text-white text-lg" />
                                    </div>
                                )}
                                <div
                                    className={`rounded-2xl py-2.5 px-4 max-w-[80%] shadow-sm ${msg.sender === 'user'
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                        : 'bg-white text-gray-800 border border-blue-100'
                                        }`}
                                >
                                    <p className="leading-relaxed text-sm">{msg.text}</p>
                                    <span className={`text-xs block mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {msg.time}
                                    </span>

                                    {/* Suggestions */}
                                    {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {msg.suggestions.map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setInputValue(suggestion)}
                                                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 px-2.5 rounded-full border border-blue-200 transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {msg.sender === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ml-2 flex-shrink-0">
                                        <RiUser3Fill className="text-white text-sm" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div
                                className="mb-4 flex justify-start"
                                style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0">
                                    <RiRobot2Line className="text-white text-lg" />
                                </div>
                                <div className="bg-white rounded-2xl py-3 px-4 shadow-sm border border-blue-100">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat input */}
                    <div className="p-3 border-t border-blue-100 bg-white">
                        <div className="relative">
                            {/* Emoji picker (emoji-mart) */}
                            {showEmoji && (
                                <div
                                    ref={emojiPickerRef}
                                    className="absolute bottom-full right-0 mb-2"
                                    style={{ zIndex: 1000 }}
                                >
                                    <Suspense fallback={<div className="w-[352px] h-[435px] bg-white rounded-lg shadow-lg border border-blue-100 flex items-center justify-center text-gray-400">Loading...</div>}>
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

                            {/* Input with emoji button and send button */}
                            <div className="relative flex">
                                <Input
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
                                        className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 emoji-trigger mr-2 transition-colors"
                                    >
                                        <FiSmile size={20} />
                                    </button>

                                    <button
                                        onClick={handleSend}
                                        className={`px-3 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-all ${inputValue.trim() ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'
                                            }`}
                                        disabled={!inputValue.trim() || isTyping}
                                    >
                                        <FiSend size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center">
                            <BiSupport className="mr-1" /> Được hỗ trợ bởi Arisu Support Team
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                
                .animate-fade-in-down {
                    animation: fadeInDown 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ChatBot;