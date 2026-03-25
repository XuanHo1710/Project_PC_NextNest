"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Input, Empty, Spin } from "antd";
import { MdOutlineSearch } from "react-icons/md";
import CardProductVariant from "@/components/client/CardProduct/CardProductVariant";
import { productClientService } from "@/services/client";
import { IProductVariantSearchResult } from "@/types/product";
import { PaginatedResponse } from "@/types";
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import Breadcrumb from '@/components/client/Breadcrumb/Breadcrumb';

const PAGE_SIZE = 20;

const sortOptions = [
    { label: "Liên quan nhất", value: "" },
    { label: "Giá tăng dần", value: "displayPrice_1" },
    { label: "Giá giảm dần", value: "displayPrice_-1" },
    { label: "Tên A → Z", value: "productName_1" },
    { label: "Tên Z → A", value: "productName_-1" },
    { label: "Mới nhất", value: "createdAt_-1" },
];

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const q = searchParams.get("q") || "";
    const sortParam = searchParams.get("sort") || "";

    const [searchInput, setSearchInput] = useState(q);
    const [sort, setSort] = useState(sortParam);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Sync input from URL on back/forward navigation
    useEffect(() => {
        setSearchInput(q);
    }, [q]);

    useEffect(() => {
        setSort(sortParam);
    }, [sortParam]);

    const updateURL = useCallback(
        (params: { q?: string; sort?: string }) => {
            const sp = new URLSearchParams();
            const newQ = params.q ?? q;
            const newSort = params.sort ?? sort;

            if (newQ) sp.set("q", newQ);
            if (newSort) sp.set("sort", newSort);

            router.push(`/search?${sp.toString()}`);
        },
        [q, sort, router],
    );

    const handleSearch = () => {
        if (!searchInput.trim()) return;
        updateURL({ q: searchInput.trim() });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        updateURL({ sort: value });
    };

    // Infinite scroll query — uses Elasticsearch
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery<PaginatedResponse<IProductVariantSearchResult>>({
        queryKey: ["es-search-products", q, sort],
        queryFn: ({ pageParam }) =>
            productClientService.esSearchProducts(
                q,
                pageParam as number,
                PAGE_SIZE,
                sort || undefined,
            ),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage.pagination;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        enabled: !!q,
        staleTime: 1000 * 60 * 3,
    });

    // IntersectionObserver for auto-loading
    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { rootMargin: "200px" },
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const variants = data?.pages.flatMap((page) => page.data) || [];
    const totalItems = data?.pages[0]?.pagination?.totalItems || 0;

    return (
        <>
            <DynamicMetadata
                title={q ? `Tìm kiếm "${q}" - PC Store` : "Tìm kiếm sản phẩm - PC Store"}
                description={`Kết quả tìm kiếm cho "${q}" tại PC Store. Tổng ${totalItems} biến thể sản phẩm được tìm thấy.`}
            />

            <div className="md:pt-3 pt-20 bg-slate-50 dark:bg-gray-900 min-h-screen">
                {/* Breadcrumb */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumb items={[{ label: 'Tìm kiếm' }]} />
                </div>

                {/* Search Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
                            Tìm kiếm sản phẩm
                        </h1>
                        <div className="flex gap-3 max-w-2xl">
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Tìm kiếm sản phẩm, thông số (vd: ram 16gb, cpu i7, rtx 4060...)"
                                className="!py-2.5 !px-4 rounded-xl text-base"
                                suffix={
                                    <MdOutlineSearch
                                        className="text-2xl text-gray-400 cursor-pointer hover:text-blue-500"
                                        onClick={handleSearch}
                                    />
                                }
                                size="large"
                            />
                        </div>
                        {q && (
                            <p className="mt-3 text-gray-500 dark:text-gray-400">
                                Kết quả tìm kiếm cho <strong className="text-gray-800 dark:text-white">&quot;{q}&quot;</strong>
                                {!isLoading && <span className="ml-1">— {totalItems} biến thể sản phẩm</span>}
                            </p>
                        )}
                    </div>
                </div>

                {/* Sort & Results */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
                    {q && (
                        <>
                            {/* Sort bar */}
                            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                                <div className="flex gap-2 flex-wrap">
                                    {sortOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSortChange(opt.value)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sort === opt.value
                                                ? "bg-blue-500 text-white shadow-sm"
                                                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Variant Results */}
                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <Spin size="large" />
                                </div>
                            ) : variants.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                                        {variants.map((variant) => (
                                            <div key={variant._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <CardProductVariant css="p-3" variant={variant} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Infinite scroll trigger */}
                                    <div ref={loadMoreRef} className="flex justify-center py-8">
                                        {isFetchingNextPage && <Spin size="large" />}
                                        {!hasNextPage && variants.length > 0 && (
                                            <p className="text-sm text-gray-400">Đã hiển thị tất cả kết quả</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl py-20 flex flex-col items-center">
                                    <Empty
                                        description={
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                                    Không tìm thấy sản phẩm nào
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    Hãy thử tìm kiếm với từ khóa khác hoặc thông số cụ thể hơn
                                                </p>
                                            </div>
                                        }
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {!q && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl py-20 flex flex-col items-center">
                            <MdOutlineSearch className="text-6xl text-gray-300 mb-4" />
                            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                                Nhập từ khóa để tìm kiếm sản phẩm
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Ví dụ: ram 16gb, cpu i7 12th, rtx 4060, laptop gaming...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
