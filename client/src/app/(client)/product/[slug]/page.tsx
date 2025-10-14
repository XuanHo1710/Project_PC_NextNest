'use client';
import { useEffect } from 'react';
import CardProduct from "@/components/client/CardProduct/CardProduct";
import { productClientService } from "@/services/client";
import { IProductCard, IProductWithPagination } from "@/types/model.client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Carousel, Rate, Tag, Tabs, message } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProductDetailSkeleton } from "@/components/Skeletons";
import {
    ShoppingCartOutlined,
    HeartOutlined,
    CheckCircleFilled,
    FireFilled,
    CommentOutlined,
    SafetyCertificateFilled,
    ThunderboltFilled,
    RocketFilled,
    QuestionCircleOutlined
} from '@ant-design/icons';
import CommentProduct from '@/components/client/ProductDetail/Comment';
import DescriptionProduct from '@/components/client/ProductDetail/Description';
import SpecificationsProduct from '@/components/client/ProductDetail/Specifications';
import ProductImageGallery from '@/components/client/ProductDetail/ProductImageGallery';
import useCartStore from '@/hooks/useCart';
import Swal from "sweetalert2";
import useAuthUser from '@/hooks/useAuthUser';
import { DynamicMetadata } from "@/components/common/DynamicMetadata";


// Dữ liệu demo cho FAQ
const faqs = [
    {
        question: "Sản phẩm này có bảo hành chính hãng không?",
        answer: "Có, sản phẩm được bảo hành chính hãng theo từng linh kiện, chi tiết xem trong bảng thông số kỹ thuật."
    },
    {
        question: "Máy có thể nâng cấp RAM sau khi mua không?",
        answer: "Có, máy có thể nâng cấp thêm RAM tối đa 64GB với 4 khe cắm."
    },
    {
        question: "Thời gian giao hàng là bao lâu?",
        answer: "Thời gian giao hàng từ 1-3 ngày đối với nội thành và 3-5 ngày đối với các tỉnh."
    },
    {
        question: "Có hỗ trợ trả góp không?",
        answer: "Có, chúng tôi hỗ trợ trả góp qua thẻ tín dụng và nhiều công ty tài chính với lãi suất từ 0%."
    }
];


export default function ProductDetailClient() {
    const { slug } = useParams();
    const router = useRouter();
    const { addToCart } = useCartStore();
    const { user } = useAuthUser();
    const queryClient = useQueryClient();

    const { data: product, isLoading: isLoadingProduct } = useQuery<IProductCard>({
        queryKey: ['product-by-id', slug],
        queryFn: () => productClientService.getProductsBySlug(slug as string),
        enabled: !!slug,
    });

    console.log("product", product);
    const { data: dataWishlist, isLoading: isLoadingWishlist } = useQuery<{ isWishlisted: boolean }>({
        queryKey: ['product-isWishlist', product?._id, user?.id],
        queryFn: () => productClientService.isWishlistByGuestAndProduct(user?.id || "", product?._id as string),
        enabled: !!product?._id && !!user?.id,
    });

    const { data: dataProduct, isLoading: isLoadingRelated } = useQuery<(IProductWithPagination) | null>({
        queryKey: ['product-by-category', product?.category?._id || ""],
        queryFn: () => productClientService.getProductsByCategoryId(product?.category?._id || "" as string),
        enabled: !!product?.category?._id,
    });

    // Mutation for posting comments
    const addToListMutation = useMutation({
        mutationFn: ({ guestID, productID, isWishlist }: { guestID: string, productID: string, isWishlist: boolean }) =>
            productClientService.handleWishlist(guestID, productID, isWishlist),
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Cập nhật danh sách yêu thích thành công!",
            });
            queryClient.invalidateQueries({ queryKey: ['product-isWishlist', product?._id, user?.id] });
        },
        onError: () => {
            message.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    });

    const isLoading = isLoadingProduct || isLoadingRelated || isLoadingWishlist;

    useEffect(() => {
        if (!isLoading) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isLoading]);


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

    const handleAddToWishlist = (product: IProductCard) => {
        const guestID = user?.id || "";
        if (!guestID) {
            Swal.fire({
                icon: "warning",
                title: "Vui lòng đăng nhập để sử dụng tính năng này!",
            });
        }
        addToListMutation.mutate({ guestID, productID: product._id, isWishlist: !dataWishlist?.isWishlisted });
    }



    // Hiển thị skeleton khi đang tải dữ liệu
    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    return (
        <>
            {product && product._id && (
                <>
                    <DynamicMetadata
                        title={`${product.name} - Giá ${product.newPrice.toLocaleString()}đ | PC Store`}
                        description={`Mua ${product.name} chính hãng giá ${product.newPrice.toLocaleString()}đ (Giảm ${product.discount.toFixed(0)}% từ ${product.oldPrice.toLocaleString()}đ). ${product.description || 'Bảo hành chính hãng, giao hàng nhanh, trả góp 0%.'} ⭐ Đánh giá ${product.ratingAvg?.toFixed(1)}/5 (${product.totalRatings} đánh giá). Đã bán ${product.soldCount}+ sản phẩm.`}
                        keywords={`${product.name}, mua ${product.name}, ${product.name} giá rẻ, ${product.name} chính hãng, ${product.category?.name || 'pc gaming'}, linh kiện máy tính`}
                        ogTitle={`${product.name} - Sale ${product.discount.toFixed(0)}% còn ${product.newPrice.toLocaleString()}đ`}
                        ogDescription={`⭐ ${product.ratingAvg?.toFixed(1)}/5 (${product.totalRatings} đánh giá) | Đã bán ${product.soldCount}+ | ${product.description || 'Bảo hành chính hãng, giao hàng nhanh'}`}
                        ogImage={product.images[0] || '/laptop.png'}
                    />
                    <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-gray-900 dark:text-white">
                        {/* Breadcrumb */}
                        <div className='rounded-lg mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                            <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white  mr-3 header-nav active">Trang chủ</Link>
                            <i className="fa-solid fa-chevron-right text-stone-500  mr-3"></i>
                            <Link href={`/category/${product.category?.slug}`} className="font-medium text-lg text-stone-500 dark:text-white  mr-3 header-nav active">{product.category?.name}</Link>
                            <i className="fa-solid fa-chevron-right text-stone-500 dark:text-gray-400 mr-3"></i>
                            <h3 className="font-medium text-lg  text-blue-500 dark:text-white  mr-3">{product.name}</h3>
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className='rounded-lg mx-5 xl:mx-32 content-body my-5 p-4 md:p-6 bg-white dark:bg-gray-800 dark:text-white shadow-lg'>
                            <h1 className='font-bold text-xl text-blue-600 dark:text-white lg:text-3xl line-clamp-2 py-3 border-solid border-b-2 border-blue-200 flex items-center'>
                                {product.name}
                                {product.discount > 10 && (
                                    <span className="ml-3 bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-medium flex items-center">
                                        <FireFilled className="mr-1" /> Hot
                                    </span>
                                )}
                            </h1>

                            <div className='grid grid-cols-1 lg:grid-cols-12 my-6 gap-8'>
                                {/* Hình ảnh sản phẩm */}
                                <div className='lg:col-span-5 xl:col-span-4'>
                                    <ProductImageGallery
                                        images={product.images}
                                        productName={product.name}
                                    />

                                    {/* Đánh giá */}
                                    <div className='mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between'>
                                        <div className="flex flex-col items-center">
                                            <span className="text-lg font-bold text-yellow-500">{product.ratingAvg?.toFixed(2)}/5</span>
                                            <Rate disabled defaultValue={product.ratingAvg} allowHalf className="text-sm" />
                                            <span className="text-xs text-gray-500 dark:text-gray-300 mt-1">{product.totalRatings} đánh giá</span>
                                        </div>
                                        <div className="h-12 w-px bg-gray-300 dark:bg-gray-600 mx-4"></div>
                                        <div className="flex flex-col">
                                            <span className="text-green-600 dark:text-green-400 font-bold flex items-center mb-1">
                                                <CheckCircleFilled className="mr-1" /> Đã bán: {product.soldCount}+
                                            </span>
                                            <span className="text-blue-600 dark:text-blue-400 text-sm flex items-center">
                                                <SafetyCertificateFilled className="mr-1" /> Hàng chính hãng
                                            </span>
                                        </div>
                                    </div>

                                    {/* Chia sẻ */}
                                    <div className="mt-4 flex items-center">
                                        <span className="text-gray-600 dark:text-gray-300 mr-3">Chia sẻ:</span>
                                        <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2">
                                            <i className="fab fa-facebook-f"></i>
                                        </button>
                                        <button className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white mr-2">
                                            <i className="fab fa-twitter"></i>
                                        </button>
                                        <button className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                                            <i className="fab fa-whatsapp"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Thông tin chi tiết sản phẩm */}
                                <div className='lg:col-span-7 xl:col-span-8'>
                                    {/* Thông số sản phẩm */}
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                                        <h3 className='text-lg font-semibold mb-3 flex items-center'>
                                            <span className="icon-[material-symbols--settings] mr-2 text-blue-500"></span>
                                            Thông số sản phẩm
                                        </h3>
                                        <ul className='text-stone-800 dark:text-white break-words grid grid-cols-1 md:grid-cols-2 gap-y-2'>
                                            {product.other?.map((o, index) => (
                                                <li key={index} className='break-words flex items-start'>
                                                    <span className="icon-[material-symbols--check-small-rounded] mt-1 text-green-500 mr-2"></span>
                                                    <div>
                                                        <span className="uppercase font-semibold">{o.key}</span>: {o.value}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        <hr className="my-4 border-gray-200 dark:border-gray-600" />
                                        {/* <p className="text-gray-600 dark:text-gray-300 italic text-sm">{product.description}</p> */}
                                    </div>

                                    {/* Giá sản phẩm */}
                                    <div className='px-4 py-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-sm'>
                                        <div className='md:flex items-end'>
                                            <p className='text-blue-600 dark:text-red-400 inline-block md:block font-bold text-xl md:text-2xl xl:text-4xl'>
                                                {(product.newPrice).toLocaleString()} đ
                                            </p>
                                            <div className="flex items-center">
                                                <p className='mb-3 md:mb-0 mx-4 line-through inline-block md:block text-stone-500 text-lg md:text-xl xl:text-2xl font-bold'>
                                                    {product.oldPrice.toLocaleString()} đ
                                                </p>
                                                <Tag className='text-sm font-medium' color="red">
                                                    Tiết kiệm {(product?.discount).toFixed(0)}%
                                                </Tag>
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap gap-2 mt-3'>
                                            <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                Bảo hành theo từng linh kiện (xem chi tiết)
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quà tặng */}
                                    <div className='card-gift border-solid border-2 border-red-400 rounded-lg shadow-md mb-6'>
                                        <div className='p-3 card-header-gift flex items-center border-b-2 border-solid border-red-100'>
                                            <i className="mr-2 fa-solid text-red-400 fa-gift"></i>
                                            <h2 className="text-red-500 text-lg font-bold">Quà tặng và ưu đãi kèm theo</h2>
                                        </div>
                                        <div className='card-body-gift p-4'>
                                            <h2 className='text-red-600 my-2 font-bold'>ƯU ĐÃI KHI MUA KÈM PC TẠI HOÀNG HÀ PC</h2>
                                            <div className="space-y-3 mt-4">
                                                <div className="flex items-start">
                                                    <span className="text-yellow-500 mr-2">⭐</span>
                                                    <p className='font-medium'>
                                                        Giảm ngay
                                                        <span className='text-red-500 font-bold'> 100.000đ</span> khi mua thêm
                                                        <span className='text-red-500 font-bold'> Màn Hình Máy Tính.</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="text-yellow-500 mr-2">⭐</span>
                                                    <p className='font-medium'>
                                                        Giảm ngay
                                                        <span className='text-red-500 font-bold'> 100.000đ </span>
                                                        khi mua thêm<span className='text-red-500 font-bold'> RAM</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="text-yellow-500 mr-2">⭐</span>
                                                    <p className='font-medium'>
                                                        Tặng ngay
                                                        <span className='text-red-500 font-bold'> Bộ phần mềm bản quyền </span>
                                                        trị giá <span className='text-red-500 font-bold'>1.200.000đ</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vận chuyển */}
                                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
                                        <h3 className='font-semibold mb-3 flex items-center'>
                                            <span className="icon-[material-symbols--local-shipping] mr-2 text-blue-600"></span>
                                            Thông tin vận chuyển
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center">
                                                <span className="icon-[material-symbols--timer] text-blue-500 mr-2"></span>
                                                <span>Giao hàng trong 24h</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="icon-[material-symbols--location-on] text-blue-500 mr-2"></span>
                                                <span>Miễn phí giao hàng {`>`}2 triệu</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="icon-[material-symbols--payments] text-blue-500 mr-2"></span>
                                                <span>Thanh toán khi nhận hàng</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="icon-[material-symbols--support-agent] text-blue-500 mr-2"></span>
                                                <span>Hotline hỗ trợ: 1900 1234</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nút mua hàng */}
                                    <div className='flex flex-wrap gap-4 mt-6'>
                                        <Button
                                            size="large"
                                            onClick={() => {
                                                Swal.fire({
                                                    icon: "success",
                                                    title: "Thêm sản phẩm vào giỏ hàng thành công!",
                                                    showConfirmButton: false,
                                                    timer: 2000,
                                                    background: "#fff",
                                                    color: "#000",        // màu chữ
                                                    iconColor: "#52c41a",
                                                    customClass: {
                                                        title: "!text-2xl", // chữ nhỏ hơn (Tailwind)
                                                    },
                                                });
                                                addToCart(product)
                                            }}
                                            icon={<ShoppingCartOutlined />}
                                            className='!shadow-lg !font-medium !sm:font-bold !text-sm !sm:text-lg !bg-yellow-500 !dark:bg-yellow-600 !text-white !border-yellow-500 hover:!bg-yellow-600 hover:!border-yellow-600 !h-auto !py-2 !px-6'
                                        >
                                            Thêm vào giỏ hàng
                                        </Button>
                                        <Button
                                            size="large"
                                            onClick={() => {
                                                addToCart(product);
                                                router.push('/cart');
                                            }}
                                            icon={<ThunderboltFilled />}
                                            className='!shadow-lg !font-medium !sm:font-bold !text-sm !sm:text-lg !bg-red-500 !dark:bg-red-600 !text-white !border-red-500 hover:!bg-red-600 hover:!border-red-600 !h-auto !py-2 !px-8'
                                        >
                                            Mua ngay
                                        </Button>
                                        <Button
                                            size="large"
                                            icon={<HeartOutlined />}
                                            onClick={() => handleAddToWishlist(product)}
                                            className={'!shadow-sm !font-medium !text-sm !sm:text-base !border-gray-300 hover:!text-red-500 !h-auto '
                                                + (dataWishlist && dataWishlist.isWishlisted ? ' !text-red-500 !border-red-300' : ' !text-black')
                                            }
                                        >
                                            Yêu thích
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs chi tiết sản phẩm */}
                        <div className='rounded-lg mx-5 xl:mx-32 content-body my-5 p-4 bg-white dark:bg-gray-800 shadow-lg'>
                            <Tabs
                                defaultActiveKey="1"
                                onChange={(key) => console.log(key)}
                                type="card"
                                className="product-detail-tabs"
                                size="large"
                                items={[
                                    {
                                        key: '1',
                                        label: 'Thông số kỹ thuật',
                                        children: (
                                            <SpecificationsProduct />
                                        )
                                    },
                                    {
                                        key: '2',
                                        label: 'Mô tả sản phẩm',
                                        children: (
                                            <DescriptionProduct product={product} />
                                        )
                                    },
                                    {
                                        key: '3',
                                        label: (
                                            <span className="flex items-center">
                                                <CommentOutlined className="mr-1" /> Đánh giá và bình luận
                                            </span>
                                        ),
                                        children: (
                                            <>
                                                <CommentProduct product={product} />
                                            </>
                                        )
                                    },
                                    {
                                        key: '4',
                                        label: (
                                            <span className="flex items-center">
                                                <QuestionCircleOutlined className="mr-1" /> Câu hỏi thường gặp
                                            </span>
                                        ),
                                        children: (
                                            <div className="space-y-4">
                                                {faqs.map((faq, index) => (
                                                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <h4 className="font-medium text-lg mb-2 flex items-start text-blue-600 dark:text-blue-400">
                                                            <QuestionCircleOutlined className="mr-2 mt-1" />
                                                            {faq.question}
                                                        </h4>
                                                        <p className="ml-7 text-gray-700 dark:text-gray-300">{faq.answer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    },
                                ]}
                            />
                        </div>

                        {/* Sản phẩm tương tự */}
                        <div className='rounded-lg mx-5 my-10 xl:mx-32 content-body py-5 p-4 bg-white dark:bg-gray-800 shadow-lg'>
                            <h1 className='font-bold text-blue-600 dark:text-white text-xl lg:text-3xl line-clamp-1 py-2 border-solid border-b-2 border-blue-200 flex items-center'>
                                <RocketFilled className="mr-3 text-blue-500" /> Sản phẩm tương tự
                            </h1>
                            <Carousel
                                slidesToShow={5}
                                slidesToScroll={1}
                                draggable
                                className='mt-8 cursor-grab'
                                dots={false}
                                autoplay
                                arrows
                                autoplaySpeed={2000}
                                responsive={responsiveSettings}
                            >
                                {dataProduct && dataProduct.products.length > 0 &&
                                    dataProduct.products.map(item => (
                                        <div key={item._id} className='px-1.5 dark:text-white'>
                                            <CardProduct css="hover:shadow-lg transition-all duration-300" product={item} />
                                        </div>
                                    ))
                                }
                            </Carousel>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
