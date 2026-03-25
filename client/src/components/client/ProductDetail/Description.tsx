'use client';

import { IProductCard } from "@/types/product";
import { useMemo, useRef, useState, useEffect } from "react";
import parse, { HTMLReactParserOptions, Element } from 'html-react-parser';

const MAX_COLLAPSED_HEIGHT = 350; // px

// Tags to completely remove (including content)
const BLOCKED_TAGS = new Set([
    'script', 'style', 'iframe', 'noscript', 'link', 'meta',
    'object', 'embed', 'form', 'nav', 'header', 'footer',
]);

// Text patterns indicating scraped site chrome - not real product content
const SITE_CHROME_TEXT = [
    'DANH MỤC SẢN PHẨM', 'Giỏ hàng', 'Đăng nhập', 'Đăng ký',
    'PC Gaming, Streaming', 'MÁY TÍNH CHƠI GAME PCM', 'PC ĐẸP',
    'Theo Khoảng Giá', 'Dưới 10 Triệu', 'ĐĂNG KÝ NHẬN TIN',
    'Nhập số điện thoại', 'Nhận ngay Voucher', 'Phương thức thanh toán',
    'Hotline mua hàng', 'Khiếu nại',
];

/** Pre-clean HTML before parsing to strip site chrome */
function preCleanHtml(html: string): string {
    let s = html;
    // Remove script/style/noscript/iframe blocks
    s = s.replace(/<(script|style|noscript|iframe|link|meta|object|embed|form)[\s\S]*?(<\/\1>|\/>)/gi, '');
    // Remove HTML comments
    s = s.replace(/<!--[\s\S]*?-->/g, '');
    // For CellphoneS nuxt-wrapped pages, extract article content
    if (s.includes('data-server-rendered') || s.includes('__nuxt')) {
        const articleMatch = s.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch) s = articleMatch[1];
    }
    // Remove nav/header/footer
    s = s.replace(/<(nav|header|footer)[\s\S]*?<\/\1>/gi, '');
    // Remove tracking imgs
    s = s.replace(/<img[^>]*(?:tracking|pixel|facebook\.com\/tr|google-analytics|1x1|spacer)[^>]*\/?>/gi, '');
    // Remove inline event handlers
    s = s.replace(/\s(on\w+)="[^"]*"/gi, '');
    // Collapse whitespace
    s = s.replace(/\n{3,}/g, '\n\n');
    return s.trim();
}

const parserOptions: HTMLReactParserOptions = {
    replace(domNode) {
        if (domNode instanceof Element) {
            if (BLOCKED_TAGS.has(domNode.tagName)) {
                return <></>;
            }
            // Remove tracking/broken images
            if (domNode.tagName === 'img') {
                const src = domNode.attribs?.src || '';
                if (!src || src.includes('tracking') || src.includes('pixel') ||
                    src.includes('facebook.com/tr') || src.includes('google-analytics') ||
                    src.includes('1x1') || src.includes('spacer')) {
                    return <></>;
                }
            }
            // Remove divs/sections containing site chrome text
            if (['div', 'section', 'aside'].includes(domNode.tagName)) {
                const innerText = getElementText(domNode);
                if (innerText.length < 500) { // Only check small blocks
                    for (const pattern of SITE_CHROME_TEXT) {
                        if (innerText.includes(pattern)) return <></>;
                    }
                }
            }
            // Remove links to external sites (keeping text)
            if (domNode.tagName === 'a') {
                const href = domNode.attribs?.href || '';
                if (href.includes('cellphones.com') || href.includes('gearvn.com') ||
                    href.includes('pcmarket.vn') || href.includes('hoangha')) {
                    // Keep children text, remove link wrapper
                    return <>{domNode.children && parse(domNode.children.map((c: any) => {
                        if (c.type === 'text') return c.data;
                        return '';
                    }).join(''))}</>;
                }
            }
        }
    },
};

function getElementText(el: Element): string {
    let text = '';
    for (const child of (el.children || []) as any[]) {
        if (child.type === 'text') text += child.data || '';
        else if (child.children) text += getElementText(child);
    }
    return text;
}

export default function DescriptionProduct({ product }: { product: IProductCard }) {
    const [expanded, setExpanded] = useState(false);
    const [needsExpand, setNeedsExpand] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const parsedContent = useMemo(() => {
        if (!product.description) return null;
        try {
            const cleanHtml = preCleanHtml(product.description);
            if (!cleanHtml || cleanHtml.length < 10) return null;
            return parse(cleanHtml, parserOptions);
        } catch {
            return null;
        }
    }, [product.description]);

    useEffect(() => {
        if (contentRef.current) {
            const checkHeight = () => {
                if (contentRef.current) {
                    setNeedsExpand(contentRef.current.scrollHeight > MAX_COLLAPSED_HEIGHT);
                }
            };
            checkHeight();
            const images = contentRef.current.querySelectorAll('img');
            images.forEach(img => {
                if (!img.complete) {
                    img.addEventListener('load', checkHeight, { once: true });
                }
            });
        }
    }, [parsedContent]);

    if (!product.description || !parsedContent) {
        return (
            <div className="prose max-w-none dark:prose-invert">
                <p className="text-gray-500 dark:text-gray-400 italic">Chưa có mô tả sản phẩm.</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                ref={contentRef}
                className="prose max-w-none dark:prose-invert break-words text-lg overflow-hidden transition-all duration-500"
                style={!expanded && needsExpand ? { maxHeight: `${MAX_COLLAPSED_HEIGHT}px` } : undefined}
            >
                {parsedContent}
            </div>

            {needsExpand && (
                <div className={`${!expanded ? '-mt-16 relative' : 'mt-4'}`}>
                    {!expanded && (
                        <div className="h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
                    )}
                    <div className="flex justify-center bg-white dark:bg-gray-900 pt-1 pb-2">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="group flex items-center gap-2 px-8 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow"
                        >
                            {expanded ? (
                                <>
                                    <svg className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                    </svg>
                                    Thu gọn
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    Xem thêm
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}