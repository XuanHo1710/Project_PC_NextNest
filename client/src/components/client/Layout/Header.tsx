"use client";
import { IoIosArrowDown } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Badge, Button, Image, Input, Spin } from "antd";
import { BiCategory } from "react-icons/bi";
import { MdOutlineNotListedLocation } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegUserCircle, FaUserPlus } from "react-icons/fa";
import { FaStore } from "react-icons/fa";
import { IoDocumentOutline } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import Marquee from "react-fast-marquee";
import { MdOutlineSearch } from "react-icons/md";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ICategory } from "@/types/category";
import { categoryClientService, productClientService } from "@/services/client";
import { IProductCard } from "@/types/product";
import useCartStore from "@/hooks/useCart";
import { getProductImage } from "@/utils/productHelpers";
import { LoginModal, RegisterModal } from "@/components/client/Auth";
import { Dropdown, Avatar } from "antd";
import type { MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, PicRightOutlined, CloudSyncOutlined, CarFilled, ShopOutlined } from '@ant-design/icons';
import useAuthUser from "@/hooks/useAuthUser";


export default function HeaderClient() {
    const router = useRouter();
    const [isOpenCategory, setOpenCategory] = useState<boolean>(false);
    const [isOpenItemCategory, setOpenItemCategory] = useState<boolean>(false);
    const [isOpenCart, setOpenCart] = useState<boolean>(false);
    const [isOpenSearch, setOpenSearch] = useState<boolean>(false);
    const [isOpenModalLogin, setOpenModalLogin] = useState<boolean>(false);
    const [isOpenModalRegister, setOpenModalRegister] = useState<boolean>(false);
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
            setCategories(data);

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
        }
        setSearch(value);
    }

    const handleSearchNavigate = () => {
        if (search.trim()) {
            setOpenSearch(false);
            router.push(`/search?q=${encodeURIComponent(search.trim())}`);
        }
    }

    const handleOpenLogin = () => {
        setOpenModalLogin(true);
        setOpenModalRegister(false);
    }

    const handleOpenRegister = () => {
        setOpenModalRegister(true);
        setOpenModalLogin(false);
    }

    const handleCloseModals = () => {
        setOpenModalLogin(false);
        setOpenModalRegister(false);
    }

    const renderCategoryGrid = (categories: ICategory[], colSpan = 2) => {
        return categories.map((cat) => (
            <div key={cat._id} className={`col-span-${colSpan} flex flex-col gap-3`}>
                <Link
                    onClick={() => {
                        setOpenItemCategory(false);
                        setOpenCategory(false)
                    }}
                    href={"/collection/" + cat.slug}
                    className="font-semibold"
                >
                    {cat.name}
                </Link>
                {cat.children && cat.children.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {cat.children.map((child) => (
                            <Link
                                onClick={() => {
                                    setOpenItemCategory(false);
                                    setOpenCategory(false)
                                }}
                                href={"/collection/" + child.slug}
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
            {/* Login Modal */}
            <LoginModal
                isOpen={isOpenModalLogin}
                onClose={handleCloseModals}
                switchToRegister={handleOpenRegister}
            />

            {/* Register Modal */}
            <RegisterModal
                isOpen={isOpenModalRegister}
                onClose={handleCloseModals}
                switchToLogin={handleOpenLogin}
            />

            <header className="fixed w-full z-50 left-0 right-0 top-0 bg-[#3b82f6]">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between py-2 border-b border-blue-300">
                        <Marquee className="flex-1 text-xs font-semibold text-white" speed={50} gradient={false}>
                            🔄 Thu cũ giá ngon - Lên đời tiết kiệm ✅ Sản phẩm Chính hãng - Xuất VAT đầy đủ 🚚 Giao nhanh - Miễn phí cho đơn 300k
                        </Marquee>
                        <div className="flex items-center">
                            <h5 className="header-item text-white"><FaStore /> Cửa hàng gần bạn</h5>
                            <h5 className="header-item text-white"><IoDocumentOutline /> Tra cứu đơn hàng</h5>
                            <h5 className="header-item text-white"><FaPhoneAlt /> 1800 2097</h5>
                        </div>
                    </div>

                    {/* Main Header */}
                    <div className="flex items-center gap-4 py-3">
                        {/* Logo */}
                        <h2 className="font-bold text-white text-2xl whitespace-nowrap">Arisu</h2>

                        {/* Category Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setOpenCategory(!isOpenCategory);
                                    setOpenItemCategory(false)
                                }}
                                className="flex items-center gap-2 bg-white cursor-pointer text-[#3b82f6] font-medium px-4 py-2 rounded-md transition-all whitespace-nowrap"
                            >
                                <BiCategory className="text-lg" />
                                <span>Danh mục</span>
                                <IoIosArrowDown className="text-sm" />
                            </button>

                            {isOpenCategory && (
                                <div style={{ scrollbarWidth: "none" }} className="w-60 max-h-[550px] min-h-[550px] overflow-auto z-40 absolute top-12 left-0 bg-white border border-slate-200 shadow-2xl rounded-xl">
                                    <ul className="text-sm">
                                        {categories.map((category, index) => {
                                            const isFirst = index === 0;
                                            const isLast = index === categories.length - 1;
                                            return (
                                                <li
                                                    key={category._id}
                                                    onMouseEnter={() => handleHoverCategory(category.children as ICategory[])}
                                                    className={`text-sm font-medium px-4 py-2 hover:bg-blue-400 hover:text-white justify-between cursor-pointer flex items-center gap-2 ${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''}`}
                                                >
                                                    {category.name} <MdKeyboardArrowRight className="text-base" />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {isOpenCategory && isOpenItemCategory && (
                                <div style={{ scrollbarWidth: "none" }} className="z-40 gap-5 absolute w-[900px] max-h-[500px] min-h-[500px] overflow-auto grid grid-flow-row grid-cols-12 top-12 left-64 p-5 text-base bg-white border border-slate-200 shadow-2xl rounded-md">
                                    {childrenCategories.length > 0 && renderCategoryGrid(childrenCategories, 3)}
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <button className="flex items-center gap-2 cursor-pointer bg-white text-[#3b82f6] font-medium px-4 py-2 rounded-md transition-all whitespace-nowrap">
                            <MdOutlineNotListedLocation />
                            <span>Hồ Chí Minh</span>
                            <IoIosArrowDown className="text-sm" />
                        </button>

                        {/* Search Bar */}
                        <div className="flex-grow relative">
                            <Input
                                value={search}
                                onChange={(e) => handleOnChange(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSearchNavigate(); }}
                                placeholder="Bạn muốn mua gì ngày hôm nay"
                                className="!py-2 !px-4 rounded-md w-full"
                                suffix={<MdOutlineSearch className="text-xl text-gray-400 cursor-pointer hover:text-blue-500" onClick={handleSearchNavigate} />}
                            />

                            {/* Search Results */}
                            {isOpenSearch && (
                                <div style={{ scrollbarWidth: "none" }} className="z-20 absolute grid-row top-full w-[500px] rounded-lg left-0 mt-1 min-h-52 max-h-64 bg-white overflow-y-scroll shadow-lg border border-gray-200">
                                    {loadingSearch ? (
                                        <div className="flex items-center justify-center min-h-[200px] min-w-[500px]">
                                            <Spin size="large" />
                                        </div>
                                    ) : (
                                        products && products.length > 0 ? (
                                            products.map((p: IProductCard) => (
                                                <div
                                                    key={p._id}
                                                    className="col-span-12 h-28 flex gap-4 py-2 px-4 border-b hover:bg-gray-50 transition rounded-lg cursor-pointer"
                                                >
                                                    <div className="flex max-w-max justify-center flex-1 flex-col">
                                                        <Image
                                                            src={p.defaultVariant.images?.[0] || undefined}
                                                            alt={p.name}
                                                            width={80}
                                                            height={80}
                                                            className="object-cover rounded-md border"
                                                        />
                                                    </div>
                                                    <div className="flex justify-between flex-col flex-1 overflow-hidden">
                                                        <div>
                                                            <Link onClick={() => {
                                                                setSearch("");
                                                                setOpenSearch(false);
                                                            }} href={"/product/" + p.slug} className="font-semibold line-clamp-2 text-wrap text-gray-800 truncate">{p.name}</Link>
                                                            <p className="text-sm line-clamp-1">{p.description}</p>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <div className="flex gap-5">
                                                                <p className="text-blue-600 font-bold">{(p.defaultVariant.price * (1 - p.defaultVariant.discount / 100)).toLocaleString()}đ</p>
                                                                <p className="text-stone-300 line-through">{p.defaultVariant.price.toLocaleString()}đ</p>
                                                            </div>
                                                            <Badge
                                                                count={`${p.defaultVariant.discount}% OFF`}
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
                                            ))
                                        ) : (
                                            <div className="col-span-12 flex flex-col items-center justify-center py-4 text-center text-gray-500">
                                                <Image
                                                    src="https://stores.lifestylestores.com/VendorpageTheme/Enterprise/EThemeForLifestyleUpdated/images/product-not-found.jpg"
                                                    alt="Not Found"
                                                    className="mb-4"
                                                    width={150}
                                                    preview={false}
                                                />
                                                <p className="text-lg font-semibold">Không tìm thấy sản phẩm nào</p>
                                                <p className="text-sm">Hãy thử tìm kiếm với từ khóa khác.</p>
                                            </div>
                                        )
                                    )}
                                    {/* Xem tất cả kết quả */}
                                    {products && products.length > 0 && (
                                        <Link
                                            href={`/search?q=${encodeURIComponent(search)}`}
                                            onClick={() => { setOpenSearch(false); }}
                                            className="block text-center py-3 text-sm font-semibold text-blue-500 hover:text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition-colors sticky bottom-0 bg-white"
                                        >
                                            Xem tất cả kết quả →
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cart Button */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenCart(!isOpenCart)}
                                className="flex items-center gap-2 cursor-pointer bg-white text-[#3b82f6] font-medium px-4 py-2 rounded-md transition-all whitespace-nowrap"
                            >
                                <span>Giỏ hàng</span>
                                <MdOutlineShoppingCart className="text-lg" />
                            </button>

                            {/* Cart Dropdown */}
                            {isOpenCart && (
                                <div className='bg-white shadow-2xl z-30 min-h-36 right-0 rounded-xl absolute top-12 w-[400px] border border-gray-200'>
                                    <div className='py-3 border-b border-gray-200 uppercase text-center text-xl font-medium'>
                                        Giỏ hàng
                                    </div>

                                    {cart && cart?.cartItems?.length <= 0 ? (
                                        <div className='flex flex-col items-center py-5'>
                                            <i className="fa-solid fa-cart-shopping text-6xl"></i>
                                            <p className="mt-2">Hiện chưa có sản phẩm</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                            {cart && cart.cartItems.map((c) => (
                                                <div key={c.variant._id} className='flex items-center border-b border-gray-100 py-3 px-3'>
                                                    <div className='w-16 h-16 flex-shrink-0'>
                                                        <Image alt={c.product?.name} src={c.variant?.images?.[0] || getProductImage(c.product)} />
                                                    </div>
                                                    <div className='flex-grow ml-3'>
                                                        <div className='flex justify-between'>
                                                            <Link onClick={() => setOpenCart(false)} href={"/product/" + c.product?.slug}>
                                                                <h2 className='hover:text-blue-500 font-semibold text-sm line-clamp-1 pr-4'>
                                                                    {c.product?.name}
                                                                </h2>
                                                            </Link>
                                                            <button
                                                                onClick={() => removeFromCart(c.variant._id)}
                                                                className="text-gray-400 hover:text-red-500 cursor-pointer"
                                                            >
                                                                <i className="fa-solid fa-xmark"></i>
                                                            </button>
                                                        </div>
                                                        {/* Show variant combination to distinguish same-product items */}
                                                        {c.variant?.combination && Object.keys(c.variant.combination).length > 0 && (
                                                            <div className='flex flex-wrap gap-1 mt-1'>
                                                                {Object.values(c.variant.combination).map((val, i) => (
                                                                    <span key={i} className='text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded'>
                                                                        {val}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className='flex justify-between mt-1.5 items-center'>
                                                            <div className='flex items-center border border-gray-200 rounded'>
                                                                <Button
                                                                    onClick={() => updateQuantity(c.variant._id, -1)}
                                                                    className='border-none px-2'
                                                                >
                                                                    <i className="fa-solid fa-minus"></i>
                                                                </Button>
                                                                <span className='w-8 text-center'>{c.quantity}</span>
                                                                <Button
                                                                    onClick={() => updateQuantity(c.variant._id, 1)}
                                                                    className='border-none px-2'
                                                                >
                                                                    <i className="fa-solid fa-plus"></i>
                                                                </Button>
                                                            </div>
                                                            <p className='font-semibold text-red-500'>
                                                                {c.price.toLocaleString()}đ
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className='py-3 border-t border-gray-200 flex items-center justify-between px-4'>
                                        <p className='uppercase font-semibold'>Tổng tiền:</p>
                                        <p className='text-blue-500 font-semibold text-lg'>
                                            {calculateTotal().toLocaleString()}đ
                                        </p>
                                    </div>

                                    <div className="px-4 pb-4">
                                        <Link
                                            onClick={() => setOpenCart(false)}
                                            href="/cart"
                                            className='block py-2 text-center rounded-md text-white font-medium bg-blue-500 hover:bg-blue-600 transition-colors'
                                        >
                                            XEM GIỎ HÀNG
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Auth Section */}
                        <AuthSection
                            handleOpenLogin={handleOpenLogin}
                            handleOpenRegister={handleOpenRegister}
                        />
                    </div>
                </div>
            </header>
        </>
    )
}

// Auth Section Component  
function AuthSection({
    handleOpenLogin,
    handleOpenRegister
}: {
    handleOpenLogin: () => void;
    handleOpenRegister: () => void;
}) {
    const { user, logout } = useAuthUser();

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            label: (
                <Link href="/profile/detail" className="flex items-center gap-2">
                    <UserOutlined />
                    <span>Thông tin cá nhân</span>
                </Link>
            ),
        },
        {
            key: 'password',
            label: (
                <Link href="/profile/password" className="flex items-center gap-2">
                    <CloudSyncOutlined />
                    <span>Thay đổi mật khẩu</span>
                </Link>
            ),
        },
        {
            key: 'address',
            label: (
                <Link href="/profile/address" className="flex items-center gap-2">
                    <CarFilled />
                    <span>Thông tin địa chỉ</span>
                </Link>
            ),
        },
        {
            key: 'orders',
            label: (
                <Link href="/profile/order" className="flex items-center gap-2">
                    <PicRightOutlined />
                    <span>Đơn hàng của tôi</span>
                </Link>
            ),
        },
        {
            key: 'create-product',
            label: (
                <Link href="/create-product" className="flex items-center gap-2">
                    <ShopOutlined />
                    <span>Đăng bán sản phẩm</span>
                </Link>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: (
                <div className="flex items-center gap-2 text-red-500">
                    <LogoutOutlined />
                    <span>Đăng xuất</span>
                </div>
            ),
            onClick: logout,
        },
    ];

    if (user) {
        console.log(user)
        return (
            <div className="flex items-center gap-2">
                <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    arrow
                >
                    <div className="flex items-center gap-2 cursor-pointer bg-white text-[#3b82f6] hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all">
                        <Avatar
                            src={user?.avatar || null}
                            icon={<UserOutlined />}
                            size="small"
                        />
                        <span className="max-w-24 truncate">{user.fullname}</span>
                        <IoIosArrowDown />
                    </div>
                </Dropdown>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleOpenLogin}
                className="flex items-center gap-2 cursor-pointer bg-white text-[#3b82f6] font-medium px-4 py-2 rounded-md transition-all whitespace-nowrap"
            >
                <span>Đăng nhập</span>
                <FaRegUserCircle />
            </button>
            <button
                onClick={handleOpenRegister}
                className="flex items-center gap-2 cursor-pointer bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-all whitespace-nowrap"
            >
                <span>Đăng ký</span>
                <FaUserPlus />
            </button>
        </div>
    );
}