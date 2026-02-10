"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Input, Pagination, Empty, Spin, Select } from "antd";
import { MdOutlineSearch } from "react-icons/md";
import Link from "next/link";
import CardProduct from "@/components/client/CardProduct/CardProduct";
import { productClientService } from "@/services/client";
import { IProductCard } from "@/types/product";
import { DynamicMetadata } from "@/components/common/DynamicMetadata";

const sortOptions = [
    { label: "Mới nhất", value: "" },
    { label: "Cũ nhất", value: "createdAt_1" },
    { label: "Giá tăng dần", value: "minPrice_1" },
    { label: "Giá giảm dần", value: "minPrice_-1" },
    { label: "Tên A → Z", value: "name_1" },
    { label: "Tên Z → A", value: "name_-1" },
];

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const q = searchParams.get("q") || "";
    const sortParam = searchParams.get("sort") || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    const [searchInput, setSearchInput] = useState(q);
    const [page, setPage] = useState(pageParam);
    const [sort, setSort] = useState(sortParam);

    // Sync input from URL on back/forward navigation
    useEffect(() => {
        setSearchInput(q);
    }, [q]);

    useEffect(() => {
        setPage(pageParam);
    }, [pageParam]);

    useEffect(() => {
        setSort(sortParam);
    }, [sortParam]);

    const updateURL = useCallback(
        (params: { q?: string; sort?: string; page?: number }) => {
            const sp = new URLSearchParams();
            const newQ = params.q ?? q;
            const newSort = params.sort ?? sort;
            const newPage = params.page ?? 1;

            if (newQ) sp.set("q", newQ);
            if (newSort) sp.set("sort", newSort);
            if (newPage > 1) sp.set("page", newPage.toString());

            router.push(`/search?${sp.toString()}`);
        },
        [q, sort, router],
    );

    const handleSearch = () => {
        if (!searchInput.trim()) return;
        updateURL({ q: searchInput.trim(), page: 1 });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        updateURL({ sort: value, page: 1 });
    };

    const handlePageChange = (p: number) => {
        setPage(p);
        updateURL({ page: p });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Search query
    const { data: searchData, isLoading } = useQuery<{
        items: IProductCard[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    }>({
        queryKey: ["search-products", q, sort, page],
        queryFn: () =>
            productClientService.searchProductsPaginated
                ? productClientService.searchProductsPaginated(q, page, 20, sort || undefined)
                : productClientService.searchProducts(q).then((items: IProductCard[]) => ({
                    items,
                    totalItems: items.length,
                    totalPages: 1,
                    currentPage: 1,
                    limit: 20,
                })),
        enabled: !!q,
        staleTime: 1000 * 60 * 3,
    });

    const products = searchData?.items || [];
    const totalItems = searchData?.totalItems || 0;

    return (
        <>
            <DynamicMetadata
                title={q ? `Tìm kiếm "${q}" - PC Store` : "Tìm kiếm sản phẩm - PC Store"}
                description={`Kết quả tìm kiếm cho "${q}" tại PC Store. Tổng ${totalItems} sản phẩm được tìm thấy.`}
            />

            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-gray-900 min-h-screen">
                {/* Breadcrumb */}
                <div className="mx-5 xl:mx-32 flex items-center gap-2 py-3">
                    <Link href="/home" className="font-medium text-sm text-stone-500 hover:text-blue-500 transition-colors">
                        Trang chủ
                    </Link>
                    <span className="text-stone-400">/</span>
                    <span className="font-medium text-sm text-blue-500">Tìm kiếm</span>
                </div>

                {/* Search Header */}
                <div className="mx-5 xl:mx-32 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
                            🔍 Tìm kiếm sản phẩm
                        </h1>
                        <div className="flex gap-3 max-w-2xl">
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập tên sản phẩm cần tìm..."
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
                                {!isLoading && <span className="ml-1">— {totalItems} sản phẩm</span>}
                            </p>
                        )}
                    </div>
                </div>

                {/* Sort & Results */}
                <div className="mx-5 xl:mx-32 mb-10">
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

                            {/* Products */}
                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <Spin size="large" />
                                </div>
                            ) : products.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {products.map((product) => (
                                            <div key={product._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <CardProduct css="p-3" product={product} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {(searchData?.totalPages ?? 0) > 1 && (
                                        <div className="flex justify-center mt-8">
                                            <Pagination
                                                current={page}
                                                total={totalItems}
                                                pageSize={searchData?.limit || 20}
                                                onChange={handlePageChange}
                                                showSizeChanger={false}
                                            />
                                        </div>
                                    )}
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
                                                    Hãy thử tìm kiếm với từ khóa khác
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
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
