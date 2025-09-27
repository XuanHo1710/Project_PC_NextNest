'use client';
import { useState, useEffect } from 'react';
import CardProduct from "@/components/client/CardProduct/CardProduct";
import { productClientService } from "@/services/client";
import { IProductCard, IProductWithPagination } from "@/types/model.client.d";
import { useQuery } from "@tanstack/react-query";
import { Button, Carousel, Image, Progress, Rate, Tag, Tabs, Input } from "antd";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductDetailSkeleton } from "@/components/Skeletons";
import {
    ShoppingCartOutlined,
    HeartOutlined,
    CheckCircleFilled,
    FireFilled,
    LikeOutlined,
    DislikeOutlined,
    CommentOutlined,
    SendOutlined,
    StarFilled,
    SafetyCertificateFilled,
    ThunderboltFilled,
    RocketFilled,
    QuestionCircleOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

// Mảng dữ liệu demo cho phần bình luận
const demoComments = [
    {
        id: 1,
        author: 'Nguyễn Văn A',
        avatar: 'https://i.pravatar.cc/150?img=1',
        rating: 5,
        date: '12/09/2025',
        content: 'Sản phẩm rất tuyệt vời, máy chạy mượt mà và không gây tiếng ồn. Đặc biệt card đồ họa hoạt động rất tốt khi chơi game.',
        likes: 12,
        dislikes: 2,
        verified: true,
        replies: [
            {
                id: 101,
                author: 'Admin',
                avatar: 'https://i.pravatar.cc/150?img=60',
                content: 'Cảm ơn bạn đã đánh giá tích cực về sản phẩm. Chúc bạn có trải nghiệm tốt!',
                date: '13/09/2025',
                isAdmin: true
            }
        ]
    },
    {
        id: 2,
        author: 'Trần Thị B',
        avatar: 'https://i.pravatar.cc/150?img=5',
        rating: 4,
        date: '10/09/2025',
        content: 'Máy tính đẹp, hiệu năng tốt cho công việc văn phòng và chơi game nhẹ. Tuy nhiên tản nhiệt hơi ồn khi chạy nặng.',
        likes: 8,
        dislikes: 1,
        verified: true,
        replies: []
    },
    {
        id: 3,
        author: 'Lê Văn C',
        avatar: 'https://i.pravatar.cc/150?img=8',
        rating: 5,
        date: '05/09/2025',
        content: 'Máy tính chơi game cực đỉnh, chạy các game AAA mới nhất vẫn rất mượt. Rất hài lòng với sản phẩm này.',
        likes: 15,
        dislikes: 0,
        verified: true,
        replies: []
    }
];

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
    const { id } = useParams();
    const [userRating, setUserRating] = useState(0);
    const [commentText, setCommentText] = useState('');

    const { data: product, isLoading: isLoadingProduct } = useQuery<IProductCard>({
        queryKey: ['product-by-id', id],
        queryFn: () => productClientService.getProductsById(id as string),
        enabled: !!id,
    });

    const { data: dataProduct, isLoading: isLoadingRelated } = useQuery<(IProductWithPagination) | null>({
        queryKey: ['product-by-category', product?.category?._id || ""],
        queryFn: () => productClientService.getProductsByCategoryId(product?.category?._id || "" as string),
        enabled: !!product?.category?._id,
    });

    const isLoading = isLoadingProduct || isLoadingRelated;

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

    const handleCommentSubmit = () => {
        console.log('Đánh giá:', userRating);
        console.log('Bình luận:', commentText);
        // Reset form
        setUserRating(0);
        setCommentText('');
    };

    const handleLikeComment = (commentId: number) => {
        console.log('Đã thích bình luận:', commentId);
    };

    const handleDislikeComment = (commentId: number) => {
        console.log('Không thích bình luận:', commentId);
    };



    // Hiển thị skeleton khi đang tải dữ liệu
    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    return (
        <>
            {product && product._id &&
                <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-gray-900 dark:text-white">
                    {/* Breadcrumb */}
                    <div className='rounded-lg mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                        <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white  mr-3 header-nav active">Trang chủ</Link>
                        <i className="fa-solid fa-chevron-right text-stone-500  mr-3"></i>
                        <Link href={`/category/${product.category?._id}`} className="font-medium text-lg text-stone-500 dark:text-white  mr-3 header-nav active">{product.category?.name}</Link>
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
                                <div className="bg-white rounded-lg shadow-sm p-2 mb-4">
                                    <Carousel className='w-full' autoplay autoplaySpeed={3000} dots={true} effect="fade">
                                        {product.images.map((img, index) => (
                                            <div key={index} className="h-[300px] md:h-[400px] flex items-center justify-center bg-gray-50">
                                                <Image
                                                    src={img}
                                                    alt={product.name}
                                                    className="object-contain max-h-full"
                                                    preview={true}
                                                />
                                            </div>
                                        ))}
                                    </Carousel>
                                </div>

                                {/* Thumbnails */}
                                <div className='grid grid-cols-5 gap-2'>
                                    {product.images.map((img, index) => (
                                        <div key={index} className="border border-gray-200 hover:border-blue-500 rounded-md overflow-hidden transition-all cursor-pointer">
                                            <Image
                                                src={img}
                                                alt={`thumbnail-${index}`}
                                                className="object-cover w-full h-16"
                                                preview={false}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Đánh giá */}
                                <div className='mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between'>
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-bold text-yellow-500">4.8/5</span>
                                        <Rate disabled defaultValue={4.8} className="text-sm" />
                                        <span className="text-xs text-gray-500 dark:text-gray-300 mt-1">120 đánh giá</span>
                                    </div>
                                    <div className="h-12 w-px bg-gray-300 dark:bg-gray-600 mx-4"></div>
                                    <div className="flex flex-col">
                                        <span className="text-green-600 dark:text-green-400 font-bold flex items-center mb-1">
                                            <CheckCircleFilled className="mr-1" /> Đã bán: 89+
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
                                    <p className="text-gray-600 dark:text-gray-300 italic text-sm">{product.description}</p>
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
                                        icon={<ShoppingCartOutlined />}
                                        className='shadow-lg font-medium sm:font-bold text-sm sm:text-lg bg-yellow-500 dark:bg-yellow-600 text-white border-yellow-500 hover:bg-yellow-600 hover:border-yellow-600 h-auto py-2 px-6'
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>
                                    <Button
                                        size="large"
                                        icon={<ThunderboltFilled />}
                                        className='shadow-lg font-medium sm:font-bold text-sm sm:text-lg bg-red-500 dark:bg-red-600 text-white border-red-500 hover:bg-red-600 hover:border-red-600 h-auto py-2 px-8'
                                    >
                                        Mua ngay
                                    </Button>
                                    <Button
                                        size="large"
                                        icon={<HeartOutlined />}
                                        className='shadow-sm font-medium text-sm sm:text-base border-gray-300 hover:text-red-500 h-auto'
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
                                        <div className='overflow-x-auto'>
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-blue-50 dark:bg-gray-700">
                                                        <th className="p-3 text-left font-bold text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700">STT</th>
                                                        <th className="p-3 text-left font-bold text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700">MÃ HÀNG</th>
                                                        <th className="p-3 text-left font-bold text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700">TÊN HÀNG</th>
                                                        <th className="p-3 text-left font-bold text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700">THỜI HẠN BẢO HÀNH</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">1</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">CPU</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium text-blue-600 dark:text-blue-400">INTEL CORE i5 12600K up 4.9GHz | 10 CORE | 16 THREAD</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">36 THÁNG</td>
                                                    </tr>
                                                    <tr className="bg-gray-50 dark:bg-gray-750">
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">2</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">MAIN</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium text-blue-600 dark:text-blue-400">GIGABYTE B760M GAMING X DDR4</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">36 THÁNG</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">3</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">TẢN NHIỆT</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium text-blue-600 dark:text-blue-400">JUNGLE LEOPARD KF-400 ARGB</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">12 THÁNG</td>
                                                    </tr>
                                                    <tr className="bg-gray-50 dark:bg-gray-750">
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">4</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">RAM</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium text-blue-600 dark:text-blue-400">DDR4 16GB 3200 MHz (1x16G)</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">60 THÁNG</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">5</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">SSD</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium text-blue-600 dark:text-blue-400">TEAMGROUP MP33 PRO 512GB M.2 PCIe Gen3x4 - RW 3500MB/s</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">60 THÁNG</td>
                                                    </tr>
                                                    <tr className="bg-gray-50 dark:bg-gray-750">
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">6</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">VGA</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium text-blue-600 dark:text-blue-400">GIGABYTE RTX 3060 WINDFORCE OC 12G GDDR6</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">36 THÁNG</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">7</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">PSU</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium text-blue-600 dark:text-blue-400">FSP650-70ALA 650W - 80 PLUS GOLD</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">36 THÁNG</td>
                                                    </tr>
                                                    <tr className="bg-gray-50 dark:bg-gray-750">
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">8</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">CASE</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium text-blue-600 dark:text-blue-400">XIGMATEK GAMING X II 3F - 3FAN RGB</td>
                                                        <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium dark:text-white">36 THÁNG</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                },
                                {
                                    key: '2',
                                    label: 'Mô tả sản phẩm',
                                    children: (
                                        <div className="prose max-w-none dark:prose-invert">
                                            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">Giới thiệu {product.name}</h3>
                                            <p>{product.description}</p>

                                            {/* Thêm mô tả demo */}
                                            <p className="my-4">
                                                {product.name} là sự lựa chọn hoàn hảo cho những người dùng tìm kiếm một chiếc máy tính có hiệu năng mạnh mẽ.
                                                Được trang bị bộ vi xử lý Intel Core i5 12600K với 10 nhân và 16 luồng,
                                                máy tính này có thể xử lý mọi tác vụ từ công việc văn phòng đến các game đòi hỏi cấu hình cao.
                                            </p>

                                            <div className="my-6 text-center">
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="rounded-lg inline-block shadow-md"
                                                />
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Hình ảnh {product.name}</p>
                                            </div>

                                            <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-3">Hiệu năng vượt trội</h4>
                                            <p>
                                                Với card đồ họa GIGABYTE RTX 3060 WINDFORCE OC 12G GDDR6, máy tính này có khả năng xử lý hình ảnh mượt mà,
                                                đáp ứng nhu cầu chơi game ở độ phân giải cao hoặc làm việc với các phần mềm đồ họa chuyên nghiệp.
                                                Bộ nhớ RAM 16GB DDR4 3200MHz cùng ổ cứng SSD TEAMGROUP MP33 PRO 512GB M.2 PCIe Gen3x4
                                                giúp máy khởi động nhanh chóng và làm việc đa nhiệm mượt mà.
                                            </p>

                                            <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-3">Thiết kế hiện đại</h4>
                                            <p>
                                                Case XIGMATEK GAMING X II 3F với 3 quạt RGB không chỉ mang đến vẻ ngoài bắt mắt mà còn đảm bảo
                                                khả năng tản nhiệt hiệu quả. Mainboard GIGABYTE B760M GAMING X DDR4 cung cấp đầy đủ cổng kết nối và
                                                khả năng nâng cấp trong tương lai. Nguồn FSP650-70ALA 650W với chứng nhận 80 PLUS GOLD đảm bảo
                                                hiệu suất cao và độ bền lâu dài.
                                            </p>

                                            <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-3">Ưu điểm nổi bật</h4>
                                            <ul className="list-disc pl-6">
                                                <li>CPU Intel Core i5 12600K mạnh mẽ với 10 nhân 16 luồng, xung nhịp tối đa 4.9GHz</li>
                                                <li>Card đồ họa RTX 3060 12GB GDDR6 cho trải nghiệm chơi game và xử lý đồ họa tuyệt vời</li>
                                                <li>RAM 16GB DDR4 3200MHz với khả năng nâng cấp mở rộng</li>
                                                <li>SSD NVMe 512GB với tốc độ đọc/ghi lên đến 3500MB/s</li>
                                                <li>Hệ thống tản nhiệt hiệu quả với quạt ARGB hiện đại</li>
                                                <li>Bảo hành chính hãng lên đến 36 tháng cho các linh kiện chính</li>
                                            </ul>

                                            <hr className="my-6 border-gray-200 dark:border-gray-600" />

                                            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                                                {product.name} là sự lựa chọn tuyệt vời cho những ai đang tìm kiếm một chiếc PC gaming hiệu năng cao
                                                với mức giá hợp lý. Ngoài ra, chúng tôi còn đi kèm nhiều ưu đãi hấp dẫn như giảm giá khi mua kèm
                                                màn hình và RAM, cùng bộ phần mềm bản quyền trị giá hơn 1 triệu đồng.
                                            </p>
                                        </div>
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
                                            <div className="mb-8">
                                                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">Đánh giá từ khách hàng</h3>
                                                <div className="flex flex-col md:flex-row gap-8">
                                                    <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        <div className="text-5xl font-bold text-yellow-500">4.8</div>
                                                        <Rate disabled defaultValue={4.8} className="text-lg mb-2" />
                                                        <p className="text-gray-500 dark:text-gray-300">Dựa trên 120 đánh giá</p>
                                                    </div>
                                                    <div className="md:w-2/3">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center">
                                                                <span className="w-20 text-sm">5 sao</span>
                                                                <Progress percent={85} showInfo={false} className="flex-grow mx-4" strokeColor="#fadb14" />
                                                                <span className="w-10 text-right text-sm text-gray-500 dark:text-gray-300">85%</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-20 text-sm">4 sao</span>
                                                                <Progress percent={12} showInfo={false} className="flex-grow mx-4" strokeColor="#fadb14" />
                                                                <span className="w-10 text-right text-sm text-gray-500 dark:text-gray-300">12%</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-20 text-sm">3 sao</span>
                                                                <Progress percent={3} showInfo={false} className="flex-grow mx-4" strokeColor="#fadb14" />
                                                                <span className="w-10 text-right text-sm text-gray-500 dark:text-gray-300">3%</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-20 text-sm">2 sao</span>
                                                                <Progress percent={0} showInfo={false} className="flex-grow mx-4" strokeColor="#fadb14" />
                                                                <span className="w-10 text-right text-sm text-gray-500 dark:text-gray-300">0%</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-20 text-sm">1 sao</span>
                                                                <Progress percent={0} showInfo={false} className="flex-grow mx-4" strokeColor="#fadb14" />
                                                                <span className="w-10 text-right text-sm text-gray-500 dark:text-gray-300">0%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Form đánh giá */}
                                            <div className="mb-10 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                                                <h3 className="text-xl font-bold mb-4 flex items-center">
                                                    <StarFilled className="mr-2 text-yellow-500" /> Viết đánh giá của bạn
                                                </h3>
                                                <div>
                                                    <div className="mb-4">
                                                        <p className="mb-2 font-medium">Đánh giá sao:</p>
                                                        <Rate
                                                            value={userRating}
                                                            onChange={setUserRating}
                                                            className="text-xl"
                                                        />
                                                    </div>
                                                    <TextArea
                                                        rows={4}
                                                        placeholder="Nhận xét của bạn về sản phẩm..."
                                                        className="mb-4"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                    />
                                                    <div className="flex justify-between">
                                                        <div className="flex items-center">
                                                            <input type="file" id="image-upload" className="hidden" />
                                                            <label htmlFor="image-upload" className="cursor-pointer text-blue-600 dark:text-blue-400 flex items-center">
                                                                <span className="icon-[material-symbols--add-photo-alternate] mr-2"></span>
                                                                Thêm ảnh
                                                            </label>
                                                        </div>
                                                        <Button
                                                            type="primary"
                                                            icon={<SendOutlined />}
                                                            onClick={handleCommentSubmit}
                                                        >
                                                            Gửi đánh giá
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Danh sách bình luận */}
                                            <div className="space-y-6">
                                                {demoComments.map(comment => (
                                                    <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                                        <div className="flex items-start">
                                                            <Image
                                                                src={comment.avatar}
                                                                alt={comment.author}
                                                                className="rounded-full"
                                                                width={48}
                                                                height={48}
                                                                preview={false}
                                                                style={{ marginRight: '16px' }}
                                                            />
                                                            <div className="flex-grow">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h4 className="font-medium flex items-center">
                                                                            {comment.author}
                                                                            {comment.verified && (
                                                                                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center">
                                                                                    <CheckCircleFilled className="mr-1" />
                                                                                    Đã mua hàng
                                                                                </span>
                                                                            )}
                                                                        </h4>
                                                                        <div className="flex items-center mt-1">
                                                                            <Rate disabled defaultValue={comment.rating} className="text-xs" />
                                                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{comment.date}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
                                                                <div className="mt-3 flex items-center space-x-4">
                                                                    <button
                                                                        className="text-gray-500 dark:text-gray-400 text-sm flex items-center hover:text-blue-600"
                                                                        onClick={() => handleLikeComment(comment.id)}
                                                                    >
                                                                        <LikeOutlined className="mr-1" />
                                                                        Hữu ích ({comment.likes})
                                                                    </button>
                                                                    <button
                                                                        className="text-gray-500 dark:text-gray-400 text-sm flex items-center hover:text-red-600"
                                                                        onClick={() => handleDislikeComment(comment.id)}
                                                                    >
                                                                        <DislikeOutlined className="mr-1" />
                                                                        Không hữu ích ({comment.dislikes})
                                                                    </button>
                                                                    <button className="text-gray-500 dark:text-gray-400 text-sm flex items-center hover:text-blue-600">
                                                                        <CommentOutlined className="mr-1" />
                                                                        Trả lời
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Phần trả lời */}
                                                        {comment.replies.length > 0 && (
                                                            <div className="ml-16 mt-4">
                                                                {comment.replies.map(reply => (
                                                                    <div key={reply.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-2">
                                                                        <div className="flex items-start">
                                                                            <Image
                                                                                src={reply.avatar}
                                                                                alt={reply.author}
                                                                                className="rounded-full"
                                                                                width={32}
                                                                                height={32}
                                                                                preview={false}
                                                                                style={{ marginRight: '12px' }}
                                                                            />
                                                                            <div>
                                                                                <div className="flex items-center">
                                                                                    <h5 className="font-medium text-sm">
                                                                                        {reply.author}
                                                                                    </h5>
                                                                                    {reply.isAdmin && (
                                                                                        <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-xs rounded-full">
                                                                                            Nhân viên
                                                                                        </span>
                                                                                    )}
                                                                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{reply.date}</span>
                                                                                </div>
                                                                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Nút xem thêm */}
                                            <div className="mt-6 text-center">
                                                <Button type="default" className="hover:border-blue-500 hover:text-blue-600">
                                                    Xem thêm đánh giá
                                                </Button>
                                            </div>
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
            }
        </>
    );
}
