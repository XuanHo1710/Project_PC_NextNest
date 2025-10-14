'use client'

import { useEffect } from 'react';

interface DynamicMetadataProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
}

// Helper function to convert relative URLs to absolute URLs
const getAbsoluteUrl = (url: string): string => {
    // If already absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Get base URL from window location or use default
    if (typeof window !== 'undefined') {
        const baseUrl = window.location.origin;
        return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
    }

    // Fallback for SSR
    return url;
};

export function DynamicMetadata({
    title = "PC Store - Mua sắm PC, Laptop, Linh kiện chính hãng",
    description = "Chuyên cung cấp PC Gaming, Laptop, Linh kiện máy tính chính hãng với giá tốt nhất. Bảo hành uy tín, giao hàng toàn quốc.",
    keywords = "pc gaming, laptop, linh kiện máy tính, màn hình, bàn phím cơ, chuột gaming, tai nghe",
    ogTitle,
    ogDescription,
    ogImage = "/logo.jpg",
    ogUrl,
}: DynamicMetadataProps) {
    useEffect(() => {
        // Update document title
        document.title = title;

        // Convert image URL to absolute URL for Open Graph
        const absoluteOgImage = getAbsoluteUrl(ogImage);
        const currentUrl = window.location.href;

        // Update or create meta tags
        const updateMetaTag = (name: string, content: string, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${name}"]`);

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }

            element.setAttribute('content', content);
        };

        // Update favicon
        const updateFavicon = () => {
            let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = '/logo.jpg';
        };

        // Basic meta tags
        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);

        // Open Graph tags (use absolute URLs)
        updateMetaTag('og:title', ogTitle || title, true);
        updateMetaTag('og:description', ogDescription || description, true);
        updateMetaTag('og:image', absoluteOgImage, true);
        updateMetaTag('og:image:width', '1200', true);
        updateMetaTag('og:image:height', '630', true);
        updateMetaTag('og:type', 'website', true);
        updateMetaTag('og:url', ogUrl || currentUrl, true);
        updateMetaTag('og:locale', 'vi_VN', true);

        // Twitter Card tags (use absolute URLs)
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', ogTitle || title);
        updateMetaTag('twitter:description', ogDescription || description);
        updateMetaTag('twitter:image', absoluteOgImage);

        // Update favicon
        updateFavicon();

    }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl]);

    return null; // This component doesn't render anything
}
