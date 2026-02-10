'use client';
import CardProduct from "@/components/client/CardProduct/CardProduct";
import useCartStore from "@/hooks/useCart";
import { productClientService } from "@/services/client";
import { IProductCard } from "@/types/product";
import { ICategory } from "@/types/category";
import { IBrand } from "@/types/brand";
import { useQuery } from "@tanstack/react-query";
import { Button, Drawer, Image, Pagination, Checkbox, message, Select } from "antd";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { CategoryPageSkeleton } from "@/components/Skeletons";
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import { getDefaultCartVariant } from "@/utils/productHelpers";
import { FiShoppingCart } from "react-icons/fi";
import {
    getProductDisplayPrice,
    getProductOriginalPrice,
    getProductDiscount,
    getProductImage,
} from "@/utils/productHelpers";


interface CollectionResponse {
    items: IProductCard[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    collectionInfo: {
        category: ICategory | null;
        brand: IBrand | null;
    };
}

export default function CollectionPage() {
    const { slug } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToCart } = useCartStore();

    const [page, setPage] = useState(1);
    const [activeSort, setActiveSort] = useState("");
    const [isGridView, setIsGridView] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Filter states
    const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
    const [selectedCpu, setSelectedCpu] = useState<string>("");
    const [selectedRam, setSelectedRam] = useState<string>("");
    const [selectedStorage, setSelectedStorage] = useState<string>("");

    const sort = searchParams.get("sort") || "";
    const cpuParam = searchParams.get("cpu") || "";
    const ramParam = searchParams.get("ram") || "";
    const storageParam = searchParams.get("storage") || "";

    // Single API call: fetches products + collection info (category or brand)
    const { data: collectionData, isLoading } = useQuery<CollectionResponse | null>({
        queryKey: ['collection', slug, page, sort, cpuParam, ramParam, storageParam],
        queryFn: () => productClientService.getCollectionProducts(slug as string, page, 12, sort || undefined, cpuParam || undefined, ramParam || undefined, storageParam || undefined),
        enabled: !!slug,
        staleTime: 1000 * 60 * 5,
    });

    const collectionName = collectionData?.collectionInfo?.category?.name
        || collectionData?.collectionInfo?.brand?.name
        || '';

    const collectionType = collectionData?.collectionInfo?.category ? 'category' : 'brand';

    useEffect(() => {
        if (!isLoading) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isLoading, page, sort]);

    const handlePagination = (value: number) => {
        setPage(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value > 1) {
            params.set("page", value.toString());
        } else {
            params.delete("page");
        }
        router.push(`/collection/${slug}?${params.toString()}`);
    };

    const handleSort = (value: string) => {
        setActiveSort(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("sort", value);
        } else {
            params.delete("sort");
        }
        router.push(`/collection/${slug}?${params.toString()}`);
    };

    const handleApplyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedCpu) {
            params.set("cpu", selectedCpu);
        } else {
            params.delete("cpu");
        }
        if (selectedRam) {
            params.set("ram", selectedRam);
        } else {
            params.delete("ram");
        }
        if (selectedStorage) {
            params.set("storage", selectedStorage);
        } else {
            params.delete("storage");
        }
        params.delete("page");
        setPage(1);
        router.push(`/collection/${slug}?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setSelectedCpu("");
        setSelectedRam("");
        setSelectedStorage("");
        setSelectedPrices([]);
        const params = new URLSearchParams();
        if (sort) params.set("sort", sort);
        router.push(`/collection/${slug}?${params.toString()}`);
    };

    const cpuOptions = [
        { label: 'Intel Core i3', value: 'i3' },
        { label: 'Intel Core i5', value: 'i5' },
        { label: 'Intel Core i7', value: 'i7' },
        { label: 'Intel Core i9', value: 'i9' },
        { label: 'AMD Ryzen 3', value: 'Ryzen 3' },
        { label: 'AMD Ryzen 5', value: 'Ryzen 5' },
        { label: 'AMD Ryzen 7', value: 'Ryzen 7' },
        { label: 'AMD Ryzen 9', value: 'Ryzen 9' },
        { label: 'Apple M1', value: 'M1' },
        { label: 'Apple M2', value: 'M2' },
        { label: 'Apple M3', value: 'M3' },
        { label: 'Apple M4', value: 'M4' },
    ];

    const ramOptions = [
        { label: '4GB', value: '4GB' },
        { label: '8GB', value: '8GB' },
        { label: '16GB', value: '16GB' },
        { label: '32GB', value: '32GB' },
        { label: '64GB', value: '64GB' },
    ];

    const storageOptions = [
        { label: '128GB', value: '128GB' },
        { label: '256GB', value: '256GB' },
        { label: '512GB', value: '512GB' },
        { label: '1TB', value: '1TB' },
        { label: '2TB', value: '2TB' },
        { label: '4TB', value: '4TB' },
    ];

    const prices = [
        { label: 'Dưới 10 triệu', value: 'price_0-10' },
        { label: '10 - 15 triệu', value: 'price_10-15' },
        { label: '15 - 20 triệu', value: 'price_15-20' },
        { label: '20 - 25 triệu', value: 'price_20-25' },
        { label: '25 - 30 triệu', value: 'price_25-30' },
        { label: 'Trên 35 triệu', value: 'price_35-99999999' },
    ];

    if (isLoading) {
        return <CategoryPageSkeleton />;
    }

    return (
        <>
            {collectionName && (
                <DynamicMetadata
                    title={`${collectionName} - PC Store | Mua ${collectionName} chính hãng giá tốt`}
                    description={`Mua ${collectionName} chính hãng với giá tốt nhất tại PC Store. Đa dạng sản phẩm, bảo hành uy tín, giao hàng nhanh. Tổng ${collectionData?.totalItems || 0} sản phẩm.`}
                    keywords={`${collectionName}, mua ${collectionName}, ${collectionName} giá rẻ, ${collectionName} chính hãng`}
                    ogTitle={`${collectionName} - Hơn ${collectionData?.totalItems || 0} sản phẩm chính hãng`}
                    ogDescription={`Khám phá bộ sưu tập ${collectionName} đa dạng tại PC Store.`}
                />
            )}

            {/* Mobile Filter Drawer */}
            <Drawer
                className="dark:!bg-blue-900 dark:!text-white"
                title="Bộ lọc sản phẩm"
                placement="bottom"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                height={500}
            >
                <div className="mb-4">
                    <h3 className="uppercase font-semibold py-2 border-b-2 border-stone-200">CPU</h3>
                    <Select
                        placeholder="Chọn CPU"
                        className="w-full mt-2"
                        value={selectedCpu || undefined}
                        onChange={(val) => setSelectedCpu(val || "")}
                        allowClear
                        options={cpuOptions}
                    />
                </div>
                <div className="mb-4">
                    <h3 className="uppercase font-semibold py-2 border-b-2 border-stone-200">RAM</h3>
                    <Select
                        placeholder="Chọn RAM"
                        className="w-full mt-2"
                        value={selectedRam || undefined}
                        onChange={(val) => setSelectedRam(val || "")}
                        allowClear
                        options={ramOptions}
                    />
                </div>
                <div className="mb-4">
                    <h3 className="uppercase font-semibold py-2 border-b-2 border-stone-200">Dung lượng</h3>
                    <Select
                        placeholder="Chọn dung lượng"
                        className="w-full mt-2"
                        value={selectedStorage || undefined}
                        onChange={(val) => setSelectedStorage(val || "")}
                        allowClear
                        options={storageOptions}
                    />
                </div>
                <div className="mb-4">
                    <h3 className="uppercase font-semibold py-2 border-b-2 border-stone-200">Khoảng giá</h3>
                    <Checkbox.Group
                        className="flex flex-col gap-3 mt-3 font-medium text-black dark:text-white"
                        options={prices}
                        value={selectedPrices}
                        onChange={setSelectedPrices}
                    />
                </div>
                <Button
                    type="primary"
                    className="uppercase w-full my-2 py-5"
                    onClick={() => { handleApplyFilters(); setDrawerOpen(false); }}
                >
                    Lọc sản phẩm
                </Button>
                {(selectedCpu || selectedRam || selectedStorage || selectedPrices.length > 0) && (
                    <Button
                        className="w-full py-5"
                        onClick={() => { handleClearFilters(); setDrawerOpen(false); }}
                    >
                        Xóa bộ lọc
                    </Button>
                )}
            </Drawer>

            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
                {/* Breadcrumb */}
                <div className="mx-5 xl:mx-32 flex items-center flex-wrap gap-2 py-3">
                    <Link href="/home" className="font-medium text-sm text-stone-500 hover:text-blue-500 transition-colors">
                        Trang chủ
                    </Link>
                    <span className="text-stone-400">/</span>
                    {collectionName && (
                        <span className="font-medium text-sm text-blue-500">{collectionName}</span>
                    )}
                </div>

                {/* Page Title */}
                <div className="mx-5 xl:mx-32 mb-5">
                    <h1 className="font-bold text-xl lg:text-3xl uppercase text-blue-500 border-b-2 border-blue-400 pb-2 inline-block">
                        {collectionName}
                        <span className="ml-2 text-sm text-stone-400 lowercase font-medium">
                            (Tổng {collectionData?.totalItems || 0} sản phẩm)
                        </span>
                    </h1>
                    {collectionType === 'brand' && collectionData?.collectionInfo?.brand?.logo && (
                        <div className="mt-3 flex items-center gap-3">
                            <img
                                src={collectionData.collectionInfo.brand.logo}
                                alt={collectionName}
                                className="h-8 object-contain"
                            />
                            {collectionData.collectionInfo.brand.description && (
                                <p className="text-sm text-gray-500">{collectionData.collectionInfo.brand.description}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="mx-5 my-5 xl:mx-32 grid grid-cols-12 lg:gap-8">
                    {/* Sidebar Filters (Desktop) */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 sticky top-24">
                            <h3 className="font-bold text-base mb-4 text-gray-800 dark:text-white">Bộ lọc</h3>

                            {/* CPU Filter */}
                            <div className="mb-5">
                                <h4 className="uppercase text-xs font-semibold text-gray-500 py-2 border-b border-stone-200">CPU</h4>
                                <Select
                                    placeholder="Chọn CPU"
                                    className="w-full mt-2"
                                    value={selectedCpu || undefined}
                                    onChange={(val) => setSelectedCpu(val || "")}
                                    allowClear
                                    options={cpuOptions}
                                />
                            </div>

                            {/* RAM Filter */}
                            <div className="mb-5">
                                <h4 className="uppercase text-xs font-semibold text-gray-500 py-2 border-b border-stone-200">RAM</h4>
                                <Select
                                    placeholder="Chọn RAM"
                                    className="w-full mt-2"
                                    value={selectedRam || undefined}
                                    onChange={(val) => setSelectedRam(val || "")}
                                    allowClear
                                    options={ramOptions}
                                />
                            </div>

                            {/* Storage Filter */}
                            <div className="mb-5">
                                <h4 className="uppercase text-xs font-semibold text-gray-500 py-2 border-b border-stone-200">Dung lượng</h4>
                                <Select
                                    placeholder="Chọn dung lượng"
                                    className="w-full mt-2"
                                    value={selectedStorage || undefined}
                                    onChange={(val) => setSelectedStorage(val || "")}
                                    allowClear
                                    options={storageOptions}
                                />
                            </div>

                            {/* Price Filter */}
                            <div className="mb-5">
                                <h4 className="uppercase text-xs font-semibold text-gray-500 py-2 border-b border-stone-200">Khoảng giá</h4>
                                <Checkbox.Group
                                    className="flex flex-col gap-2.5 mt-3 text-sm text-black dark:text-white"
                                    options={prices}
                                    value={selectedPrices}
                                    onChange={setSelectedPrices}
                                />
                            </div>

                            <Button
                                type="primary"
                                className="w-full mb-2"
                                onClick={handleApplyFilters}
                            >
                                Lọc sản phẩm
                            </Button>
                            {(selectedCpu || selectedRam || selectedStorage || selectedPrices.length > 0) && (
                                <Button
                                    className="w-full"
                                    onClick={handleClearFilters}
                                >
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-4 py-5 mb-10">
                            {/* Sort & View Toggle */}
                            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => handleSort("")}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSort === "" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100"}`}
                                    >
                                        Mới nhất
                                    </button>
                                    <button
                                        onClick={() => handleSort("minPrice_1")}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSort === "minPrice_1" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100"}`}
                                    >
                                        Giá tăng dần
                                    </button>
                                    <button
                                        onClick={() => handleSort("minPrice_-1")}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSort === "minPrice_-1" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100"}`}
                                    >
                                        Giá giảm dần
                                    </button>
                                    <button
                                        onClick={() => handleSort("name_1")}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSort === "name_1" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100"}`}
                                    >
                                        A → Z
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setDrawerOpen(true)}
                                        className="lg:hidden px-4 py-2 rounded-full text-sm bg-blue-50 text-blue-500 font-medium"
                                    >
                                        Bộ lọc <i className="ml-1 fa-solid fa-filter"></i>
                                    </button>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setIsGridView(true)}
                                            className={`p-2 rounded ${isGridView ? "text-blue-500" : "text-gray-400"}`}
                                        >
                                            <i className="fa-solid fa-table-cells-large"></i>
                                        </button>
                                        <button
                                            onClick={() => setIsGridView(false)}
                                            className={`p-2 rounded ${!isGridView ? "text-blue-500" : "text-gray-400"}`}
                                        >
                                            <i className="fa-solid fa-list"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            {isGridView ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {collectionData && collectionData.items.length > 0 ? (
                                        collectionData.items.map((product) => (
                                            <div key={product._id} className="border border-gray-100 dark:border-gray-700 rounded-lg">
                                                <CardProduct css="p-2" product={product} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-16">
                                            <FiShoppingCart className="text-5xl mx-auto mb-4 text-stone-300" />
                                            <h2 className="text-lg font-semibold text-gray-500">Chưa có sản phẩm nào</h2>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {collectionData && collectionData.items.length > 0 ? (
                                        collectionData.items.map((product) => (
                                            <div key={product._id} className="flex gap-4 p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow">
                                                <div className="w-32 h-32 flex-shrink-0">
                                                    <Image
                                                        preview={false}
                                                        src={getProductImage(product)}
                                                        alt={product.name}
                                                        className="rounded object-contain"
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                                    <div>
                                                        <Link href={`/product/${product.slug || product._id}`}>
                                                            <h2 className="font-medium text-sm md:text-base line-clamp-2 hover:text-blue-500 transition-colors">
                                                                {product.name}
                                                            </h2>
                                                        </Link>
                                                    </div>
                                                    <div className="flex items-end justify-between">
                                                        <div>
                                                            <p className="font-bold text-lg text-blue-500">
                                                                {getProductDisplayPrice(product).toLocaleString()}đ
                                                            </p>
                                                            {getProductDiscount(product) > 0 && (
                                                                <p className="text-xs text-gray-400">
                                                                    <span className="line-through mr-2">{getProductOriginalPrice(product).toLocaleString()}đ</span>
                                                                    <span className="text-red-500">-{getProductDiscount(product).toFixed(0)}%</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const variant = getDefaultCartVariant(product);
                                                                if (!variant) {
                                                                    message.warning('Sản phẩm không có phiên bản khả dụng!');
                                                                    return;
                                                                }
                                                                if (variant.stock <= 0) {
                                                                    message.error('Sản phẩm đã hết hàng!');
                                                                    return;
                                                                }
                                                                Swal.fire({
                                                                    icon: "success",
                                                                    title: "Đã thêm vào giỏ hàng!",
                                                                    showConfirmButton: false,
                                                                    timer: 1500,
                                                                });
                                                                addToCart(product, variant);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                                                        >
                                                            <i className="fa-solid fa-cart-shopping"></i>
                                                            <span className="hidden md:inline">Thêm vào giỏ</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-16">
                                            <FiShoppingCart className="text-5xl mx-auto mb-4 text-stone-300" />
                                            <h2 className="text-lg font-semibold text-gray-500">Chưa có sản phẩm nào</h2>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pagination */}
                            {collectionData && collectionData.totalItems > 0 && (
                                <div className="flex justify-end mt-6">
                                    <Pagination
                                        current={collectionData.currentPage}
                                        total={collectionData.totalItems}
                                        pageSize={collectionData.limit}
                                        onChange={handlePagination}
                                        showSizeChanger={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
