'use client';
import CardProduct from "@/components/client/CardProduct/CardProduct";
import { categoryClientService, productClientService, chatbotClientService } from "@/services/client";
import { ICategory } from "@/types/category";
import { IBrand } from "@/types/brand";
import { IProductCard } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { Carousel } from "antd";
import Link from "next/link";
import { HomePageSkeleton } from "@/components/Skeletons";
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import useAuthUser from "@/hooks/useAuthUser";
import { useEffect, useState } from "react";

import {
    MdKeyboardArrowRight, MdLaptopChromebook, MdPhoneIphone, MdTv,
    MdHeadset, MdCameraAlt, MdWatch
} from "react-icons/md";
import { FireFilled } from "@ant-design/icons";
import { HiOutlineSparkles } from "react-icons/hi";
import { PaginatedResponse } from "@/types/common";


export default function HomeClient() {
    const { user } = useAuthUser();

    const { data: categories } = useQuery<ICategory[]>({
        queryKey: ['categories'],
        queryFn: () => categoryClientService.getAllCategories(),
        staleTime: 1000 * 60 * 5,
    });

    const { data: brands } = useQuery<PaginatedResponse<IBrand>>({
        queryKey: ['brands', 'featured'],
        queryFn: () => productClientService.getBrands({ feature: 'true' }),
        staleTime: 1000 * 60 * 10,
    });

    const { data: clientProducts, isLoading: isLoadingProducts } = useQuery<PaginatedResponse<IProductCard>>({
        queryKey: ['client-products'],
        queryFn: () => productClientService.getClientProducts(1, 20),
        staleTime: 1000 * 60 * 5,
    });

    const { data: topDiscountProducts } = useQuery<IProductCard[]>({
        queryKey: ['top-discount-products'],
        queryFn: () => productClientService.getTopDiscountProducts(20),
        staleTime: 1000 * 60 * 5,
    });

    const { data: recentlyViewed } = useQuery<IProductCard[]>({
        queryKey: ['recently-viewed'],
        queryFn: () => productClientService.getRecentlyViewedProducts(20),
        enabled: !!user?._id,
        staleTime: 1000 * 60 * 2,
    });

    // AI-powered personalized recommendations
    const { data: aiRecommendations } = useQuery<IProductCard[]>({
        queryKey: ['ai-recommendations', user?._id],
        queryFn: () =>
            user?._id
                ? chatbotClientService.getRecommendations(user._id, 20)
                : chatbotClientService.getPopularProducts(20),
        staleTime: 1000 * 60 * 5,
    });

    // Flash sale countdown timer (resets every 6 hours)
    const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
    useEffect(() => {
        const getTimeLeft = () => {
            const now = new Date();
            const msInCycle = 6 * 60 * 60 * 1000;
            const elapsed = (now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000) % msInCycle;
            const remaining = msInCycle - elapsed;
            return {
                hours: Math.floor(remaining / 3600000),
                minutes: Math.floor((remaining % 3600000) / 60000),
                seconds: Math.floor((remaining % 60000) / 1000),
            };
        };
        setCountdown(getTimeLeft());
        const timer = setInterval(() => setCountdown(getTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (isLoadingProducts) {
        return <HomePageSkeleton />
    }

    const responsiveSettings = [
        { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 1 } },
        { breakpoint: 800, settings: { slidesToShow: 3, slidesToScroll: 1 } },
        { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ];

    const brandResponsiveSettings = [
        { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 1 } },
        { breakpoint: 800, settings: { slidesToShow: 3, slidesToScroll: 1 } },
        { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ];

    const ListIcon = [
        <MdLaptopChromebook key={1} className="text-xl" />,
        <MdPhoneIphone key={2} className="text-xl" />,
        <MdTv key={3} className="text-xl" />,
        <MdHeadset key={4} className="text-xl" />,
        <MdCameraAlt key={5} className="text-xl" />,
        <MdWatch key={6} className="text-xl" />,
    ];

    return (
        <>
            <DynamicMetadata
                title="PC Store - Mua sắm PC Gaming, Laptop, Linh kiện chính hãng"
                description="Chuyên cung cấp PC Gaming, Laptop Gaming, Linh kiện máy tính chính hãng với giá tốt nhất. Bảo hành uy tín, giao hàng toàn quốc, trả góp 0%."
                keywords="pc gaming, laptop gaming, laptop văn phòng, linh kiện máy tính, màn hình gaming, bàn phím cơ, chuột gaming, tai nghe gaming"
                ogTitle="PC Store - Siêu thị PC & Laptop Gaming chính hãng"
                ogDescription="Hệ thống bán lẻ PC, Laptop, linh kiện chính hãng uy tín với giá tốt nhất. Bảo hành toàn diện, giao hàng nhanh, hỗ trợ trả góp 0%."
                ogImage="/logo.jpg"
            />
            <div className="dark:bg-slate-900 md:pt-3 pt-44 py-10 bg-gray-50">

                {/* ============= HERO: Category sidebar + Banner ============= */}
                <div className="content-header mx-4 sm:mx-5 xl:mx-32 grid grid-cols-12 grid-flow-row gap-2 xl:gap-5">
                    {/* Category sidebar — original simple style */}
                    <div className="row-span-3 hidden xl:block col-span-3 rounded-lg shadow-sm bg-white border border-gray-100">
                        <ul style={{ scrollbarWidth: "none" }} className="m-0 pl-0 rounded-lg max-h-[700px] overflow-y-scroll dark:bg-slate-800">
                            {categories && categories.length > 0 && categories.map((category, index) => (
                                <Link key={category._id} href={`/collection/${category.slug}`}>
                                    <li className="w-full rounded-t-lg justify-between cursor-pointer dark:text-white hover:bg-indigo-50 hover:text-indigo-600 px-6 py-3 flex items-center">
                                        <span className="font-medium flex items-center gap-3">{ListIcon[index % ListIcon.length]} {category.name}</span>
                                        <MdKeyboardArrowRight className="text-xl" />
                                    </li>
                                </Link>
                            ))}
                        </ul>
                    </div>

                    {/* Banner carousel */}
                    <div className="col-span-12 xl:col-span-9 row-span-3 rounded-lg shadow-sm overflow-hidden max-h-max">
                        <Carousel autoplay arrows autoplaySpeed={3000} dots={{ className: 'custom-dots' }} className="hero-banner-carousel">
                            <div>
                                <div className="relative h-[300px] md:h-[420px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 flex items-center">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    <div className="relative z-10 text-white p-8 md:p-12 max-w-xl">
                                        <h2 className="text-3xl md:text-5xl font-extrabold mb-3">PC Gaming</h2>
                                        <p className="text-lg md:text-xl opacity-90 mb-4">Hiệu năng vượt trội, chiến mọi tựa game!</p>
                                        <Link href="/collection/pc-gaming" className="inline-block bg-white text-indigo-600 font-bold px-6 py-2.5 rounded-full hover:bg-indigo-50 transition-colors">Khám phá ngay</Link>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="relative h-[300px] md:h-[420px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 flex items-center">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    <div className="relative z-10 text-white p-8 md:p-12 max-w-xl">
                                        <h2 className="text-3xl md:text-5xl font-extrabold mb-3">Laptop Gaming</h2>
                                        <p className="text-lg md:text-xl opacity-90 mb-4">Mỏng nhẹ, mạnh mẽ, chiến game mọi nơi!</p>
                                        <Link href="/collection/laptop" className="inline-block bg-white text-emerald-600 font-bold px-6 py-2.5 rounded-full hover:bg-emerald-50 transition-colors">Xem thêm</Link>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="relative h-[300px] md:h-[420px] bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 flex items-center">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    <div className="relative z-10 text-white p-8 md:p-12 max-w-xl">
                                        <h2 className="text-3xl md:text-5xl font-extrabold mb-3">Khuyến mãi HOT</h2>
                                        <p className="text-lg md:text-xl opacity-90 mb-4">Giảm giá đến 50%, số lượng có hạn!</p>
                                        <Link href="/home#top-discount" className="inline-block bg-white text-red-500 font-bold px-6 py-2.5 rounded-full hover:bg-red-50 transition-colors">Mua ngay</Link>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="relative h-[300px] md:h-[420px] bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 flex items-center">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    <div className="relative z-10 text-white p-8 md:p-12 max-w-xl">
                                        <h2 className="text-3xl md:text-5xl font-extrabold mb-3">Màn hình Gaming</h2>
                                        <p className="text-lg md:text-xl opacity-90 mb-4">144Hz+, IPS, chuẩn màu chuyên nghiệp!</p>
                                        <Link href="/collection/man-hinh" className="inline-block bg-white text-purple-600 font-bold px-6 py-2.5 rounded-full hover:bg-purple-50 transition-colors">Tìm hiểu</Link>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="relative h-[300px] md:h-[420px] bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1625225233840-695456021cde?w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    <div className="relative z-10 text-white p-8 md:p-12 max-w-xl">
                                        <h2 className="text-3xl md:text-5xl font-extrabold mb-3">Phụ kiện Gaming</h2>
                                        <p className="text-lg md:text-xl opacity-90 mb-4">Bàn phím cơ, chuột, tai nghe chính hãng!</p>
                                        <Link href="/collection/phu-kien" className="inline-block bg-white text-indigo-600 font-bold px-6 py-2.5 rounded-full hover:bg-indigo-50 transition-colors">Xem ngay</Link>
                                    </div>
                                </div>
                            </div>
                        </Carousel>
                    </div>
                </div>

                {/* ============= RECENTLY VIEWED (only for logged-in users) ============= */}
                {recentlyViewed && recentlyViewed.length > 0 && (
                    <div className="mx-4 sm:mx-5 xl:mx-32 my-8 dark:bg-slate-800 rounded-lg bg-white py-8 px-5 sm:px-7 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700 dark:text-white">
                                Sản phẩm xem gần đây
                            </h1>
                        </div>
                        <Carousel
                            slidesToShow={5} slidesToScroll={1} draggable dots={false}
                            arrows autoplaySpeed={3000} responsive={responsiveSettings}
                        >
                            {recentlyViewed.map((product: IProductCard) => (
                                <div key={product._id} className="px-1.5">
                                    <CardProduct css="p-3" product={product} />
                                </div>
                            ))}
                        </Carousel>
                    </div>
                )}

                {/* ============= BRAND CAROUSEL ============= */}
                {brands?.data && brands.data.length > 0 && (
                    <div className="mx-4 sm:mx-5 xl:mx-32 my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700 dark:text-white">
                                Thương hiệu nổi bật
                            </h1>
                        </div>
                        <Carousel
                            slidesToShow={5} slidesToScroll={1} draggable dots={false}
                            autoplay arrows autoplaySpeed={3000} responsive={brandResponsiveSettings}
                            className="brand-carousel pb-4"
                        >
                            {brands.data.map((brand) => (
                                <div key={brand._id} className="px-2">
                                    <Link
                                        href={`/collection/${brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="group block"
                                    >
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col items-center text-center
                                            hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500 transition-all duration-200 h-[180px] justify-center">
                                            <div className="w-16 h-16 mb-3 flex items-center justify-center">
                                                {brand.logo ? (
                                                    <img src={brand.logo} alt={brand.name}
                                                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                                        {brand.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-sm md:text-base text-gray-800 dark:text-white group-hover:text-indigo-500 transition-colors">
                                                {brand.name}
                                            </h3>
                                            {brand.description && (
                                                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{brand.description}</p>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                )}

                {/* ============= FLASH SALE — TOP DISCOUNT PRODUCTS ============= */}
                {topDiscountProducts && topDiscountProducts.length > 0 && (
                    <div id="top-discount" className="mx-4 sm:mx-5 xl:mx-32 my-8">
                        <div className="bg-red-600 rounded-lg shadow-lg overflow-hidden">
                            {/* Flash sale header */}
                            <div className="flex flex-wrap items-center justify-between px-7 py-4 bg-red-700">
                                <div className="flex items-center gap-3">
                                    <FireFilled className="!text-yellow-300 text-2xl animate-pulse" />
                                    <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-wide uppercase">
                                        Flash Sale
                                    </h1>
                                    <span className="hidden sm:inline-block bg-yellow-400 text-red-700 text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                                        DEAL SỐC
                                    </span>
                                </div>
                                {/* Countdown timer */}
                                <div className="flex items-center gap-2 text-white">
                                    <span className="text-sm font-medium">Kết thúc sau:</span>
                                    <div className="flex gap-1">
                                        <span className="bg-white text-red-600 font-bold text-lg px-2.5 py-1 rounded-md min-w-[40px] text-center">
                                            {String(countdown.hours).padStart(2, '0')}
                                        </span>
                                        <span className="text-xl font-bold">:</span>
                                        <span className="bg-white text-red-600 font-bold text-lg px-2.5 py-1 rounded-md min-w-[40px] text-center">
                                            {String(countdown.minutes).padStart(2, '0')}
                                        </span>
                                        <span className="text-xl font-bold">:</span>
                                        <span className="bg-white text-red-600 font-bold text-lg px-2.5 py-1 rounded-md min-w-[40px] text-center">
                                            {String(countdown.seconds).padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Products */}
                            <div className="bg-white dark:bg-slate-800 py-8 px-5 sm:px-7">
                                <Carousel
                                    slidesToShow={5} slidesToScroll={1} draggable dots={false}
                                    autoplay arrows autoplaySpeed={2500} responsive={responsiveSettings}
                                >
                                    {topDiscountProducts.map((product: IProductCard) => (
                                        <div key={product._id} className="px-1.5">
                                            <CardProduct css="p-3" product={product} />
                                        </div>
                                    ))}
                                </Carousel>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============= AI RECOMMENDATIONS — Gợi ý AI cho bạn ============= */}
                {aiRecommendations && aiRecommendations.length > 0 && (
                    <div className="mx-4 sm:mx-5 xl:mx-32 my-8 dark:bg-slate-800 rounded-lg bg-white py-8 px-5 sm:px-7 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700 dark:text-white flex items-center gap-2">
                                <HiOutlineSparkles className="text-yellow-500" />
                                {user?._id ? 'AI Gợi ý cho bạn' : 'Sản phẩm phổ biến'}
                            </h1>
                            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                Powered by AI
                            </span>
                        </div>
                        <Carousel
                            slidesToShow={5} slidesToScroll={1} draggable dots={false}
                            arrows autoplaySpeed={3500} responsive={responsiveSettings}
                        >
                            {aiRecommendations.map((product: IProductCard) => (
                                <div key={product._id} className="px-1.5">
                                    <CardProduct css="p-3" product={product} />
                                </div>
                            ))}
                        </Carousel>
                    </div>
                )}

                {/* ============= PRODUCT GRID — Gợi ý cho bạn ============= */}
                <div className="mx-4 sm:mx-5 xl:mx-32 my-8 dark:bg-slate-800 rounded-lg bg-white py-8 px-5 sm:px-7 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700 dark:text-white">
                            Gợi ý cho bạn
                        </h1>
                    </div>
                    {clientProducts && clientProducts.data && clientProducts.data.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {clientProducts.data.map((product: IProductCard) => (
                                <div key={product._id}>
                                    <CardProduct css="p-3" product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <p>Chưa có sản phẩm nào</p>
                        </div>
                    )}
                </div>

                {/* ============= TAGLINE ============= */}
                <div className="py-16 sm:py-20 content-center text-slate-600 dark:text-white my-8 flex flex-wrap items-center justify-center font-extrabold text-lg sm:text-xl lg:text-3xl cursor-default text-center px-4">
                    Khơi nguồn đam mê, chạm đến đỉnh công nghệ!
                </div>

                {/* ============= SHOWROOM — Original layout ============= */}
                <div className="mx-4 sm:mx-5 xl:mx-32 dark:bg-slate-800 rounded-lg bg-white py-10 px-5 sm:px-7 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-center">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-500">HỆ THỐNG SHOWROOM</h1>
                    </div>
                    <div className="mt-12 grid grid-flow-row grid-cols-12 gap-3">
                        {/* Showroom 1 */}
                        <div className="dark:text-white col-span-12 my-3 sm:col-span-6 xl:col-span-3">
                            <div className="flex items-center">
                                <div className="text-6xl px-6 rounded-md py-3 mr-4 bg-indigo-100 text-indigo-600">1</div>
                                <div className="font-bold text-indigo-500">
                                    <h5>Showroom bán hàng</h5>
                                    <h2>QUẬN CẦU GIẤY, HÀ NỘI</h2>
                                </div>
                            </div>
                            <h2 className="ml-2 mt-3 mb-5 text-sm sm:text-base">41 Khúc Thừa Dụ, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội</h2>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-images w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hình ảnh showroom</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-solid fa-headphones w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hotline mua hàng: 0969.123.666</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-solid fa-phone w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hotline bảo hành: 19006100</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-envelope w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Email: xuanhodcbas@gmail.com</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-clock w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Thời gian làm việc: 8h00 - 18h30</span>
                            </p>
                        </div>
                        {/* Showroom 2 */}
                        <div className="dark:text-white col-span-12 my-3 sm:col-span-6 xl:col-span-3">
                            <div className="flex items-center">
                                <div className="text-6xl px-6 rounded-md py-3 mr-4 bg-purple-100 text-purple-600">2</div>
                                <div className="font-bold text-indigo-500">
                                    <h5>Showroom bán hàng</h5>
                                    <h2>QUẬN ĐỐNG ĐA, HÀ NỘI</h2>
                                </div>
                            </div>
                            <h2 className="ml-2 mt-3 mb-5 text-sm sm:text-base">94E-94F Đường Láng, Phường Ngã Tư Sở, Quận Đống Đa, Hà Nội</h2>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-images w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hình ảnh showroom</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-solid fa-headphones w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hotline mua hàng: 0969.123.666</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-solid fa-phone w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hotline bảo hành: 19006100</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-envelope w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Email: xuanhodcbas@gmail.com</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-clock w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Thời gian làm việc: 8h00 - 18h30</span>
                            </p>
                        </div>
                        {/* Showroom 3 */}
                        <div className="dark:text-white col-span-12 my-3 sm:col-span-6 xl:col-span-3">
                            <div className="flex items-center">
                                <div className="text-6xl px-6 rounded-md py-3 mr-4 bg-emerald-100 text-emerald-600">3</div>
                                <div className="font-bold text-indigo-500 w-2/3">
                                    <h5>Showroom bán hàng</h5>
                                    <h2>VINH, NGHỆ AN</h2>
                                </div>
                            </div>
                            <h2 className="ml-2 mt-3 mb-5 text-sm sm:text-base">72 Lê Lợi, Thành Phố Vinh, Nghệ An</h2>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-images w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hình ảnh showroom</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-solid fa-headphones w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hotline mua hàng: 0969.123.666</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-solid fa-phone w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hotline bảo hành: 19006100</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-envelope w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Email: xuanhodcbas@gmail.com</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-clock w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Thời gian làm việc: 8h00 - 18h30</span>
                            </p>
                        </div>
                        {/* Showroom 4 */}
                        <div className="dark:text-white col-span-12 my-3 sm:col-span-6 xl:col-span-3">
                            <div className="flex items-center">
                                <div className="text-6xl px-6 rounded-md py-3 mr-4 bg-rose-100 text-rose-600">4</div>
                                <div className="font-bold text-indigo-500">
                                    <h5>Showroom bán hàng</h5>
                                    <h2>QUẬN 10, HỒ CHÍ MINH</h2>
                                </div>
                            </div>
                            <h2 className="ml-2 mt-3 mb-5 text-sm sm:text-base">260 Lý Thường Kiệt, Phường 14, Quận 10, Hồ Chí Minh</h2>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-images w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hình ảnh showroom</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-solid fa-headphones w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hotline mua hàng: 0969.123.666</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-solid fa-phone w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Hotline bảo hành: 19006100</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-envelope w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Email: xuanhodcbas@gmail.com</span>
                            </p>
                            <p className="ml-2 my-3 text-sm sm:text-base flex items-center cursor-pointer hover:text-indigo-500">
                                <i className="fa-regular fa-clock w-1/6 text-xl sm:text-2xl"></i>
                                <span className="w-5/6">Thời gian làm việc: 8h00 - 18h30</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
