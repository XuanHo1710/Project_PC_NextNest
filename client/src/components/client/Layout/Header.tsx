"use client";
import { IoIosArrowDown } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Button, Image, Input, Spin, Badge } from "antd";
import { BiCategory } from "react-icons/bi";
import { MdOutlineNotListedLocation } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdOutlineChatBubbleOutline } from "react-icons/md";
import { FaRegUserCircle, FaUserPlus } from "react-icons/fa";
import { FaStore } from "react-icons/fa";
import { IoDocumentOutline } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import Marquee from "react-fast-marquee";
import { MdOutlineSearch } from "react-icons/md";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ICategory } from "@/types/category";
import { categoryClientService, productClientService } from "@/services/client";
import { IProductVariantSearchResult } from "@/types/product";
import useCartStore from "@/hooks/useCart";
import { useUnreadCount } from "@/hooks/client/useChat";
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { cart, updateQuantity, removeFromCart, calculateTotal } = useCartStore();

    const { data, isLoading } = useQuery<ICategory[] | []>({
        queryKey: ['categories'], // key để cache
        queryFn: () => categoryClientService.getAllCategories(),
        staleTime: 1000 * 60 * 5, // 5 phút cache không gọi lại
    });


    const { data: products, isLoading: loadingSearch } = useQuery<IProductVariantSearchResult[] | []>({
        queryKey: ['product-search', search], // key để cache
        queryFn: () => productClientService.esQuickSearch(search, 8),
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

            <header className="fixed w-full z-50 left-0 right-0 top-0 bg-white shadow-md">
                {/* Top Bar — desktop only */}
                <div className="hidden md:block bg-slate-700 text-white">
                    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-1.5">
                        <Marquee className="flex-1 text-xs font-medium" speed={50} gradient={false}>
                            🔄 Thu cũ giá ngon - Lên đời tiết kiệm ✅ Sản phẩm Chính hãng - Xuất VAT đầy đủ 🚚 Giao nhanh - Miễn phí cho đơn 300k
                        </Marquee>
                        <div className="flex items-center text-xs">
                            <h5 className="flex items-center gap-1.5 border-l border-slate-500 px-3 cursor-pointer hover:text-sky-300 transition-colors"><FaStore /> Cửa hàng gần bạn</h5>
                            <h5 className="flex items-center gap-1.5 border-l border-slate-500 px-3 cursor-pointer hover:text-sky-300 transition-colors"><IoDocumentOutline /> Tra cứu đơn hàng</h5>
                            <h5 className="flex items-center gap-1.5 border-l border-slate-500 px-3 cursor-pointer hover:text-sky-300 transition-colors"><FaPhoneAlt /> 1800 2097</h5>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 py-2.5">
                        {/* Logo */}
                        <Link href="/home">
                            <h2 className="font-bold text-slate-700 text-2xl whitespace-nowrap">Arisu</h2>
                        </Link>

                        {/* Category Dropdown — desktop */}
                        <div className="relative hidden lg:block">
                            <button
                                onClick={() => { setOpenCategory(!isOpenCategory); setOpenItemCategory(false) }}
                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-700 font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm"
                            >
                                <BiCategory className="text-lg text-indigo-500" />
                                <span>Danh mục</span>
                                <IoIosArrowDown className="text-xs text-slate-400" />
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
                                                    className={`text-sm font-medium px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 justify-between cursor-pointer flex items-center gap-2 ${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''}`}
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

                        {/* Location — desktop */}
                        <button className="hidden lg:flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm">
                            <MdOutlineNotListedLocation className="text-indigo-500" />
                            <span>Hồ Chí Minh</span>
                            <IoIosArrowDown className="text-xs text-slate-400" />
                        </button>

                        {/* Search Bar */}
                        <div className="flex-grow relative">
                            <Input
                                value={search}
                                onChange={(e) => handleOnChange(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSearchNavigate(); }}
                                placeholder="Bạn muốn mua gì ngày hôm nay"
                                className="!py-2 !px-4 rounded-lg w-full !border-slate-200 focus:!border-indigo-400"
                                suffix={<MdOutlineSearch className="text-xl text-slate-400 cursor-pointer hover:text-indigo-500" onClick={handleSearchNavigate} />}
                            />

                            {/* Search Results */}
                            {isOpenSearch && (
                                <div style={{ scrollbarWidth: "none" }} className="z-20 absolute top-full w-full md:w-[480px] rounded-lg left-0 mt-1 max-h-[380px] bg-white overflow-y-auto shadow-xl border border-gray-200">
                                    {loadingSearch ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Spin size="large" />
                                        </div>
                                    ) : (
                                        products && products.length > 0 ? (
                                            <div className="py-1">
                                                {products.map((v: IProductVariantSearchResult) => (
                                                    <Link
                                                        key={v._id}
                                                        href={"/product/" + v.productSlug}
                                                        onClick={() => { setSearch(""); setOpenSearch(false); }}
                                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    >
                                                        <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden border border-gray-100 bg-gray-50">
                                                            <Image
                                                                src={v.images?.[0] || undefined}
                                                                alt={v.productName}
                                                                width={48}
                                                                height={48}
                                                                className="!object-cover !w-full !h-full"
                                                                preview={false}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-800 line-clamp-1">{v.productName}</div>
                                                            {v.combination && Object.keys(v.combination).length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                                    {Object.entries(v.combination).map(([key, val]) => (
                                                                        <span key={key} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                                            {key}: {val}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-sm font-bold text-indigo-600">
                                                                    {(v.displayPrice || v.price * (1 - (v.discount || 0) / 100)).toLocaleString()}đ
                                                                </span>
                                                                {v.discount > 0 && (
                                                                    <span className="text-xs text-gray-400 line-through">{v.price.toLocaleString()}đ</span>
                                                                )}
                                                                {v.discount > 0 && (
                                                                    <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                                                                        -{v.discount}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                                                <Image
                                                    src="https://stores.lifestylestores.com/VendorpageTheme/Enterprise/EThemeForLifestyleUpdated/images/product-not-found.jpg"
                                                    alt="Not Found"
                                                    className="mb-3"
                                                    width={120}
                                                    preview={false}
                                                />
                                                <p className="text-sm font-semibold mb-0.5">Không tìm thấy sản phẩm nào</p>
                                                <p className="text-xs text-gray-400">Hãy thử tìm kiếm với từ khóa khác.</p>
                                            </div>
                                        )
                                    )}
                                    {products && products.length > 0 && (
                                        <Link
                                            href={`/search?q=${encodeURIComponent(search)}`}
                                            onClick={() => { setOpenSearch(false); }}
                                            className="block text-center py-2.5 text-sm font-semibold text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 border-t border-gray-100 transition-colors sticky bottom-0 bg-white rounded-b-lg"
                                        >
                                            Xem tất cả kết quả →
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cart Button — desktop */}
                        <div className="relative hidden md:block">
                            <button
                                onClick={() => setOpenCart(!isOpenCart)}
                                className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm"
                            >
                                <span>Giỏ hàng</span>
                                <Badge count={cart?.cartItems?.length || 0} size="small" offset={[2, -2]}>
                                    <MdOutlineShoppingCart className="text-lg text-indigo-500" />
                                </Badge>
                            </button>

                            {/* Cart Dropdown */}
                            {isOpenCart && (
                                <div className='bg-white shadow-2xl z-30 min-h-36 right-0 rounded-xl absolute top-12 w-[400px] border border-gray-200'>
                                    <div className='py-3 border-b border-gray-200 uppercase text-center text-xl font-medium text-slate-700'>
                                        Giỏ hàng
                                    </div>

                                    {cart && cart?.cartItems?.length <= 0 ? (
                                        <div className='flex flex-col items-center py-5 text-slate-400'>
                                            <MdOutlineShoppingCart className="text-5xl" />
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
                                                                <h2 className='hover:text-indigo-500 font-semibold text-sm line-clamp-1 pr-4'>
                                                                    {c.product?.name}
                                                                </h2>
                                                            </Link>
                                                            <button
                                                                onClick={() => removeFromCart(c.variant._id)}
                                                                className="text-gray-400 hover:text-red-500 cursor-pointer"
                                                            >
                                                                <IoClose />
                                                            </button>
                                                        </div>
                                                        {c.variant?.combination && Object.keys(c.variant.combination).length > 0 && (
                                                            <div className='flex flex-wrap gap-1 mt-1'>
                                                                {Object.values(c.variant.combination).map((val, i) => (
                                                                    <span key={i} className='text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded'>
                                                                        {val}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className='flex justify-between mt-1.5 items-center'>
                                                            <div className='flex items-center border border-gray-200 rounded'>
                                                                <Button onClick={() => updateQuantity(c.variant._id, -1)} className='border-none px-2'>−</Button>
                                                                <span className='w-8 text-center text-sm'>{c.quantity}</span>
                                                                <Button onClick={() => updateQuantity(c.variant._id, 1)} className='border-none px-2'>+</Button>
                                                            </div>
                                                            <p className='font-semibold text-red-500 text-sm'>
                                                                {c.price.toLocaleString()}đ
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className='py-3 border-t border-gray-200 flex items-center justify-between px-4'>
                                        <p className='uppercase font-semibold text-sm text-slate-600'>Tổng tiền:</p>
                                        <p className='text-indigo-600 font-semibold text-lg'>
                                            {calculateTotal().toLocaleString()}đ
                                        </p>
                                    </div>

                                    <div className="px-4 pb-4">
                                        <Link
                                            onClick={() => setOpenCart(false)}
                                            href="/cart"
                                            className='block py-2.5 text-center rounded-lg text-white font-medium bg-indigo-500 hover:bg-indigo-600 transition-colors'
                                        >
                                            XEM GIỎ HÀNG
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Button — desktop */}
                        <Link
                            href="/chat"
                            className="hidden md:flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap"
                        >
                            <ChatBadge />
                        </Link>

                        {/* Auth Section — desktop */}
                        <div className="hidden md:block">
                            <AuthSection
                                handleOpenLogin={handleOpenLogin}
                                handleOpenRegister={handleOpenRegister}
                            />
                        </div>

                        {/* Mobile: Cart + Hamburger */}
                        <div className="flex md:hidden items-center gap-2">
                            <Link href="/cart" className="relative p-2">
                                <Badge count={cart?.cartItems?.length || 0} size="small" offset={[0, 0]}>
                                    <MdOutlineShoppingCart className="text-xl text-slate-600" />
                                </Badge>
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-slate-600"
                            >
                                {mobileMenuOpen ? <IoClose className="text-2xl" /> : <HiOutlineMenuAlt3 className="text-2xl" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 shadow-lg max-h-[80vh] overflow-y-auto">
                        <div className="p-4 space-y-3">
                            {/* Mobile Auth */}
                            <div className="pb-3 border-b border-slate-100">
                                <AuthSection
                                    handleOpenLogin={() => { setMobileMenuOpen(false); handleOpenLogin(); }}
                                    handleOpenRegister={() => { setMobileMenuOpen(false); handleOpenRegister(); }}
                                />
                            </div>
                            {/* Mobile Category */}
                            <Link href="/home" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-2.5 text-slate-700 font-medium hover:text-indigo-500">
                                <BiCategory className="text-lg text-indigo-500" /> Danh mục sản phẩm
                            </Link>
                            {/* Mobile Chat */}
                            <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-2.5 text-slate-700 font-medium hover:text-indigo-500">
                                <MdOutlineChatBubbleOutline className="text-lg text-indigo-500" /> Tin nhắn <ChatBadge />
                            </Link>
                            {/* Mobile Info */}
                            <div className="pt-3 border-t border-slate-100 space-y-2 text-sm text-slate-500">
                                <p className="flex items-center gap-2"><FaStore className="text-indigo-400" /> Cửa hàng gần bạn</p>
                                <p className="flex items-center gap-2"><IoDocumentOutline className="text-indigo-400" /> Tra cứu đơn hàng</p>
                                <p className="flex items-center gap-2"><FaPhoneAlt className="text-indigo-400" /> 1800 2097</p>
                            </div>
                        </div>
                    </div>
                )}
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
        return (
            <div className="flex items-center gap-2">
                <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    arrow
                >
                    <div className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg transition-all">
                        <Avatar
                            src={user?.avatar || null}
                            icon={<UserOutlined />}
                            size="small"
                        />
                        <span className="max-w-24 truncate text-sm">{user.fullname}</span>
                        <IoIosArrowDown className="text-xs text-slate-400" />
                    </div>
                </Dropdown>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleOpenLogin}
                className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm"
            >
                <span>Đăng nhập</span>
                <FaRegUserCircle className="text-indigo-500" />
            </button>
            <button
                onClick={handleOpenRegister}
                className="flex items-center gap-2 cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm"
            >
                <span>Đăng ký</span>
                <FaUserPlus />
            </button>
        </div>
    );
}

// Chat Badge with unread count
function ChatBadge() {
    const { user } = useAuthUser();
    const { data } = useUnreadCount(user?._id);
    const count = data?.unreadCount || 0;

    return (
        <Badge count={count} size="small" offset={[2, -2]}>
            <MdOutlineChatBubbleOutline className="text-xl text-[#3b82f6]" />
        </Badge>
    );
}