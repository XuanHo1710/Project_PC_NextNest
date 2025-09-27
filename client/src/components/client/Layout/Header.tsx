"use client";
import { IoIosArrowDown } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Badge, Button, Divider, Form, Image, Input, Modal, Spin } from "antd";
import { BiCategory } from "react-icons/bi";
import { MdOutlineNotListedLocation } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { FaStore } from "react-icons/fa";
import { IoDocumentOutline } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import Marquee from "react-fast-marquee";
import { MdOutlineSearch } from "react-icons/md";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ICategory } from "@/types/modal.d";
import { categoryClientService, productClientService } from "@/services/client";
import { buildCategoryTree } from "@/utils/buildTree";
import { IProductCard } from "@/types/model.client.d";
import useCartStore from "@/hooks/useCart";


export default function HeaderClient() {
    const [isOpenCategory, setOpenCategory] = useState<boolean>(false);
    const [isOpenItemCategory, setOpenItemCategory] = useState<boolean>(false);
    const [isOpenCart, setOpenCart] = useState<boolean>(false);
    const [isOpenSearch, setOpenSearch] = useState<boolean>(false);
    const [isOpenModalLogin, setOpenModalLogin] = useState<boolean>(false);
    const [categories, setCategories] = useState<ICategory[] | []>([]);
    const [childrenCategories, setChildrenCategories] = useState<ICategory[] | []>([]);

    const [search, setSearch] = useState("");

    const { cart, updateQuantity, removeFromCart, calculateTotal } = useCartStore();

    const { data, isLoading } = useQuery<ICategory[] | []>({
        queryKey: ['categories'], // key để cache
        queryFn: () => categoryClientService.getAllCategories(),
        staleTime: 1000 * 60 * 5, // 5 phút cache không gọi lại
    });

    const { data: products, isLoading: loadingSearch } = useQuery<IProductCard[] | []>({
        queryKey: ['product-search', search], // key để cache
        queryFn: () => productClientService.searchProducts(search),
        enabled: !!search
    });


    useEffect(() => {
        if (data && !isLoading) {
            setCategories(buildCategoryTree(data));
        }
    }, [data, isLoading]); // chỉ chạy khi data thay đổi


    const handleHoverCategory = (children: ICategory[]) => {
        setChildrenCategories(children)
        setOpenItemCategory(true);
    }

    const handleOnChange = (value: string) => {
        if (value.trim() === "")
            setOpenSearch(false)
        else {
            setOpenSearch(true);
            setSearch(value);
        }
    }


    const renderCategoryGrid = (categories: ICategory[], colSpan = 2) => {
        return categories.map((cat) => (
            <div key={cat._id} className={`col-span-${colSpan} flex flex-col gap-2`}>
                <Link
                    onClick={() => {
                        setOpenItemCategory(false);
                        setOpenCategory(false)
                    }}
                    href={"/category/" + cat._id}
                    className="font-semibold"
                >
                    {cat.name}
                </Link>
                {cat.children && cat.children.length > 0 && (
                    <div className="flex flex-col gap-1">
                        {cat.children.map((child) => (
                            <Link
                                onClick={() => {
                                    setOpenItemCategory(false);
                                    setOpenCategory(false)
                                }}
                                href={"/category/" + child._id}
                                key={child._id}
                                className="text-sm hover:text-blue-500 cursor-pointer"
                            >
                                {child.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        ));
    };


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
                                <div className="w-60 max-h-[520px] min-h-min overflow-sc z-40 absolute top-12 right-0 bg-white border border-slate-200 shadow-2xl rounded-xl">
                                    <ul className="text-sm">
                                        {categories.map((category, index) => {
                                            const isFirst = index === 0;
                                            const isLast = index === categories.length - 1;
                                            return (
                                                <li
                                                    key={category._id}
                                                    onMouseEnter={() => handleHoverCategory(category.children as ICategory[])}
                                                    className={`text-base font-semibold px-4 py-2 hover:bg-blue-400 hover:text-white justify-between cursor-pointer flex items-center gap-2 ${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''}`}
                                                >
                                                    {category.name} <MdKeyboardArrowRight className="text-xl" />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </>
                        }
                    </div>
                    {isOpenCategory && isOpenItemCategory
                        &&
                        <div className="z-40 absolute w-8/12 h-80 grid grid-flow-row grid-cols-12 top-12.5 p-5 text-base right-11 bg-white border border-slate-200 shadow-2xl rounded-md">
                            {childrenCategories.length > 0 && (
                                renderCategoryGrid(childrenCategories, 3) // mỗi category con chiếm 2 cột
                            )
                            }
                        </div>
                    }

                    <button className="button-primary"><MdOutlineNotListedLocation /> Hồ Chí Minh <IoIosArrowDown /></button>
                    <div className="w-80 relative">
                        <Input value={search} onChange={(e) => handleOnChange(e.target.value)} placeholder="Bạn muốn mua gì ngày hôm nay" className="!py-2 !px-4 font-semibold text-xl" />
                        <MdOutlineSearch className="absolute right-3 text-xl top-1/4" />

                        {/* Search */}
                        {isOpenSearch &&
                            <div style={{ scrollbarWidth: "none" }} className="z-20 absolute grid-row top-full w-[500px] rounded-lg right-0 min-h-52 max-h-64 bg-white overflow-y-scroll">
                                {loadingSearch ? (
                                    <div className="flex !flex-1 items-center justify-center !min-w-[500px] min-h-[200px]">
                                        <Spin size="large" className="!flex !flex-1 !justify-center !items-center !w-full" />
                                    </div>
                                ) : (
                                    products && products.length > 0 ?
                                        products.map(p => (
                                            <div
                                                key={p._id}
                                                className="col-span-12 h-28 flex gap-4 py-2 px-4 border-b hover:bg-gray-50 transition rounded-lg cursor-pointer"
                                            >
                                                <div className="flex max-w-max justify-center flex-1 flex-col">
                                                    <Image
                                                        src={p.images[0]}
                                                        alt={p.name}
                                                        width={80}
                                                        height={80}
                                                        className="object-cover rounded-md border"
                                                    />
                                                </div>
                                                <div className="flex justify-between flex-col flex-1">
                                                    <div>
                                                        <Link onClick={() => {
                                                            setSearch("");
                                                            setOpenSearch(false);
                                                        }} href={"/product/" + p._id} className="font-semibold text-gray-800 truncate">{p.name}</Link>
                                                        <p className="text-sm line-clamp-1">{p.description}</p>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <div className="flex gap-5">
                                                            <p className="text-blue-600 font-bold">{p.newPrice.toLocaleString()}đ</p>
                                                            <p className="text-stone-300 line-through">{p.oldPrice.toLocaleString()}đ</p>
                                                        </div>
                                                        <Badge
                                                            count={`${p.discount}% OFF`}
                                                            style={{
                                                                backgroundColor: "#f5222d",
                                                                color: "#fff",
                                                                fontWeight: "bold",
                                                                fontSize: "12px",
                                                                padding: "0 6px",
                                                                borderRadius: "6px",
                                                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )) :
                                        (
                                            <div className="col-span-12 flex flex-col items-center justify-center py-2 text-center text-gray-500">
                                                <Image
                                                    src="https://citroen.navigation.com/static/WFS/Shop-CitroenEMEA-Site/-/Shop-CitroenEMEA/en_GB/Product%20Not%20Found.png" // bạn có thể thêm hình minh họa rỗng
                                                    alt="Not Found"
                                                    className="mb-4"
                                                    width={250}
                                                    preview={false}
                                                />
                                                <p className="text-lg font-semibold">Không tìm thấy sản phẩm nào</p>
                                                <p className="text-sm">Hãy thử tìm kiếm với từ khóa khác.</p>
                                            </div>
                                        )
                                )}


                            </div>
                        }
                    </div>

                    {/* Cart item */}
                    <div className="relative">
                        <button onClick={() => setOpenCart(!isOpenCart)} className="button-primary">Giỏ hàng <MdOutlineShoppingCart /></button>
                        {isOpenCart &&
                            <div className='dark:bg-gray-700 bg-white shadow-2xl z-30 min-h-36 -right-2/3 md:right-0 rounded-xl absolute top-12 w-[500px]'>
                                <div className='cart-header py-3 border-solid border-b-[1px] border-stone-100  dark:border-black
                            uppercase text-center text-xl font-medium dark:text-white'>
                                    Giỏ hàng
                                </div>
                                {cart && cart?.cartItems?.length <= 0 ?
                                    <div className='dark:text-white cart-body flex flex-col items-center py-5' >
                                        <i className="fa-solid fa-cart-shopping text-6xl"></i>
                                        <p>Hiện chưa có sản phẩm</p>
                                    </div> :
                                    <div className="cart-product-list cart-body max-h-80 overflow-y-scroll " style={{ scrollbarWidth: "none" }}>
                                        {cart && cart.cartItems.map((c, index) => (
                                            <div key={index} className='flex items-center border-solid dark:border-0 border-[1px] dark:border-y-black  border-y-stone-100 justify-between py-2 px-3'>
                                                <div className='basis-1/6 h-20'>
                                                    <Image alt="logo" src={c.product.images[0]} />
                                                </div>
                                                <div className='basis-5/6 cart-product-content dark:text-blue-100'>
                                                    <div className='flex justify-between'>
                                                        <Link href={"/product/" + c.product._id}>
                                                            <h2 className='hover:text-blue-500 font-semibold text-sm line-clamp-2 px-4'>
                                                                {c.product.name}
                                                            </h2>
                                                        </Link>
                                                        <i
                                                            onClick={() => removeFromCart(c.product._id)}
                                                            className="fa-solid fa-xmark cursor-pointer hover:text-red-600 relative top-1"
                                                        ></i>
                                                    </div>
                                                    <div className='flex justify-between pl-4 mt-3 items-center'>
                                                        <div className='flex items-center dark:bg-black'>
                                                            <Button
                                                                onClick={() => updateQuantity(c.product._id, -1)}
                                                                className='rounded-none px-3 dark:bg-black dark:text-white dark:border-slate-700'
                                                            >
                                                                <i className="fa-solid fa-minus"></i>
                                                            </Button>
                                                            <input
                                                                type='text'
                                                                className='bg-white dark:bg-black w-8 text-center h-8 border-solid'
                                                                disabled
                                                                value={c.quantity}
                                                            />
                                                            <Button
                                                                onClick={() => updateQuantity(c.product._id, 1)}
                                                                className='rounded-none px-3 dark:bg-black dark:text-white dark:border-slate-700'
                                                            >
                                                                <i className="fa-solid fa-plus"></i>
                                                            </Button>
                                                        </div>
                                                        <p className='font-semibold text-red-500'>
                                                            {c.price.toLocaleString()} đ
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                }
                                <div className='cart-footer py-3 border-solid border-t-[1px] dark:border-black border-stone-100 flex items-center justify-between px-3 font-normal text-base'>
                                    <p className='uppercase font-semibold dark:text-blue-100'>Tổng tiền:</p>
                                    <p className='text-blue-500 font-semibold text-lg'>
                                        {calculateTotal().toLocaleString()} đ
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
            </header >
        </>
    )
}