'use client';

import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked renderer for clean chat typography
const renderer = new marked.Renderer();

// Links open in new tab with secure attributes
renderer.link = ({ href, title, text }) => {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

marked.setOptions({
    gfm: true,
    breaks: true,
    renderer,
});

interface ChatMessageContentProps {
    content: string;
    isStreaming?: boolean;
}

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({
    content,
    isStreaming = false,
}) => {
    const formattedHtml = useMemo(() => {
        if (!content) return '';
        try {
            const rawHtml = marked.parse(content) as string;
            const purify = (DOMPurify as any).default || DOMPurify;
            if (typeof window !== 'undefined' && typeof purify?.sanitize === 'function') {
                return purify.sanitize(rawHtml, {
                    ADD_ATTR: ['target', 'rel'],
                });
            }
            return rawHtml;
        } catch (error) {
            console.error('Failed to parse markdown:', error);
            return content;
        }
    }, [content]);

    return (
        <div className="chat-markdown-wrapper relative leading-relaxed">
            <div
                className="chat-markdown"
                dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />
            {isStreaming && (
                <span className="inline-block w-[2px] h-[14px] bg-blue-500 ml-0.5 align-middle animate-pulse" />
            )}
        </div>
    );
};

export default ChatMessageContent;
