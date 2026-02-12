'use client';

import Link from 'next/link';
import { HomeOutlined } from '@ant-design/icons';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

/**
 * Shared Breadcrumb component for all client pages.
 * Usage:
 * ```tsx
 * <Breadcrumb items={[
 *     { label: 'Hồ sơ người dùng', href: '/profile/detail' },
 *     { label: 'Quản lý đơn hàng' },
 * ]} />
 * ```
 * "Trang chủ" is always prepended automatically.
 * The last item (no href) is rendered as the active page.
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    return (
        <nav className={`flex items-center flex-wrap gap-2 text-sm py-3 ${className}`}>
            <Link
                href="/home"
                className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
            >
                <HomeOutlined className="text-xs" />
                Trang chủ
            </Link>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <span key={index} className="flex items-center gap-2">
                        <span className="text-gray-300 dark:text-gray-600">/</span>
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-blue-500 dark:text-blue-400 font-medium">
                                {item.label}
                            </span>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
