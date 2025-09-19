"use client";
import { IoIosArrowDown } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Button, Divider, Form, Image, Input, Modal } from "antd";
import { BiCategory } from "react-icons/bi";
import { MdOutlineNotListedLocation } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { FaStore } from "react-icons/fa";
import { IoDocumentOutline } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import Marquee from "react-fast-marquee";
import { MdOutlineSearch } from "react-icons/md";
import { useState } from "react";
import Link from "next/link";


export default function HeaderClient() {
    const [isOpenCategory, setOpenCategory] = useState<boolean>(false);
    const [isOpenItemCategory, setOpenItemCategory] = useState<boolean>(false);
    const [isOpenCart, setOpenCart] = useState<boolean>(false);
    const [isOpenSearch, setOpenSearch] = useState<boolean>(false);
    const [isOpenModalLogin, setOpenModalLogin] = useState<boolean>(false);

    const handleHoverCategory = () => {
        console.log("Hover category");
        setOpenItemCategory(true);
    }

    const handleOnChange = (value: string) => {
        if (value.trim() === "")
            setOpenSearch(false)
        else setOpenSearch(true)
    }
    return (
        <>
            {isOpenModalLogin &&
                <Modal
                    open={isOpenModalLogin}
                    onClose={() => setOpenModalLogin(false)}
                    onCancel={() => setOpenModalLogin(false)}
                    title={<h2 className="text-xl font-bold">Đăng nhập</h2>}
                    footer={[]}
                >
                    <p className="mb-5">Nhập email và mật khẩu để truy cập vào tài khoản của bạn</p>

                    <Form>
                        <Form.Item className="!my-2" name="email" >
                            <label className="font-semibold" htmlFor="email">Email</label>
                            <Input className="!py-2 !mt-3" name="email" id="email" placeholder="Nhập email" />
                        </Form.Item>
                        <Form.Item name="password" >
                            <label className="font-semibold" htmlFor="password">Mật khẩu</label>
                            <Input.Password className="!py-2 !mt-3" id="password" name="password" placeholder="Nhập mật khẩu" />
                        </Form.Item>
                        <button className="button-primary !bg-blue-500 font-semibold py-3 w-full">
                            Đăng nhập
                        </button>
                    </Form>
                    <div className="text-right my-2">
                        <Link href={"/forgot-password"}>Quên mật khẩu?</Link>
                    </div>
                    <Divider style={{ borderColor: "#c9c9c9" }} plain>hoặc đăng nhập bằng</Divider>
                    <button className="border button-outline text-black hover:bg-blue-500 hover:text-white py-3 w-full font-semibold">
                        <Image preview={false} width={25} alt="gg" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png" />
                        Đăng nhập với Google
                    </button>

                    <p className="text-center mt-4">Bạn chưa có tài khoản? <Link href={"/register"} >Đăng ký ngay !</Link></p>



                </Modal>
            }

            <header className="fixed px-32 z-50 pb-4 left-0 right-0 top-0 bg-blue-400">
                <div className="flex justify-center py-2.5 ">
                    <Marquee className="flex-1 text-xs font-semibold text-white" speed={50} gradient={false}>
                        🔄 Thu cũ giá ngon - Lên đời tiết kiệm ✅ Sản phẩm Chính hãng - Xuất VAT đầy đủ 🚚 Giao nhanh - Miễn phí cho đơn 300k
                    </Marquee>
                    <h5 className="header-item text-white"><FaStore /> Cửa hàng gần bạn</h5>
                    <h5 className="header-item text-white"><IoDocumentOutline /> Tra cứu đơn hàng</h5>
                    <h5 className="header-item text-white"><FaPhoneAlt /> 1800 2097</h5>
                </div>
                <div className="relative flex gap-5 py-1 items-center justify-center">
                    <h2 className="font-bold text-white text-2xl">Hoàng Hà PC</h2>
                    <div className="relative">
                        <button onClick={() => {
                            setOpenCategory(!isOpenCategory);
                            setOpenItemCategory(false)
                        }} className="button-primary"><BiCategory /> Danh mục <IoIosArrowDown /></button>
                        {isOpenCategory &&
                            <>
                                <div className="w-60 z-40 absolute top-12 right-0 bg-white border border-slate-200 shadow-2xl rounded-xl">
                                    <ul className="text-sm">
                                        <li onMouseEnter={handleHoverCategory} className="px-4 py-2 hover:bg-blue-400 hover:text-white justify-between cursor-pointer flex items-center gap-2 rounded-t-xl">
                                            📱 Điện thoại, Tablet <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2">
                                            💻 Laptop <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2">
                                            🎧 Âm thanh, Mic thu âm <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2">
                                            ⌚ Đồng hồ, Camera <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2">
                                            🏠 Đồ gia dụng <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2">
                                            🔌 Phụ kiện <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2">
                                            🖥️ PC, Màn hình, Máy in <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2">
                                            📺 Tivi <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2">
                                            🔄 Thu cũ đổi mới <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2">
                                            📦 Hàng cũ <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2">
                                            🎁 Khuyến mãi <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                        <li className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer justify-between flex items-center gap-2 rounded-b-xl">
                                            📰 Tin công nghệ <MdKeyboardArrowRight className="text-xl" />
                                        </li>
                                    </ul>
                                </div>
                            </>
                        }
                    </div>
                    {isOpenCategory && isOpenItemCategory
                        &&
                        <div className="z-40 absolute w-8/12 h-80 grid grid-flow-row grid-cols-12 top-12.5 p-3 text-base right-11 bg-white border border-slate-200 shadow-2xl rounded-md">
                            <h2 className="col-span-2">Hello serlvet</h2>
                            <h3 className="col-span-2">I don;t know what do you talkin</h3>
                        </div>
                    }

                    <button className="button-primary"><MdOutlineNotListedLocation /> Hồ Chí Minh <IoIosArrowDown /></button>
                    <div className="w-80 relative">
                        <Input onChange={(e) => handleOnChange(e.target.value)} placeholder="Bạn muốn mua gì ngày hôm nay" className="!py-2 !px-4 font-semibold text-xl" />
                        <MdOutlineSearch className="absolute right-3 text-xl top-1/4" />

                        {/* Search */}
                        {isOpenSearch &&
                            <div style={{ scrollbarWidth: "none" }} className="z-20 absolute grid-row top-full w-[500px] rounded-lg right-0 min-h-52 max-h-64 bg-white overflow-y-scroll">
                                <div className="col-span-12 h-28 flex gap-10 py-2 px-4 border-b-2">
                                    <h2>IMG</h2>
                                    <div className="flex flex-col justify-between">
                                        <h2>Ban hang pc .com</h2>
                                        <div>
                                            <p>12.000.000d</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-12 h-28 flex gap-10 py-2 px-4 border-b-2">
                                    <h2>IMG</h2>
                                    <div className="flex flex-col justify-between">
                                        <h2>Ban hang pc .com</h2>
                                        <div>
                                            <p>12.000.000d</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-12 h-28 flex gap-10 py-2 px-4 border-b-2">
                                    <h2>IMG</h2>
                                    <div className="flex flex-col justify-between">
                                        <h2>Ban hang pc .com</h2>
                                        <div>
                                            <p>12.000.000d</p>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        }
                    </div>

                    {/* Cart item */}
                    <div className="relative">
                        <button onClick={() => setOpenCart(!isOpenCart)} className="button-primary">Giỏ hàng <MdOutlineShoppingCart /></button>
                        {isOpenCart &&
                            <div className='dark:bg-gray-700 bg-white shadow-2xl z-30 min-h-36 -right-2/3 md:right-0 rounded-xl absolute top-12 w-[500px]'>
                                <div className='cart-header py-3 border-solid border-b-2 border-stone-200  dark:border-black
                            uppercase text-center text-xl font-medium dark:text-white'>
                                    Giỏ hàng
                                </div>
                                {/* {carts.length <= 0 ? */}
                                {/* //  Chưa có sản phẩm trong giỏ hàng !!  */}
                                {/* <div className='dark:text-white cart-body flex flex-col items-center py-5'>
                                    <i className="fa-solid fa-cart-shopping text-6xl"></i>
                                    <p>Hiện chưa có sản phẩm</p>
                                </div> : */}
                                {/* //  Có sản phẩm trong giỏ hàng  */}
                                <div className="cart-product-list cart-body max-h-80 overflow-y-scroll " style={{ scrollbarWidth: "none" }}>
                                    {/* {carts.map(cart => ( */}
                                    <div className='flex items-center border-solid dark:border-0 border-2 dark:border-y-black  border-y-stone-200 justify-between py-2 px-3'>
                                        <div className='basis-1/6 h-20'>
                                            <Image alt="logo" src="https://hoanghapccdn.com/media/product/250_4429_hhpc_white_13900k_sky_two_ha1s.jpg" />
                                        </div>
                                        <div className='basis-5/6 cart-product-content dark:text-blue-100'>
                                            <div className='flex justify-between'>
                                                <Link href={"/"}>
                                                    <h2 className='hover:text-blue-500 font-semibold text-sm line-clamp-2 px-4'>
                                                        {/* {cart.title} */}
                                                    </h2>
                                                </Link>
                                                <i
                                                    // onClick={() => removeCart(cart._id)} 
                                                    className="fa-solid fa-xmark cursor-pointer hover:text-red-600 relative top-1"
                                                ></i>
                                            </div>
                                            <div className='flex justify-between pl-4 mt-3 items-center'>
                                                <div className='flex items-center dark:bg-black'>
                                                    <Button
                                                        //  onClick={() => decrease(cart._id)} 
                                                        className='rounded-none px-3 dark:bg-black dark:text-white dark:border-slate-700'
                                                    >
                                                        <i className="fa-solid fa-minus"></i>
                                                    </Button>
                                                    <input type='text' value={1} className='bg-white dark:bg-black w-8 text-center h-8 border-solid' disabled
                                                    // value={cart.quanlity}
                                                    />
                                                    <Button
                                                        // onClick={() => increase(cart._id)} 
                                                        className='rounded-none px-3 dark:bg-black dark:text-white dark:border-slate-700'
                                                    >
                                                        <i className="fa-solid fa-plus"></i>
                                                    </Button>
                                                </div>
                                                <p className='font-semibold text-red-500'>
                                                    {/* {cart.unitPrice.toLocaleString()} đ */}
                                                    23.000.000 đ
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* ))} */}
                                </div>

                                {/* } */}
                                <div className='cart-footer py-3 border-solid border-t-2 dark:border-black border-stone-300 flex items-center justify-between px-3 font-normal text-base'>
                                    <p className='uppercase font-semibold dark:text-blue-100'>Tổng tiền:</p>
                                    <p className='text-blue-500 font-semibold text-lg'>
                                        {/* {getTotalUnitPrice().toLocaleString()} đ */}
                                        12.000.000 đ
                                    </p>
                                </div>
                                <Link
                                    onClick={() => setOpenCart(false)}
                                    href={"/cart"}
                                    style={{ width: "95%" }}
                                    className='block py-2 text-center rounded-xl mb-5 text-white font-medium dark:bg-blue-500 bg-blue-400 mx-3'
                                >
                                    XEM GIỎ HÀNG
                                </Link>
                            </div>
                        }
                    </div>

                    <button onClick={() => setOpenModalLogin(true)} className="button-primary">Đăng nhập <FaRegUserCircle /></button>
                </div>
            </header>
        </>
    )
}