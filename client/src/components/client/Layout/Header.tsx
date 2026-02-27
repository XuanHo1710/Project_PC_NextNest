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
        queryKey: ['categories'], // key Ã„â€˜Ã¡Â»Æ’ cache
        queryFn: () => categoryClientService.getAllCategories(),
        staleTime: 1000 * 60 * 5, // 5 phÃƒÂºt cache khÃƒÂ´ng gÃ¡Â»Âi lÃ¡ÂºÂ¡i
    });


    const { data: products, isLoading: loadingSearch } = useQuery<IProductVariantSearchResult[] | []>({
        queryKey: ['product-search', search], // key Ã„â€˜Ã¡Â»Æ’ cache
        queryFn: () => productClientService.esQuickSearch(search, 8),
        enabled: !!search
    });


    useEffect(() => {
        if (data && !isLoading) {
            setCategories(data);

        }
    }, [data, isLoading]); // chÃ¡Â»â€° chÃ¡ÂºÂ¡y khi data thay Ã„â€˜Ã¡Â»â€¢i

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

            <header className="fixed w-full z-50 left-0 right-0 top-0 bg-blue-600 shadow-lg">
                {/* Top Bar Ã¢â‚¬â€ desktop only */}
                <div className="hidden md:block bg-blue-700 text-white">
                    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-1.5">
                        <Marquee className="flex-1 text-xs font-medium" speed={50} gradient={false}>
                            Ã°Å¸â€â€ž Thu cÃ…Â© giÃƒÂ¡ ngon - LÃƒÂªn Ã„â€˜Ã¡Â»Âi tiÃ¡ÂºÂ¿t kiÃ¡Â»â€¡m Ã¢Å“â€¦ SÃ¡ÂºÂ£n phÃ¡ÂºÂ©m ChÃƒÂ­nh hÃƒÂ£ng - XuÃ¡ÂºÂ¥t VAT Ã„â€˜Ã¡ÂºÂ§y Ã„â€˜Ã¡Â»Â§ Ã°Å¸Å¡Å¡ Giao nhanh - MiÃ¡Â»â€¦n phÃƒÂ­ cho Ã„â€˜Ã†Â¡n 300k
                        </Marquee>
                        <div className="flex items-center text-xs">
                            <h5 className="flex items-center gap-1.5 border-l border-blue-400/30 px-3 cursor-pointer hover:text-blue-200 transition-colors"><FaStore /> CÃ¡Â»Â­a hÃƒÂ ng gÃ¡ÂºÂ§n bÃ¡ÂºÂ¡n</h5>
                            <h5 className="flex items-center gap-1.5 border-l border-blue-400/30 px-3 cursor-pointer hover:text-blue-200 transition-colors"><IoDocumentOutline /> Tra cÃ¡Â»Â©u Ã„â€˜Ã†Â¡n hÃƒÂ ng</h5>
                            <h5 className="flex items-center gap-1.5 border-l border-blue-400/30 px-3 cursor-pointer hover:text-blue-200 transition-colors"><FaPhoneAlt /> 1800 2097</h5>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 py-2.5">
                        {/* Logo */}
                        <Link href="/home">
                            <h2 className="font-bold text-white text-2xl whitespace-nowrap">Arisu</h2>
                        </Link>

                        {/* Category Dropdown Ã¢â‚¬â€ desktop */}
                        <div className="relative hidden lg:block">
                            <button
                                onClick={() => { setOpenCategory(!isOpenCategory); setOpenItemCategory(false) }}
                                className="flex items-center gap-2 bg-blue-500/30 hover:bg-blue-500/40 cursor-pointer text-white font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm"
                            >
                                <BiCategory className="text-lg text-blue-200" />
                                <span>Danh mÃ¡Â»Â¥c</span>
                                <IoIosArrowDown className="text-xs text-blue-100/60" />
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
                                                    className={`text-sm font-medium px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 justify-between cursor-pointer flex items-center gap-2 ${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''}`}
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

                        {/* Location Ã¢â‚¬â€ desktop */}
                        <button className="hidden lg:flex items-center gap-2 cursor-pointer bg-blue-500/30 hover:bg-blue-500/40 text-white font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm">
                            <MdOutlineNotListedLocation className="text-blue-200" />
                            <span>HÃ¡Â»â€œ ChÃƒÂ­ Minh</span>
                            <IoIosArrowDown className="text-xs text-blue-100/60" />
                        </button>

                        {/* Search Bar */}
                        <div className="flex-grow relative">
                            <Input
                                value={search}
                                onChange={(e) => handleOnChange(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSearchNavigate(); }}
                                placeholder="BÃ¡ÂºÂ¡n muÃ¡Â»â€˜n mua gÃƒÂ¬ ngÃƒÂ y hÃƒÂ´m nay"
                                className="!py-2 !px-4 rounded-lg w-full !bg-white !border-blue-400/30 focus:!border-blue-300"
                                suffix={<MdOutlineSearch className="text-xl text-gray-400 cursor-pointer hover:text-blue-500" onClick={handleSearchNavigate} />}
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
                                                                        <span key={key} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                                                            {key}: {val}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-sm font-bold text-blue-600">
                                                                    {(v.displayPrice || v.price * (1 - (v.discount || 0) / 100)).toLocaleString()}Ã„â€˜
                                                                </span>
                                                                {v.discount > 0 && (
                                                                    <span className="text-xs text-gray-400 line-through">{v.price.toLocaleString()}Ã„â€˜</span>
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
                                                <p className="text-sm font-semibold mb-0.5">KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y sÃ¡ÂºÂ£n phÃ¡ÂºÂ©m nÃƒÂ o</p>
                                                <p className="text-xs text-gray-400">HÃƒÂ£y thÃ¡Â»Â­ tÃƒÂ¬m kiÃ¡ÂºÂ¿m vÃ¡Â»â€ºi tÃ¡Â»Â« khÃƒÂ³a khÃƒÂ¡c.</p>
                                            </div>
                                        )
                                    )}
                                    {products && products.length > 0 && (
                                        <Link
                                            href={`/search?q=${encodeURIComponent(search)}`}
                                            onClick={() => { setOpenSearch(false); }}
                                            className="block text-center py-2.5 text-sm font-semibold text-blue-500 hover:text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition-colors sticky bottom-0 bg-white rounded-b-lg"
                                        >
                                            Xem tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ kÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ Ã¢â€ â€™
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cart Button Ã¢â‚¬â€ desktop */}
                        <div className="relative hidden md:block">
                            <button
                                onClick={() => setOpenCart(!isOpenCart)}
                                className="flex items-center gap-2 cursor-pointer bg-blue-500/30 hover:bg-blue-500/40 text-white font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm"
                            >
                                <span>GiÃ¡Â»Â hÃƒÂ ng</span>
                                <Badge count={cart?.cartItems?.length || 0} size="small" offset={[2, -2]}>
                                    <MdOutlineShoppingCart className="text-lg text-blue-200" />
                                </Badge>
                            </button>

                            {/* Cart Dropdown */}
                            {isOpenCart && (
                                <div className='bg-white shadow-2xl z-30 min-h-36 right-0 rounded-xl absolute top-12 w-[400px] border border-gray-200'>
                                    <div className='py-3 border-b border-gray-200 uppercase text-center text-xl font-medium text-slate-700'>
                                        GiÃ¡Â»Â hÃƒÂ ng
                                    </div>

                                    {cart && cart?.cartItems?.length <= 0 ? (
                                        <div className='flex flex-col items-center py-5 text-slate-400'>
                                            <MdOutlineShoppingCart className="text-5xl" />
                                            <p className="mt-2">HiÃ¡Â»â€¡n chÃ†Â°a cÃƒÂ³ sÃ¡ÂºÂ£n phÃ¡ÂºÂ©m</p>
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
                                                                <IoClose />
                                                            </button>
                                                        </div>
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
                                                                <Button onClick={() => updateQuantity(c.variant._id, -1)} className='border-none px-2'>Ã¢Ë†â€™</Button>
                                                                <span className='w-8 text-center text-sm'>{c.quantity}</span>
                                                                <Button onClick={() => updateQuantity(c.variant._id, 1)} className='border-none px-2'>+</Button>
                                                            </div>
                                                            <p className='font-semibold text-red-500 text-sm'>
                                                                {c.price.toLocaleString()}Ã„â€˜
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className='py-3 border-t border-gray-200 flex items-center justify-between px-4'>
                                        <p className='uppercase font-semibold text-sm text-slate-600'>TÃ¡Â»â€¢ng tiÃ¡Â»Ân:</p>
                                        <p className='text-blue-600 font-semibold text-lg'>
                                            {calculateTotal().toLocaleString()}Ã„â€˜
                                        </p>
                                    </div>

                                    <div className="px-4 pb-4">
                                        <Link
                                            onClick={() => setOpenCart(false)}
                                            href="/cart"
                                            className='block py-2.5 text-center rounded-lg text-white font-medium bg-blue-500 hover:bg-blue-600 transition-colors'
                                        >
                                            XEM GIÃ¡Â»Å½ HÃƒâ‚¬NG
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Button Ã¢â‚¬â€ desktop */}
                        <Link
                            href="/chat"
                            className="hidden md:flex items-center gap-2 cursor-pointer bg-blue-500/30 hover:bg-blue-500/40 text-white font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap"
                        >
                            <ChatBadge />
                        </Link>

                        {/* Auth Section Ã¢â‚¬â€ desktop */}
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
                                    <MdOutlineShoppingCart className="text-xl text-white" />
                                </Badge>
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-white"
                            >
                                {mobileMenuOpen ? <IoClose className="text-2xl" /> : <HiOutlineMenuAlt3 className="text-2xl" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-blue-600 border-t border-blue-400/20 shadow-lg max-h-[80vh] overflow-y-auto">
                        <div className="p-4 space-y-1">
                            {/* Mobile Auth */}
                            <div className="pb-3 border-b border-blue-400/20">
                                <AuthSection
                                    handleOpenLogin={() => { setMobileMenuOpen(false); handleOpenLogin(); }}
                                    handleOpenRegister={() => { setMobileMenuOpen(false); handleOpenRegister(); }}
                                />
                            </div>
                            {/* Mobile Category */}
                            <Link href="/home" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 text-white font-medium hover:text-blue-200 border-b border-blue-400/20">
                                <BiCategory className="text-lg text-blue-200" /> Danh mÃ¡Â»Â¥c sÃ¡ÂºÂ£n phÃ¡ÂºÂ©m
                            </Link>
                            {/* Mobile Chat */}
                            <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 text-white font-medium hover:text-blue-200 border-b border-blue-400/20">
                                <MdOutlineChatBubbleOutline className="text-lg text-blue-200" /> Tin nhÃ¡ÂºÂ¯n <ChatBadge />
                            </Link>
                            {/* Mobile Info */}
                            <div className="pt-3 space-y-3 text-sm text-blue-100/70">
                                <p className="flex items-center gap-2"><FaStore className="text-blue-200" /> CÃ¡Â»Â­a hÃƒÂ ng gÃ¡ÂºÂ§n bÃ¡ÂºÂ¡n</p>
                                <p className="flex items-center gap-2"><IoDocumentOutline className="text-blue-200" /> Tra cÃ¡Â»Â©u Ã„â€˜Ã†Â¡n hÃƒÂ ng</p>
                                <p className="flex items-center gap-2"><FaPhoneAlt className="text-blue-200" /> 1800 2097</p>
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
                    <span>ThÃƒÂ´ng tin cÃƒÂ¡ nhÃƒÂ¢n</span>
                </Link>
            ),
        },
        {
            key: 'password',
            label: (
                <Link href="/profile/password" className="flex items-center gap-2">
                    <CloudSyncOutlined />
                    <span>Thay Ã„â€˜Ã¡Â»â€¢i mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u</span>
                </Link>
            ),
        },
        {
            key: 'address',
            label: (
                <Link href="/profile/address" className="flex items-center gap-2">
                    <CarFilled />
                    <span>ThÃƒÂ´ng tin Ã„â€˜Ã¡Â»â€¹a chÃ¡Â»â€°</span>
                </Link>
            ),
        },
        {
            key: 'orders',
            label: (
                <Link href="/profile/order" className="flex items-center gap-2">
                    <PicRightOutlined />
                    <span>Ã„ÂÃ†Â¡n hÃƒÂ ng cÃ¡Â»Â§a tÃƒÂ´i</span>
                </Link>
            ),
        },
        {
            key: 'create-product',
            label: (
                <Link href="/create-product" className="flex items-center gap-2">
                    <ShopOutlined />
                    <span>Ã„ÂÃ„Æ’ng bÃƒÂ¡n sÃ¡ÂºÂ£n phÃ¡ÂºÂ©m</span>
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
                    <span>Ã„ÂÃ„Æ’ng xuÃ¡ÂºÂ¥t</span>
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
                    <div className="flex items-center gap-2 cursor-pointer bg-blue-500/30 hover:bg-blue-500/40 text-white font-medium px-4 py-2 rounded-lg transition-all">
                        <Avatar
                            src={user?.avatar || null}
                            icon={<UserOutlined />}
                            size="small"
                        />
                        <span className="max-w-24 truncate text-sm">{user.fullname}</span>
                        <IoIosArrowDown className="text-xs text-blue-100/60" />
                    </div>
                </Dropdown>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleOpenLogin}
                className="flex items-center gap-2 cursor-pointer bg-blue-500/30 hover:bg-blue-500/40 text-white font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm"
            >
                <span>Ã„ÂÃ„Æ’ng nhÃ¡ÂºÂ­p</span>
                <FaRegUserCircle className="text-blue-200" />
            </button>
            <button
                onClick={handleOpenRegister}
                className="flex items-center gap-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm"
            >
                <span>Ã„ÂÃ„Æ’ng kÃƒÂ½</span>
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
            <MdOutlineChatBubbleOutline className="text-xl text-blue-200" />
        </Badge>
    );
}