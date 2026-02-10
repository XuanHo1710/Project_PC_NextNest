'use client';
import CardProduct from "@/components/client/CardProduct/CardProduct";
import { categoryClientService, productClientService } from "@/services/client";
import { ICategory } from "@/types/category";
import { IBrand } from "@/types/brand";
import { IProductCard } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { Carousel, Spin } from "antd";
import Link from "next/link";
import { HomePageSkeleton } from "@/components/Skeletons";
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import { getProductDiscount } from "@/utils/productHelpers";

import { MdKeyboardArrowRight, MdLaptopChromebook, MdPhoneIphone, MdTv, MdHeadset, MdCameraAlt, MdWatch } from "react-icons/md";
import { PaginatedResponse } from "@/types/common";


export default function HomeClient() {
    // const { data: categoriesPreview, isLoading: isLoadingPreview } = useQuery<ICategoryPreview[] | []>({
    //     queryKey: ['categories-preview'],
    //     queryFn: () => categoryClientService.getCategoriesPreview(),
    //     staleTime: 1000 * 60 * 5,
    // });

    const { data: categories } = useQuery<ICategory[] | []>({
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

    if (isLoadingProducts) {
        return <HomePageSkeleton />
    }


    const responsiveSettings = [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 800,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            },
        },
    ];

    const brandResponsiveSettings = [
        {
            breakpoint: 1024,
            settings: { slidesToShow: 4, slidesToScroll: 1 },
        },
        {
            breakpoint: 800,
            settings: { slidesToShow: 3, slidesToScroll: 1 },
        },
        {
            breakpoint: 600,
            settings: { slidesToShow: 2, slidesToScroll: 1 },
        },
    ];

    const ListIcon = [
        <MdLaptopChromebook key={1} className="text-xl" />,
        <MdPhoneIphone key={2} className="text-xl" />,
        <MdTv key={3} className="text-xl" />,
        <MdHeadset key={4} className="text-xl" />,
        <MdCameraAlt key={5} className="text-xl" />,
        <MdWatch key={6} className="text-xl" />
    ];
    return (
        <>
            <DynamicMetadata
                title="PC Store - Mua sắm PC Gaming, Laptop, Linh kiện chính hãng"
                description="Chuyên cung cấp PC Gaming, Laptop Gaming, Linh kiện máy tính chính hãng với giá tốt nhất. Bảo hành uy tín, giao hàng toàn quốc, trả góp 0%."
                keywords="pc gaming, laptop gaming, laptop văn phòng, linh kiện máy tính, màn hình gaming, bàn phím cơ, chuột gaming, tai nghe gaming, pc build, pc giá rẻ, laptop giá rẻ"
                ogTitle="PC Store - Siêu thị PC & Laptop Gaming chính hãng"
                ogDescription="Hệ thống bán lẻ PC, Laptop, linh kiện chính hãng uy tín với giá tốt nhất. Bảo hành toàn diện, giao hàng nhanh, hỗ trợ trả góp 0%."
                ogImage="/logo.jpg"
            />
            <div className="dark:bg-slate-900 md:pt-3 pt-52 py-10 bg-slate-50">
                {/* Category sidebar + placeholder for banner (commented out — APIs not ready) */}
                <div className='content-header mx-5 xl:mx-32 grid grid-cols-12 grid-flow-row gap-2 xl:gap-5'>
                    <div className='row-span-3 hidden xl:block col-span-3 rounded-lg shadow-lg bg-white'>
                        <ul style={{ scrollbarWidth: "none" }} className='m-0 pl-0 rounded-lg max-h-[700px] overflow-y-scroll dark:bg-blue-950'>
                            {categories && categories.length > 0 && categories.map((category, index) => (
                                <Link key={category._id} href={`/collection/${category.slug}`}>
                                    <li className='w-full rounded-t-lg justify-between cursor-pointer dark:text-white hover:bg-blue-100 hover:text-blue-500 px-6 py-3 flex items-center'>
                                        <span className='font-medium flex items-center gap-3'>{ListIcon[index % ListIcon.length]} {category.name}</span>
                                        <MdKeyboardArrowRight className="text-xl" />
                                    </li>
                                </Link>
                            ))}
                        </ul>
                    </div>
                    {/* Banner carousel — commented out (API chưa có) */}
                    {/* <div className='col-span-12 xl:col-span-6 row-span-2'>
                        <Carousel autoplay arrows autoplaySpeed={2500} dots={false}>
                            ... banner images ...
                        </Carousel>
                    </div> */}
                    <div className='col-span-12 gap-10 xl:col-span-9 row-span-3 rounded-lg shadow-lg overflow-hidden max-h-max'>
                        <Carousel autoplay arrows autoplaySpeed={3000} dots={{ className: 'custom-dots' }} className="hero-banner-carousel">
                            <div>
                                <div className="relative h-[300px] md:h-[420px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 flex items-center">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    <div className="relative z-10 text-white p-8 md:p-12 max-w-xl">
                                        <h2 className="text-3xl md:text-5xl font-extrabold mb-3">PC Gaming</h2>
                                        <p className="text-lg md:text-xl opacity-90 mb-4">Hiệu năng vượt trội, chiến mọi tựa game!</p>
                                        <Link href="/collection/pc-gaming" className="inline-block bg-white text-blue-600 font-bold px-6 py-2.5 rounded-full hover:bg-blue-50 transition-colors">Khám phá ngay</Link>
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
                                        <Link href="/collection/phu-kien" className="inline-block bg-white text-blue-600 font-bold px-6 py-2.5 rounded-full hover:bg-blue-50 transition-colors">Xem ngay</Link>
                                    </div>
                                </div>
                            </div>
                        </Carousel>
                        <Carousel autoplay arrows autoplaySpeed={3000} dots={{ className: 'custom-dots' }} className="hero-banner-carousel">
                            <div>
                                <div className="relative h-[300px] md:h-[420px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 flex items-center">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    <div className="relative z-10 text-white p-8 md:p-12 max-w-xl">
                                        <h2 className="text-3xl md:text-5xl font-extrabold mb-3">PC Gaming</h2>
                                        <p className="text-lg md:text-xl opacity-90 mb-4">Hiệu năng vượt trội, chiến mọi tựa game!</p>
                                        <Link href="/collection/pc-gaming" className="inline-block bg-white text-blue-600 font-bold px-6 py-2.5 rounded-full hover:bg-blue-50 transition-colors">Khám phá ngay</Link>
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
                                        <Link href="/collection/phu-kien" className="inline-block bg-white text-blue-600 font-bold px-6 py-2.5 rounded-full hover:bg-blue-50 transition-colors">Xem ngay</Link>
                                    </div>
                                </div>
                            </div>
                        </Carousel>
                    </div>
                </div>

                {/* ============= BRAND CAROUSEL (ở trên khuyến mãi) ============= */}
                {brands.data && brands.data.length > 0 && (
                    <div className="mx-5 xl:mx-32 my-10">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white">
                                Thương hiệu nổi bật
                            </h1>
                        </div>
                        <Carousel
                            slidesToShow={5}
                            slidesToScroll={1}
                            draggable
                            dots={false}
                            autoplay
                            arrows
                            autoplaySpeed={3000}
                            responsive={brandResponsiveSettings}
                            className="brand-carousel pb-4"
                        >
                            {brands.data.map((brand) => (
                                <div key={brand._id} className="px-2">
                                    <Link
                                        href={`/collection/${brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="group block"
                                    >
                                        <div className="bg-white dark:bg-blue-950 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col items-center text-center hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 h-[180px] justify-center">
                                            <div className="w-16 h-16 mb-3 flex items-center justify-center">
                                                {brand.logo ? (
                                                    <img
                                                        src={brand.logo}
                                                        alt={brand.name}
                                                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                                        {brand.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-sm md:text-base text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors">
                                                {brand.name}
                                            </h3>
                                            {brand.description && (
                                                <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                                    {brand.description}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                )}

                {/* ============= TOP DISCOUNT PRODUCTS CAROUSEL ============= */}
                {topDiscountProducts && topDiscountProducts.length > 0 && (
                    <div className='mx-5 xl:mx-32 my-10 dark:bg-blue-950 rounded-lg bg-white py-8 px-7 shadow-lg'>
                        <div className='flex items-center justify-between mb-6'>
                            <h1 className='text-xl md:text-3xl font-bold text-red-500'>
                                🔥 Khuyến mãi hot - Top {topDiscountProducts.length} sản phẩm giảm giá sốc
                            </h1>
                        </div>
                        <Carousel
                            slidesToShow={5}
                            slidesToScroll={1}
                            draggable
                            className='gap-10 pb-6 border-none'
                            dots={false}
                            autoplay
                            arrows
                            autoplaySpeed={2500}
                            responsive={responsiveSettings}
                        >
                            {topDiscountProducts.map((product: IProductCard) => (
                                <div key={product._id} className='px-1.5'>
                                    <CardProduct css="p-3" product={product} />
                                </div>
                            ))}
                        </Carousel>
                    </div>
                )}

                {/* ============= GỢI Ý CHO BẠN - Product Grid ============= */}
                <div className='mx-5 xl:mx-32 my-10 dark:bg-blue-950 rounded-lg bg-white py-8 px-7 shadow-lg'>
                    <div className='flex items-center justify-between mb-6'>
                        <h1 className='text-xl md:text-3xl font-bold text-blue-500'>
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
                        <div className="text-center py-10 text-gray-400">
                            Chưa có sản phẩm nào
                        </div>
                    )}
                </div>

                {/* ============= CATEGORIES PREVIEW — commented out (API chưa có) ============= */}
                {/* <Spin size="large" spinning={isLoadingPreview}>
                    {!isLoadingPreview && categoriesPreview && categoriesPreview.length > 0 &&
                        categoriesPreview.map(category => (
                            <div key={category?._id} className='box-promotion mx-5 xl:mx-32 my-10 dark:bg-blue-950 rounded-lg bg-white py-10 px-7 shadow-lg'>
                                ...
                            </div>
                        ))
                    }
                </Spin> */}

                <div className='h-60 content-center text-white my-10 flex flex-wrap items-center justify-center font-extrabold text-base sm:text-xl lg:text-4xl cursor-default'>
                    Khơi nguồn đam mê, chạm đến đỉnh công nghệ!
                </div>
                <div className='mx-5 xl:mx-32 dark:bg-blue-950 rounded-lg bg-white py-10 px-7 shadow-md'>
                    <div className='flex items-center justify-center'>
                        <h1 className='text-xl md:text-3xl font-bold text-blue-500'>HỆ THỐNG SHOWROOM CỦA ARISU</h1>
                    </div>
                    <div className='mt-12 grid grid-flow-row grid-cols-12 gap-3'>
                        <div className='dark:text-white col-span-12 my-3 sm:col-span-6 xl:col-span-3'>
                            <div className='flex items-center'>
                                <div className='text-6xl px-6 rounded-md py-3 mr-4 bg-blue-200'>1</div>
                                <div className='font-bold text-blue-500'>
                                    <h5>Showroom bán hàng</h5>
                                    <h2>QUẬN CẦU GIẤY, HÀ NỘI</h2>
                                </div>
                            </div>
                            <h2 className='ml-2 mt-3 mb-5'>41 Khúc Thừa Dụ, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội</h2>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-images w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hình ảnh showroom</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-solid fa-headphones w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hotline mua hàng: 0969.123.666</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-solid fa-phone w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hotline bảo hành: 19006100</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-envelope w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Email: xuanhodcbas@gmail.com</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-clock w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Thời gian làm việc: 8h00 - 18h30</span>
                            </p>
                        </div>
                        <div className='dark:text-white  col-span-12 my-3 sm:col-span-6 xl:col-span-3'>
                            <div className='flex items-center'>
                                <div className='text-6xl px-6 rounded-md py-3 mr-4 bg-purple-400'>2</div>
                                <div className='font-bold text-blue-500'>
                                    <h5>Showroom bán hàng</h5>
                                    <h2>QUẬN ĐỐNG ĐA, HÀ NỘI</h2>
                                </div>
                            </div>
                            <h2 className='ml-2 mt-3 mb-5'>94E-94F Đường Láng, Phường Ngã Tư Sở, Quận Đống Đa, Hà Nội</h2>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-images w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hình ảnh showroom</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-solid fa-headphones w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hotline mua hàng: 0969.123.666</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-solid fa-phone w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hotline bảo hành: 19006100</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-envelope w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Email: xuanhodcbas@gmail.com</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-clock w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Thời gian làm việc: 8h00 - 18h30</span>
                            </p>
                        </div>
                        <div className='dark:text-white  col-span-12 my-3 sm:col-span-6 xl:col-span-3'>
                            <div className='flex items-center'>
                                <div className='text-6xl px-6 rounded-md py-3 mr-4 bg-green-300'>3</div>
                                <div className='font-bold text-blue-500 w-2/3'>
                                    <h5>Showroom bán hàng</h5>
                                    <h2>VINH, NGHỆ AN</h2>
                                </div>
                            </div>
                            <h2 className='ml-2 mt-3 mb-5'>94E-94F, 72 Lê Lợi, Thành Phố Vinh, Nghệ An</h2>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-images w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hình ảnh showroom</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-solid fa-headphones w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hotline mua hàng: 0969.123.666</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-solid fa-phone w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hotline bảo hành: 19006100</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-envelope w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Email: xuanhodcbas@gmail.com</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-clock w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Thời gian làm việc: 8h00 - 18h30</span>
                            </p>
                        </div>
                        <div className='dark:text-white  col-span-12 my-3 sm:col-span-6 xl:col-span-3'>
                            <div className='flex items-center'>
                                <div className='text-6xl px-6 rounded-md py-3 mr-4 bg-red-200'>4</div>
                                <div className='font-bold text-blue-500'>
                                    <h5>Showroom bán hàng</h5>
                                    <h2>QUẬN 10, HỒ CHÍ MINH</h2>
                                </div>
                            </div>
                            <h2 className='ml-2 mt-3 mb-5'>260 Lý Thường Kiệt, Phường 14, Quận 10, Hồ Chí Minh</h2>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-images w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hình ảnh showroom</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-solid fa-headphones w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hotline mua hàng: 0969.123.666</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-solid fa-phone w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Hotline bảo hành: 19006100</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-envelope w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Email: xuanhodcbas@gmail.com</span>
                            </p>
                            <p className='ml-2 my-3 text-base flex items-center cursor-pointer hover:text-blue-600'>
                                <i className="fa-regular fa-clock w-1/6 text-2xl"></i>
                                <span className='w-5/6'>Thời gian làm việc: 8h00 - 18h30</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
