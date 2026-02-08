'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Select, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PaginatedResponse } from '@/types/common';

// Simple debounce utility
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

// ============= TYPES =============

export interface InfiniteSelectOption {
    label: React.ReactNode;
    value: string;
    /** Extra data attached to the option */
    raw?: any;
}

export interface InfiniteSelectProps
    extends Omit<SelectProps, 'options' | 'loading' | 'onSearch' | 'filterOption' | 'onPopupScroll'> {
    /**
     * Async function to fetch paginated data.
     * Must return PaginatedResponse<T> shape.
     */
    fetchFn: (params: { page: number; limit: number; keyword?: string }) => Promise<PaginatedResponse<any>>;

    /**
     * Transform each item from fetchFn into a select option.
     */
    mapOption: (item: any) => InfiniteSelectOption;

    /**
     * TanStack Query key prefix. Should be unique per usage.
     */
    queryKeyPrefix: string;

    /**
     * Items per page. Default 20.
     */
    pageSize?: number;

    /**
     * Debounce delay for search input (ms). Default 400.
     */
    debounceMs?: number;

    /**
     * Placeholder when no search results.
     */
    emptyText?: string;
}

// ============= COMPONENT =============

export default function InfiniteSelect({
    fetchFn,
    mapOption,
    queryKeyPrefix,
    pageSize = 20,
    debounceMs = 400,
    emptyText = 'Không tìm thấy kết quả',
    placeholder = 'Tìm kiếm...',
    ...restProps
}: InfiniteSelectProps) {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, debounceMs);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Infinite query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: [queryKeyPrefix, 'infinite', debouncedSearch],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await fetchFn({
                page: pageParam,
                limit: pageSize,
                keyword: debouncedSearch || undefined,
            });
            return result;
        },
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage.pagination;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000,
    });

    // Flatten all pages into options
    const options: InfiniteSelectOption[] = useMemo(() => {
        if (!data?.pages) return [];
        const allItems = data.pages.flatMap((page) => page.data);
        // Deduplicate by value
        const seen = new Set<string>();
        return allItems
            .map(mapOption)
            .filter((opt) => {
                if (seen.has(opt.value)) return false;
                seen.add(opt.value);
                return true;
            });
    }, [data, mapOption]);

    // Handle search input
    const handleSearch = useCallback(
        (value: string) => {
            setSearch(value);
        },
        [],
    );

    // Handle dropdown scroll → load more when near bottom
    const handlePopupScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.currentTarget;
            const threshold = 40;
            if (
                target.scrollTop + target.clientHeight >= target.scrollHeight - threshold &&
                hasNextPage &&
                !isFetchingNextPage
            ) {
                fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage],
    );

    // Custom dropdown render with loading indicator at bottom
    const dropdownRender = useCallback(
        (menu: React.ReactElement) => (
            <div ref={dropdownRef}>
                {menu}
                {isFetchingNextPage && (
                    <div className="flex justify-center py-2">
                        <Spin size="small" />
                    </div>
                )}
            </div>
        ),
        [isFetchingNextPage],
    );

    return (
        <Select
            showSearch
            filterOption={false}
            onSearch={handleSearch}
            searchValue={search}
            onPopupScroll={handlePopupScroll}
            dropdownRender={dropdownRender}
            loading={isLoading}
            placeholder={placeholder}
            notFoundContent={
                isLoading ? (
                    <div className="flex justify-center py-4">
                        <Spin size="small" />
                    </div>
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={emptyText}
                        className="py-4"
                    />
                )
            }
            options={options}
            suffixIcon={isLoading ? <Spin size="small" /> : <SearchOutlined className="text-gray-400" />}
            {...restProps}
        />
    );
}
