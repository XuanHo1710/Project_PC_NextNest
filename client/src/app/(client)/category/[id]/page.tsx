'use client';
import { Button, Carousel, Checkbox, Drawer, Image } from "antd";
import Link from "next/link";
import { useState } from "react";

export default function CategoryClient() {
    const [isDisplayRow, setDisplayRow] = useState(false);

    const [open, setOpen] = useState(false);

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const prices = [
        {
            label: 'Dưới 10 triệu',
            value: 'price_0-10',
        },
        {
            label: '10 triệu - 15 triệu',
            value: 'price_10-15',
        },
        {
            label: '15 triệu - 20 triệu',
            value: 'price_15-20',
        },
        {
            label: '20 triệu - 25 triệu',
            value: 'price_20-25',
        },
        {
            label: '25 triệu - 30 triệu',
            value: 'price_25-30',
        },
        {
            label: 'Trên 35 triệu',
            value: 'price_35-99999',
        }
    ];

    const cpu = [
        {
            label: 'Intel Core i5',
            value: 'CPU_Core i5',
        },
        {
            label: 'Intel Core i7',
            value: 'CPU_Core i7',
        },
        {
            label: 'Intel Core i9',
            value: 'CPU_Core i9',
        },
        {
            label: 'AMD Ryzen 5',
            value: 'CPU_Ryzen 5',
        },
        {
            label: 'AMD Ryzen 7',
            value: 'CPU_Ryzen 7',
        },
        {
            label: 'AMD Ryzen 9',
            value: 'CPU_Ryzen 9',
        },

    ];

    const ram = [
        {
            label: '16GB',
            value: 'RAM_16GB',
        },
        {
            label: '32GB',
            value: 'RAM_32GB',
        },
        {
            label: '64GB',
            value: 'RAM_64GB',
        },
    ];
    // const { getCategoriesPreview, loading, categoriesPreview } = useCategoryStoreClient();

    // useEffect(() => {
    //     getCategoriesPreview();

    // }, [getCategoriesPreview]);

    // if (loading)
    //     return <>Dang load data....</>
    // else
    //     console.log(categoriesPreview);


    return (
        <>
            <Drawer className='dark:!bg-blue-900 dark:!text-white' title="Bộ lọc sản phẩm" placement='bottom' onClose={onClose} open={open} height={550}>
                <div className='mb-5'>
                    <h3 className='uppercase font-semibold py-3 border-solid border-b-2 border-b-stone-200'>Khoảng giá</h3>
                    <Checkbox.Group className='flex flex-col gap-3 mt-3 font-medium text-black dark:text-white' options={prices} />
                </div>
                <div className='my-5'>
                    <h3 className='uppercase font-semibold py-3 border-solid border-b-2 border-b-stone-200'>CPU</h3>
                    <Checkbox.Group className='flex flex-col gap-3 mt-3 font-medium text-black dark:text-white' options={cpu} />
                </div>
                <div className='my-5'>
                    <h3 className='uppercase font-semibold py-3 border-solid border-b-2 border-b-stone-200'>Ram</h3>
                    <Checkbox.Group className='flex flex-col gap-3 mt-3 font-medium text-black dark:text-white' options={ram} />
                </div>
                <Button
                    //  onClick={handleFilterProduct} 
                    className="uppercase w-full my-3 py-6 border-blue-500 font-bold text-blue-500 button"
                >
                    Lọc sản phẩm
                </Button>
            </Drawer>
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    {/* {categoryTitle !== "" &&
                        <h3 className="font-medium text-lg dark:text-white text-stone-500 mr-3">{categoryTitle}</h3>
                    } */}
                </div>
                <h1 className='mx-5 xl:mx-32 py-2 border-b-blue-400 border-solid border-b-2 md:w-2/3 xl:w-1/3 font-bold text-xl lg:text-3xl uppercase text-blue-500'>PC Render, Edit Video
                    {/* <span className='ml-2 text-sm border-none text-stone-400 lowercase font-medium'>(Tổng {products.length >= 0 && products.length} sản phẩm)</span> */}
                </h1>
                <div className='mx-5 xl:mx-32 mt-5 content-body grid grid-flow-row grid-cols-12 lg:gap-12 '>
                    <div className='hidden lg:block lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-gray-800 shadow-lg max-h-max'>

                        {/* <Button onClick={(e) => handleFilterProduct(e)} className="uppercase w-full my-3 py-6 border-blue-500 font-bold text-blue-500 button">Lọc sản phẩm</Button> */}
                        <div className='my-5'>
                            <h3 className='uppercase font-semibold py-3 border-solid border-b-2 border-b-stone-200'>Khoảng giá</h3>
                            <Checkbox.Group className='flex flex-col gap-3 mt-3 font-medium text-black dark:text-white' options={prices} />
                        </div>
                        <div className='my-5'>
                            <h3 className='uppercase font-semibold py-3 border-solid border-b-2 border-b-stone-200'>CPU</h3>
                            <Checkbox.Group className='flex flex-col gap-3 mt-3 font-medium text-black dark:text-white' options={cpu} />
                        </div>
                        <div className='my-5'>
                            <h3 className='uppercase font-semibold py-3 border-solid border-b-2 border-b-stone-200'>Ram</h3>
                            <Checkbox.Group className='flex flex-col gap-3 mt-3 font-medium text-black dark:text-white' options={ram} />
                        </div>
                    </div>
                    <div className='col-span-12 lg:col-span-9'>
                        <Carousel autoplay arrows autoplaySpeed={2000} dots={false} >
                            <Image
                                src='https://hoanghapccdn.com/media/banner/21_Octa0a03c4c5a78b9ab93161040af23626c.jpg'
                                preview={false}
                                className='rounded w-8'
                                alt="AnhGiangSinh"
                            />
                            <Image
                                src='https://hoanghapccdn.com/media/banner/03_Octa106ef7e66ec2517f963cc37b0691e9d.jpg'
                                preview={false}
                                className='rounded w-8'
                                alt="AnhGiangSinh"
                            />
                            <Image
                                src='https://hoanghapccdn.com/media/banner/21_Octa0a03c4c5a78b9ab93161040af23626c.jpg'
                                preview={false}
                                className='rounded w-8'
                                alt="AnhGiangSinh"
                            />
                        </Carousel>
                        <div className='mt-5 mb-28  shadow-lg px-3 py-5 bg-white dark:bg-gray-800 rounded-md'>
                            <div className='filter-header lg:flex items-center justify-between'>
                                <div className='list-btn'>
                                    {/* <Button onClick={(e) => handleFilter(e, "")} className='button my-1 px-1.5 py-1 md:py-4 md:px-5 border-blue-300 text-blue-500 rounded-2xl mr-2 active font-bold text-base'>Hàng mới</Button>
                                    <Button onClick={(e) => handleFilter(e, "price_1")} className='button my-1 px-1.5 py-1 md:py-4 md:px-5 border-blue-300 text-blue-500 rounded-2xl mr-2 font-bold text-base'>Giá tăng dần</Button>
                                    <Button onClick={(e) => handleFilter(e, "price_-1")} className='button my-1 px-1.5 py-1 md:py-4 md:px-5 border-blue-300 text-blue-500 rounded-2xl mr-2 font-bold text-base'>Giá giảm dần</Button>
                                    <Button onClick={(e) => handleFilter(e, "title_1")} className='button my-1 px-1.5 py-1 md:py-4 md:px-5 border-blue-300 text-blue-500 rounded-2xl mr-2 font-bold text-base'>A đến Z</Button> */}
                                </div>
                                <div className='type-bar flex items-center justify-between text-right my-5 md:my-0 text-2xl'>
                                    <div onClick={showDrawer} className='py-2 cursor-pointer px-4 rounded-2xl lg:hidden text-base bg-blue-100 text-blue-500'>Bộ lọc
                                        <i className="ml-2 fa-solid fa-filter"></i>
                                    </div>
                                    <div>
                                        <i onClick={() => setDisplayRow(false)} className={"fa-solid text-stone-400 cursor-pointer fa-table-cells-large mr-5 hover:text-blue-500 " + (isDisplayRow === false ? "active" : "")}></i>
                                        <i onClick={() => setDisplayRow(true)} className={"fa-solid text-stone-400 cursor-pointer fa-list hover:text-blue-500 " + (isDisplayRow === true ? "active" : "")}></i>
                                    </div>
                                </div>
                            </div>
                            {isDisplayRow ?
                                <div className='content-list-product-row mt-6 '>
                                    {/* {products.length > 0 ?
                                        products.map(product => (
                                            <div key={product._id} className='my-2 p-3.5 border-solid border-2 border-stone-100 dark:border-stone-800'>
                                                <div className='card rounded-lg dark:bg-gray-800 bg-white flex' >
                                                    <div className='card-img w-1/3 md:w-1/5 hover:-translate-y-2 transition-all'>
                                                        <Image
                                                            preview={false}
                                                            src="https://hoanghapccdn.com/media/product/250_4429_hhpc_white_13900k_sky_two_ha1s.jpg"
                                                        />
                                                    </div>
                                                    <div className='card-content ml-1 w-2/3 md:w-4/5 relative'>
                                                        <Link to={`/product/${product.slug}`}>
                                                            <h2 className='font-medium absolute top-0 left-0 right-0 cursor-pointer hover:text-blue-500 text-sm md:text-base line-clamp-1 md:line-clamp-2'>
                                                                {product?.title}
                                                            </h2>
                                                        </Link>
                                                        <div className='absolute bottom-1/3 left-0 right-0'>
                                                            <h2 className='font-bold cursor-default text-lg md:text-xl my-1 text-blue-500'>
                                                                {(product?.price * (1 - product?.discount)).toLocaleString()} đ
                                                            </h2>
                                                            <div className='font-medium cursor-default text-xs md:text-lg my-1 '>
                                                                <span className='line-through text-slate-400 mr-2'>{product?.price.toLocaleString()} đ</span>
                                                                <span className='text-red-500'>(Tiết kiệm {(product?.discount * 100).toFixed(0)}%)</span>
                                                            </div>
                                                        </div>
                                                        <div className='card-footer absolute bottom-0 left-0 right-0 flex item-center justify-between'>
                                                            <div className='status flex text-xs md:text-base cursor-default'>
                                                                <div className='flex items-center text-green-600'>
                                                                    <i className="fa-regular fa-circle-check mr-2"></i>
                                                                    <p className='hidden sm:block'>Còn hàng</p>
                                                                </div>
                                                                <div className='flex mx-4 text-stone-500 items-center'>
                                                                    <i className="fa-solid fa-gift mr-2"></i>
                                                                    <p className='hidden sm:block'>Quà tặng</p>
                                                                </div>
                                                            </div>
                                                            <div onClick={() => addToCart(product)} className='text-base cart-icon py-2 flex  items-center px-6 cursor-pointer hover:text-white'>
                                                                <i className="fa-solid fa-cart-shopping"></i>
                                                                <p className='hidden md:block ml-3 relative font-semibold -top-0.5'>Thêm vào giỏ</p>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        )) :
                                        <div className='text-center py-32 col-span-12'>
                                            <Spin className='text-center' size="large"></Spin>
                                        </div>
                                    } */}
                                </div>
                                :
                                <div className='content-list-product-col grid grid-flow-row grid-cols-12 gap-0.5 md:gap-2 mt-6 '>
                                    {/* {products.length > 0 ?
                                        products.map(product => (
                                            <div key={product._id} className=' col-span-6 lg:col-span-3 p-1 border-solid border-2 dark:border-stone-900 border-stone-100'>
                                                <CardProduct data={product} />
                                            </div>
                                        )) :
                                        <div className='text-center py-32 col-span-12'>
                                            <Spin className='text-center' size="large"></Spin>
                                        </div>
                                    } */}
                                </div>
                            }

                            {/* {pagination?.totalPage &&
                                <div className='pagination mt-4 flex gap-2 items-center justify-end'>
                                    <Button onClick={(e) => handlePagination(e, 1)} className='py-5 active button font-bold border-blue-400'>1</Button>
                                    {totalPage.map((index) => (
                                        <Button key={index} onClick={(e) => handlePagination(e, index + 1)} className='py-5 button font-bold border-blue-400'>{index + 1}</Button>
                                    ))}
                                </div>
                            } */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
