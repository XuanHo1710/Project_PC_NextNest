'use client';
import CardProduct from "@/components/client/CardProduct/CardProduct";
import { productClientService } from "@/services/client";
import { IProductCard, IProductWithPagination } from "@/types/model.client.d";
import { useQuery } from "@tanstack/react-query";
import { Button, Carousel, Image, Progress, Rate, Tag } from "antd";
import Link from "next/link";
import { useParams } from "next/navigation";


export default function ProductDetailClient() {
    const { id } = useParams();
    const { data: product } = useQuery<IProductCard>({
        queryKey: ['product-by-id', id], // key để cache
        queryFn: () => productClientService.getProductsById(id as string),
        enabled: !!id, // 5 phút cache không gọi lại
    });

    const { data: dataProduct, isLoading } = useQuery<(IProductWithPagination) | null>({
        queryKey: ['product-by-category', product?.category?._id || ""], // key để cache
        queryFn: () => productClientService.getProductsByCategoryId(product?.category?._id || "" as string),
        enabled: !!product?.category?._id, // 5 phút cache không gọi lại
    });

    if (!isLoading) {
        window.scrollTo({ top: 0 }); // scroll mượt lên top
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



    return (
        <>
            {product && product._id &&
                <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-gray-900 dark:text-white">
                    <div className='rounded-lg mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                        <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white  mr-3 header-nav active">Trang chủ</Link>
                        <i className="fa-solid fa-chevron-right text-stone-500  mr-3"></i>
                        <Link href={`/category/${product.category?._id}`} className="font-medium text-lg text-stone-500 dark:text-white  mr-3 header-nav active">{product.category?.name}</Link>
                        <i className="fa-solid fa-chevron-right text-stone-500 dark:text-gray-400 mr-3"></i>
                        <h3 className="font-medium text-lg  text-stone-500 dark:text-white  mr-3">{product.name}</h3>
                    </div>
                    <div className='rounded-lg mx-5 xl:mx-32 content-body my-5 p-4 bg-white dark:bg-gray-800 dark:text-white shadow-lg'>
                        <h1 className='font-bold text-xl text-blue-500 dark:text-white  lg:text-3xl line-clamp-2 py-2 border-solid border-b-2 border-blue-200'>{product.name}</h1>
                        <div className='grid grid-flow-row grid-cols-12 my-3 gap-0 lg:gap-8 xl:gap-16'>
                            <div className='col-span-12 lg:col-span-3 xl:col-span-4'>
                                <Carousel className='w-full' autoplay autoplaySpeed={2000} dots={false} arrows>
                                    {product.images.map((img, index) => (
                                        <Image
                                            key={index}
                                            src={img}
                                            alt="Product"
                                        />

                                    ))}
                                </Carousel>
                                <div className='mt-10'>
                                    <Progress
                                        type="circle"
                                        className='font-bold dark:text-white'
                                        strokeColor={"#facc15"}
                                        percent={79.42}
                                        format={(percent) => (
                                            <span className="text-black dark:text-white">{percent}%</span>
                                        )}
                                    />
                                    <h2 className='font-bold dark:text-white my-4 text-xl'>Đánh giá</h2>
                                    <Rate className='text-5xl' allowHalf defaultValue={2.5} />
                                </div>


                            </div>
                            <div className='col-span-12 lg:col-span-9 xl:col-span-8'>
                                <h3 className='text-lg dark:text-white  font-semibold '>Thông số sản phẩm:</h3>
                                <ul className='text-stone-800 dark:text-white break-words '>
                                    {
                                        product.other?.map((o, index) => (
                                            <li key={index} className='break-words'>- <span className="uppercase font-semibold">{o.key}</span> : {o.value}</li>
                                        ))
                                    }
                                </ul>
                                <h5>{product.description}</h5>
                                <div className='px-3 my-4 py-2 border-dotted border-2 border-red-300 rounded-xl'>
                                    <div className='md:flex items-end'>
                                        <p className='text-blue-500 dark:text-red-400  inline-block md:block font-bold text-xl md:text-2xl xl:text-4xl'>{(product.newPrice).toLocaleString()} đ</p>
                                        <p className='mb-3 md:mb-0 mx-4 line-through inline-block md:block text-stone-500 text-lg md:text-xl xl:text-2xl font-bold'>{product.oldPrice.toLocaleString()} đ</p>
                                        <Tag className='text-sm font-medium' color="red">Tiết kiệm {(product?.discount).toFixed(0)}%</Tag>
                                    </div>
                                    <div className='bg-red-500 mt-3 text-white py-1 px-2 max-w-max rounded-2xl font-bold text-sm'>Bảo hành theo từng linh kiện</div>
                                </div>
                                <div className='card-gift border-solid border-2 border-red-400 rounded-lg shadow-md'>
                                    <div className='p-2 card-header-gift flex items-center border-b-2 border-solid border-red-100'>
                                        <i className="mr-2 fa-solid text-red-400 fa-gift"></i>
                                        <h2 className="text-red-500 text-lg font-bold">Quà tặng và ưu đãi kèm theo</h2>
                                    </div>
                                    <div className='card-body-gift p-2'>
                                        <h2 className='text-red-600 my-3 font-bold'>ƯU ĐÃI KHI MUA KÈM PC TẠI HOÀNG HÀ PC</h2>
                                        <h2 className='my-3 font-medium'>⭐ Giảm ngay
                                            <span className='text-red-500 font-bold'> 100.000đ</span> khi mua thêm
                                            <span className='text-red-500 font-bold'> Màn Hình Máy Tính.</span>
                                        </h2>
                                        <h2 className='my-3 font-medium'>⭐ Giảm ngay
                                            <span className='text-red-500 font-bold'> 100.000đ </span>
                                            khi mua thêm<span className='text-red-500 font-bold'> RAM</span>
                                        </h2>
                                    </div>
                                </div>
                                <div className='list-btn flex max-w-max mt-10'>
                                    <Button
                                        // onClick={() => handleBuyNow(product)}
                                        className='shadow-xl font-medium sm:font-bold text-sm sm:text-xl bg-red-500 dark:bg-red-600 text-white uppercase py-7 px-3 xl:py-9 lg:px-16 button mr-10'
                                    >
                                        Mua ngay
                                    </Button>
                                    <Button
                                        // onClick={() => addToCart(product)}
                                        className='shadow-xl font-medium sm:font-bold
                                            text-sm sm:text-xl bg-yellow-500 dark:bg-yellow-600 text-white
                                           uppercase py-7 px-3 xl:py-9 lg:px-16 button mr-10'
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className='rounded-lg mx-5 xl:mx-32 content-body my-5 p-4 bg-white dark:bg-gray-800 shadow-lg'>
                        <h1 className='font-bold text-xl text-blue-500 dark:text-white  lg:text-3xl line-clamp-1 py-2 border-solid border-b-2 border-blue-200'>Thông số kỹ thuật</h1>
                        <div className='grid grid-flow-row grid-cols-12 my-3 overflow-x-scroll gap-20 md:gap-10'>
                            <div className='col-span-1 text-sm lg:text-base font-bold'>
                                STT
                            </div>
                            <div className='col-span-2 text-sm lg:text-base dark:text-white  font-bold'>
                                MÃ HÀNG
                            </div>
                            <div className='col-span-5 text-sm lg:text-base dark:text-white  font-bold'>
                                TÊN HÀNG
                            </div>
                            <div className='col-span-4 text-sm lg:text-base dark:text-white  font-bold'>
                                THỜI HẠN BẢO HÀNH
                            </div>

                            <div className='col-span-1 font-semibold dark:text-white'>
                                1
                            </div>
                            <div className='col-span-2 font-semibold dark:text-white'>
                                CPU
                            </div>
                            <div className='col-span-5 font-semibold text-blue-500 dark:text-white '>
                                INTEL CORE i5 12600K up 4.9GHz | 10 CORE | 16 THREAD
                            </div>
                            <div className='col-span-4 font-semibold dark:text-white '>
                                36 THÁNG
                            </div>

                            <div className='col-span-1 font-semibold dark:text-white '>
                                2
                            </div>
                            <div className='col-span-2 font-semibold dark:text-white'>
                                MAIN
                            </div>
                            <div className='col-span-5 font-semibold text-blue-500 dark:text-white '>
                                GIGABYTE B760M GAMING X DDR4
                            </div>
                            <div className='col-span-4 font-semibold dark:text-white '>
                                36 THÁNG
                            </div>

                            <div className='col-span-1 font-semibold dark:text-white '>
                                3
                            </div>
                            <div className='col-span-2 font-semibold dark:text-white '>
                                TẢN NHIỆT
                            </div>
                            <div className='col-span-5 font-semibold text-blue-500 dark:text-white '>
                                JUNGLE LEOPARD KF-400 ARGB
                            </div>
                            <div className='col-span-4 font-semibold dark:text-white '>
                                12 THÁNG
                            </div>

                            <div className='col-span-1 font-semibold dark:text-white '>
                                4
                            </div>
                            <div className='col-span-2 font-semibold dark:text-white '>
                                RAM
                            </div>
                            <div className='col-span-5 font-semibold text-blue-500 dark:text-white v'>
                                DDR4 16GB 3200 MHz (1x16G)
                            </div>
                            <div className='col-span-4 font-semibold dark:text-white '>
                                60 THÁNG
                            </div>

                            <div className='col-span-1 font-semibold dark:text-white '>
                                5
                            </div>
                            <div className='col-span-2 font-semibold dark:text-white '>
                                SSD
                            </div>
                            <div className='col-span-5 font-semibold text-blue-500 dark:text-white '>
                                TEAMGROUP MP33 PRO 512GB M.2 PCIe Gen3x4 - RW 3500MB/s
                            </div>
                            <div className='col-span-4 font-semibold dark:text-white '>
                                60 THÁNG
                            </div>

                            <div className='col-span-1 font-semibold dark:text-white'>
                                6
                            </div>
                            <div className='col-span-2 font-semibold dark:text-white'>
                                VGA
                            </div>
                            <div className='col-span-5 font-semibold text-blue-500 dark:text-white'>

                                GIGABYTE RTX 3060 WINDFORCE OC 12G GDDR6
                            </div>
                            <div className='col-span-4 font-semibold dark:text-white'>
                                36 THÁNG
                            </div>

                            <div className='col-span-1 font-semibold dark:text-white'>
                                7
                            </div>
                            <div className='col-span-2 font-semibold dark:text-white'>
                                PSU
                            </div>
                            <div className='col-span-5 font-semibold text-blue-500 dark:text-white'>
                                FSP650-70ALA 650W - 80 PLUS GOLD
                            </div>
                            <div className='col-span-4 font-semibold dark:text-white'>
                                36 THÁNG
                            </div>

                            <div className='col-span-1 font-semibold dark:text-white'>
                                8
                            </div>
                            <div className='col-span-2 font-semibold dark:text-white'>
                                CASE
                            </div>
                            <div className='col-span-5 font-semibold text-blue-500 dark:text-white'>
                                XIGMATEK GAMING X II 3F - 3FAN RGB
                            </div>
                            <div className='col-span-4 font-semibold dark:text-white'>
                                36 THÁNG
                            </div>

                        </div>
                    </div>
                    <div className='rounded-lg mx-5 my-10 xl:mx-32 content-body py-5 p-4 bg-white dark:bg-gray-800 shadow-lg'>

                        <h1 className='font-bold text-blue-500 dark:text-white text-xl lg:text-3xl line-clamp-1 py-2 border-solid border-b-2 border-blue-200'>Sản phẩm tương tự</h1>
                        <Carousel
                            slidesToShow={5}
                            slidesToScroll={1}
                            draggable
                            className='mt-12  cursor-grab'
                            dots={false}
                            autoplay
                            arrows
                            autoplaySpeed={2000}
                            responsive={responsiveSettings}
                        >
                            {dataProduct && dataProduct.products.length > 0 &&
                                dataProduct.products.map(item => (
                                    <div key={item._id} className='px-1.5 dark:text-white'>
                                        <CardProduct css="" product={item} />
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
