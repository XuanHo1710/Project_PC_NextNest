'use client';
import CartProduct from "@/components/client/Cart/CartProduct";
import useCartStore from "@/hooks/useCart";
import { Button, Form, Input, Select, Empty, Divider, Avatar } from "antd";
import TextArea from "antd/es/input/TextArea";
import { ShoppingCartOutlined, SafetyCertificateOutlined, CarOutlined, CustomerServiceOutlined, WarningOutlined } from "@ant-design/icons";
import Link from "next/link";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { CartPageSkeleton } from "@/components/Skeletons";
import useAuthUser from "@/hooks/useAuthUser";
import { IAccountGuest } from "@/types/account-guest";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ICartItemOrder } from "@/types/order";
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import { accountGuestService, productClientService } from "@/services/client";
import { formatCurrencyVND } from "@/utils/productHelpers";
import { District, IOrderData, Province, Ward } from "@/types";
import Breadcrumb from '@/components/client/Breadcrumb/Breadcrumb';

interface StockCheckItem {
    variantId: string;
    sku: string;
    requested: number;
    available: number;
    sufficient: boolean;
}

interface OrderFormData {
    fullname: string;
    phone: string;
    email: string;
    province: number;
    district: number;
    ward: number;
    detailAddress: string;
    note?: string;
    savedAddress?: string;
}


export default function CartClient() {
    const { cart, calculateTotal, updateQuantity, removeFromCart } = useCartStore();
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();
    const [selectedWard, setSelectedWard] = useState<number | undefined>();
    const router = useRouter();
    const [loading, setLoading] = useState({
        provinces: false,
        districts: false,
        wards: false
    });

    const { user } = useAuthUser();

    // Query user profile vá»›i TanStack Query
    const {
        data: profile,
        isLoading: isLoadingProfile
    } = useQuery<IAccountGuest | null>({
        queryKey: ['user-profile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            return await accountGuestService.getProfile();
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000, // 5 phÃºt
        retry: 2,
        refetchOnWindowFocus: false
    });

    // Láº¥y saved addresses tá»« profile
    const savedAddresses = profile?.addresses || [];

    // Stock check â€” verify stock availability for all cart items on load
    const stockCheckItems = cart?.cartItems
        .filter(item => item.variant?._id)
        .map(item => ({ variantId: item.variant._id, quantity: item.quantity })) || [];

    const { data: stockCheckResult } = useQuery<StockCheckItem[]>({
        queryKey: ['cart-stock-check', stockCheckItems.map(i => `${i.variantId}:${i.quantity}`).join(',')],
        queryFn: () => productClientService.checkCartStock(stockCheckItems),
        enabled: stockCheckItems.length > 0,
        staleTime: 1000 * 30, // refresh every 30s
        refetchOnWindowFocus: true,
    });

    // Map variantId â†’ stock check info for quick lookup
    const stockMap = new Map<string, StockCheckItem>();
    if (stockCheckResult) {
        for (const item of stockCheckResult) {
            stockMap.set(item.variantId, item);
        }
    }

    const hasStockIssues = stockCheckResult?.some(item => !item.sufficient) || false;

    const [form] = Form.useForm();

    // Update form values khi profile Ä‘Æ°á»£c load
    useEffect(() => {
        if (profile) {
            // Find default address or first address
            const defaultAddr = profile.addresses?.find(a => a.isDefault) || profile.addresses?.[0];
            form.setFieldsValue({
                fullname: profile.fullname || "",
                phone: profile.phone || "",
                email: profile.email || "",
                savedAddress: defaultAddr?._id || "new",
                note: ""
            });
            // Auto-load default address data
            if (defaultAddr?._id) {
                handleSavedAddressChange(defaultAddr._id);
            }
        }
    }, [profile, form]);

    // Load provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoading(prev => ({ ...prev, provinces: true }));
            try {
                const response = await fetch('https://provinces.open-api.vn/api/p/');
                const data = await response.json();
                setProvinces(data);
            } catch (error) {
                console.error('Error fetching provinces:', error);
                toast.error('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u tá»‰nh/thÃ nh phá»‘');
            } finally {
                setLoading(prev => ({ ...prev, provinces: false }));
            }
        };
        fetchProvinces();
    }, []);


    const fetchDistricts = async (provinceCode: number) => {
        setLoading(prev => ({ ...prev, districts: true }));
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts || []);
            setWards([]); // Reset wards when province changes
            setSelectedDistrict(undefined);
            setSelectedWard(undefined);
        } catch (error) {
            console.error('Error fetching districts:', error);
            toast.error('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u quáº­n/huyá»‡n');
        } finally {
            setLoading(prev => ({ ...prev, districts: false }));
        }
    };

    const fetchWards = async (districtCode: number) => {
        setLoading(prev => ({ ...prev, wards: true }));
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await response.json();
            setWards(data.wards || []);
            setSelectedWard(undefined);
        } catch (error) {
            console.error('Error fetching wards:', error);
            toast.error('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u phÆ°á»ng/xÃ£');
        } finally {
            setLoading(prev => ({ ...prev, wards: false }));
        }
    };

    const handleProvinceChange = (value: number) => {
        setSelectedProvince(value);
        fetchDistricts(value);
    };

    const handleDistrictChange = (value: number) => {
        setSelectedDistrict(value);
        fetchWards(value);
    };

    const handleWardChange = (value: number) => {
        setSelectedWard(value);
    };

    const handleSavedAddressChange = async (addressId: string) => {
        if (addressId === 'new') {
            // Reset form for new address
            form.setFieldsValue({
                province: undefined,
                district: undefined,
                ward: undefined,
                detailAddress: ''
            });
            setSelectedProvince(undefined);
            setSelectedDistrict(undefined);
            setSelectedWard(undefined);
            setDistricts([]);
            setWards([]);
            return;
        }

        const address = savedAddresses.find(addr => addr._id === addressId);
        if (address) {
            // Set province and fetch districts
            setSelectedProvince(address.province.code);
            await fetchDistricts(address.province.code);

            // Set district and fetch wards
            setTimeout(async () => {
                setSelectedDistrict(address.district.code);
                await fetchWards(address.district.code);

                // Set ward and detail address
                setTimeout(() => {
                    setSelectedWard(address.ward.code);
                    form.setFieldsValue({
                        province: address.province.code,
                        district: address.district.code,
                        ward: address.ward.code,
                        detailAddress: address.detailAddress
                    });
                }, 100);
            }, 100);
        }
    };

    const handlePlaceOrder = async (data: OrderFormData) => {
        console.log(data);

        // Validate giá» hÃ ng khÃ´ng Ä‘Æ°á»£c trá»‘ng
        if (!cart || cart.cartItems.length === 0) {
            toast.error("Giá» hÃ ng trá»‘ng! Vui lÃ²ng thÃªm sáº£n pháº©m Ä‘á»ƒ Ä‘áº·t hÃ ng.");
            return;
        }

        // Validate stock availability
        if (hasStockIssues) {
            toast.error("Má»™t sá»‘ sáº£n pháº©m trong giá» hÃ ng Ä‘Ã£ háº¿t hÃ ng hoáº·c khÃ´ng Ä‘á»§ sá»‘ lÆ°á»£ng. Vui lÃ²ng kiá»ƒm tra láº¡i!");
            return;
        }

        // Validate tá»•ng tiá»n pháº£i > 0 vÃ  >= Ä‘Æ¡n hÃ ng tá»‘i thiá»ƒu
        const totalAmount = calculateTotal();
        // const minOrderAmount = 100000; // 100k VND

        // if (totalAmount <= 0) {
        //     toast.error("Tá»•ng tiá»n Ä‘Æ¡n hÃ ng khÃ´ng há»£p lá»‡!");
        //     return;
        // }

        // if (totalAmount < minOrderAmount) {
        //     toast.error(`ÄÆ¡n hÃ ng tá»‘i thiá»ƒu ${minOrderAmount.toLocaleString()}Ä‘! Hiá»‡n táº¡i: ${totalAmount.toLocaleString()}Ä‘`);
        //     return;
        // }

        // Validate Ä‘á»‹a chá»‰ Ä‘áº§y Ä‘á»§
        if (!data.province || !data.district || !data.ward || !data.detailAddress) {
            toast.error("Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ thÃ´ng tin Ä‘á»‹a chá»‰ giao hÃ ng!");
            return;
        }

        // TÃ¬m tÃªn province, district, ward tá»« code
        const provinceName = provinces.find(p => p.code === data.province)?.name || '';
        const districtName = districts.find(d => d.code === data.district)?.name || '';
        const wardName = wards.find(w => w.code === data.ward)?.name || '';

        // Táº¡o Ä‘áº§y Ä‘á»§ Ä‘á»‹a chá»‰
        const fullAddress = `${data.detailAddress}, ${wardName}, ${districtName}, ${provinceName}`;

        // Prepare order data
        const orderData: IOrderData = {
            customerInfo: {
                guestId: user?.id || "",
                fullname: data.fullname,
                phone: data.phone,
                email: data.email,
                address: fullAddress,
                note: data.note || ''
            },
            orderDetail: cart.cartItems.map(item => {
                return {
                    product: item.product,
                    price: item.price,
                    productVariant: item.variant,
                    quantity: item.quantity,
                    subtotal: item.subtotal
                } as ICartItemOrder
            }),
            totalAmount: totalAmount,
            status: 'PENDING'
        };


        sessionStorage.setItem("orderData", JSON.stringify(orderData));

        router.push('/payment');
    };

    if (isLoadingProfile) {
        return <CartPageSkeleton />
    }

    return (
        <>
            <DynamicMetadata
                title={`Giá» hÃ ng cá»§a báº¡n - PC Store`}
                description={`Xem láº¡i giá» hÃ ng vÃ  hoÃ n táº¥t Ä‘Æ¡n hÃ ng cá»§a báº¡n táº¡i PC Store. Miá»…n phÃ­ váº­n chuyá»ƒn cho Ä‘Æ¡n hÃ ng trÃªn 2 triá»‡u. Há»— trá»£ tráº£ gÃ³p 0%.`}
                keywords="giá» hÃ ng, thanh toÃ¡n, mua hÃ ng, Ä‘Æ¡n hÃ ng, pc store"
                ogTitle={`Giá» hÃ ng`}
                ogDescription="HoÃ n táº¥t Ä‘Æ¡n hÃ ng ngay Ä‘á»ƒ nháº­n Æ°u Ä‘Ã£i miá»…n phÃ­ váº­n chuyá»ƒn vÃ  tráº£ gÃ³p 0%"
            />
            <div className="md:pt-4 pt-52 pb-10 dark:bg-slate-900 min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Breadcrumb */}
                    <Breadcrumb items={[{ label: 'Giá» hÃ ng' }]} />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="font-bold text-2xl lg:text-3xl text-gray-800 dark:text-white flex items-center gap-3">
                            <ShoppingCartOutlined className="text-blue-500" />
                            Giá» hÃ ng
                            <span className="text-base font-normal text-gray-400">
                                ({cart?.cartItems.length || 0} sáº£n pháº©m)
                            </span>
                        </h1>
                    </div>

                    {cart && cart.cartItems.length > 0 ? (
                        <div className="grid grid-cols-12 gap-6">
                            {/* Cart Items Column */}
                            <div className="col-span-12 lg:col-span-7">
                                {/* Stock warning banner */}
                                {hasStockIssues && (
                                    <div className="mb-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-start gap-3">
                                        <WarningOutlined className="text-orange-500 text-lg mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-orange-700 dark:text-orange-400 text-sm">Má»™t sá»‘ sáº£n pháº©m Ä‘Ã£ thay Ä‘á»•i tá»“n kho</p>
                                            <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                                                Vui lÃ²ng kiá»ƒm tra láº¡i sá»‘ lÆ°á»£ng hoáº·c xÃ³a sáº£n pháº©m háº¿t hÃ ng trÆ°á»›c khi Ä‘áº·t hÃ ng.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                                    {/* Cart Header */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        <div className="col-span-6">Sáº£n pháº©m</div>
                                        <div className="col-span-2 text-center">ÄÆ¡n giÃ¡</div>
                                        <div className="col-span-2 text-center">Sá»‘ lÆ°á»£ng</div>
                                        <div className="col-span-2 text-right">ThÃ nh tiá»n</div>
                                    </div>

                                    {/* Cart Items */}
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                                        {cart.cartItems.map((cartItem) => (
                                            <CartProduct
                                                key={cartItem.variant._id}
                                                cartItem={cartItem}
                                                handle={{ removeFromCart, updateQuantity }}
                                                stockInfo={stockMap.get(cartItem.variant?._id)}
                                            />
                                        ))}
                                    </div>

                                    {/* Cart Summary Bar */}
                                    <div className="border-t-2 border-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 px-4 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-600 dark:text-gray-300 font-medium">
                                                    Tá»•ng ({cart.cartItems.length} sáº£n pháº©m):
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl md:text-2xl text-blue-600 dark:text-blue-400">
                                                    {formatCurrencyVND(calculateTotal())}
                                                </p>
                                                {calculateTotal() >= 2000000 && (
                                                    <p className="text-xs text-green-600 mt-0.5 font-medium">
                                                        <CarOutlined className="mr-1" />Miá»…n phÃ­ váº­n chuyá»ƒn
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {/* {calculateTotal() < 100000 && (
                                            <div className="mt-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-md">
                                                ÄÆ¡n hÃ ng tá»‘i thiá»ƒu 100.000Ä‘. ThÃªm {formatCurrencyVND(100000 - calculateTotal())} ná»¯a Ä‘á»ƒ Ä‘áº·t hÃ ng.
                                            </div>
                                        )} */}
                                    </div>
                                </div>

                                {/* Trust badges */}
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                        <SafetyCertificateOutlined className="text-green-500 text-lg" />
                                        <span className="text-xs text-gray-600 dark:text-gray-300">Báº£o hÃ nh chÃ­nh hÃ£ng</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                        <CarOutlined className="text-blue-500 text-lg" />
                                        <span className="text-xs text-gray-600 dark:text-gray-300">Giao hÃ ng toÃ n quá»‘c</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                        <CustomerServiceOutlined className="text-orange-500 text-lg" />
                                        <span className="text-xs text-gray-600 dark:text-gray-300">Há»— trá»£ 24/7</span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Form Column */}
                            <div className="col-span-12 lg:col-span-5">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                                    <div className="p-5">
                                        <h2 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-clipboard-list text-blue-500"></i>
                                            ThÃ´ng tin Ä‘áº·t hÃ ng
                                        </h2>

                                        {/* User Profile Badge */}
                                        {user && profile ? (
                                            <div className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 rounded-lg p-3 mb-4 border border-blue-100 dark:border-blue-800">
                                                <div className="flex items-center gap-3">
                                                    {profile.avatar ?
                                                        <Avatar src={profile.avatar} />
                                                        :

                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                            {profile.fullname?.charAt(0).toUpperCase()}
                                                        </div>

                                                    }
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-sm text-gray-800 dark:text-blue-200 truncate">{profile.fullname}</p>
                                                        <p className="text-xs text-gray-500 dark:text-blue-300 truncate">{profile.email}</p>
                                                    </div>
                                                    <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-4 border border-amber-200 dark:border-amber-800">
                                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                                    <Link href="#" className="text-blue-500 font-semibold hover:underline">ÄÄƒng nháº­p</Link>
                                                    {" "}Ä‘á»ƒ tá»± Ä‘á»™ng Ä‘iá»n thÃ´ng tin vÃ  sá»­ dá»¥ng Ä‘á»‹a chá»‰ Ä‘Ã£ lÆ°u.
                                                </p>
                                            </div>
                                        )}

                                        <Form
                                            form={form}
                                            onFinish={handlePlaceOrder}
                                            layout="vertical"
                                            className="cart-checkout-form"
                                            initialValues={{
                                                fullname: profile?.fullname || "",
                                                phone: profile?.phone || "",
                                                email: profile?.email || "",
                                                savedAddress: (() => {
                                                    const defaultAddr = profile?.addresses?.find(a => a.isDefault) || profile?.addresses?.[0];
                                                    return defaultAddr?._id || "new";
                                                })(),
                                                note: ""
                                            }}
                                        >
                                            <div className="grid grid-cols-2 gap-3">
                                                <Form.Item
                                                    name='fullname'
                                                    label={<span className="text-xs font-medium">Há» vÃ  tÃªn</span>}
                                                    rules={[
                                                        { required: true, message: 'Vui lÃ²ng nháº­p há» tÃªn!' },
                                                        { min: 2, message: 'Tá»‘i thiá»ƒu 2 kÃ½ tá»±!' },
                                                        { max: 50, message: 'Tá»‘i Ä‘a 50 kÃ½ tá»±!' },
                                                    ]}
                                                    className="!mb-3"
                                                >
                                                    <Input placeholder="Nháº­p há» vÃ  tÃªn" className="!py-2" />
                                                </Form.Item>
                                                <Form.Item
                                                    name='phone'
                                                    label={<span className="text-xs font-medium">Sá»‘ Ä‘iá»‡n thoáº¡i</span>}
                                                    rules={[
                                                        { required: true, message: 'Vui lÃ²ng nháº­p SÄT!' },
                                                        { pattern: /^(0|84|\+84)[1-9][0-9]{8,9}$/, message: 'SÄT khÃ´ng há»£p lá»‡!' },
                                                    ]}
                                                    className="!mb-3"
                                                >
                                                    <Input placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i" className="!py-2" />
                                                </Form.Item>
                                            </div>

                                            <Form.Item
                                                name='email'
                                                label={<span className="text-xs font-medium">Email</span>}
                                                rules={[
                                                    { required: true, message: 'Vui lÃ²ng nháº­p email!' },
                                                    { type: 'email', message: 'Email khÃ´ng há»£p lá»‡!' },
                                                ]}
                                                className="!mb-3"
                                            >
                                                <Input placeholder="Nháº­p email" className="!py-2" />
                                            </Form.Item>

                                            <Divider className="!my-3" />

                                            {/* Saved Address */}
                                            {user && profile && savedAddresses.length > 0 && (
                                                <>
                                                    {/* Default Address Highlight */}
                                                    {(() => {
                                                        const defaultAddr = savedAddresses.find(a => a.isDefault);
                                                        if (!defaultAddr) return null;
                                                        return (
                                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3 border border-blue-200 dark:border-blue-800">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-sm">ðŸ </span>
                                                                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Äá»‹a chá»‰ máº·c Ä‘á»‹nh</span>
                                                                    <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">{defaultAddr.label}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-300">{defaultAddr.detailAddress}</p>
                                                            </div>
                                                        );
                                                    })()}
                                                    <Form.Item
                                                        name="savedAddress"
                                                        label={<span className="text-xs font-medium">Äá»‹a chá»‰ giao hÃ ng</span>}
                                                        className="!mb-3"
                                                    >
                                                        <Select
                                                            placeholder="Chá»n Ä‘á»‹a chá»‰ hoáº·c nháº­p má»›i"
                                                            onChange={handleSavedAddressChange}
                                                            className="w-full"
                                                        >
                                                            <Select.Option value="new">+ Nháº­p Ä‘á»‹a chá»‰ má»›i</Select.Option>
                                                            {savedAddresses.map((address) => (
                                                                <Select.Option key={address._id} value={address._id}>
                                                                    {address.isDefault ? 'ðŸ ' : 'ðŸ“'} {address.label} - {address.detailAddress}
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                <Form.Item
                                                    name="province"
                                                    label={<span className="text-xs font-medium">Tá»‰nh/ThÃ nh phá»‘</span>}
                                                    rules={[{ required: true, message: 'Chá»n tá»‰nh/TP!' }]}
                                                    className="!mb-3"
                                                >
                                                    <Select
                                                        placeholder="Chá»n tá»‰nh/TP"
                                                        loading={loading.provinces}
                                                        onChange={handleProvinceChange}
                                                        value={selectedProvince}
                                                        showSearch
                                                        filterOption={(input, option) =>
                                                            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                                        }
                                                    >
                                                        {provinces.map(province => (
                                                            <Select.Option key={province.code} value={province.code}>
                                                                {province.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    name="district"
                                                    label={<span className="text-xs font-medium">Quáº­n/Huyá»‡n</span>}
                                                    rules={[{ required: true, message: 'Chá»n quáº­n/huyá»‡n!' }]}
                                                    className="!mb-3"
                                                >
                                                    <Select
                                                        placeholder="Chá»n quáº­n/huyá»‡n"
                                                        loading={loading.districts}
                                                        onChange={handleDistrictChange}
                                                        value={selectedDistrict}
                                                        disabled={!selectedProvince}
                                                        showSearch
                                                        filterOption={(input, option) =>
                                                            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                                        }
                                                    >
                                                        {districts.map(district => (
                                                            <Select.Option key={district.code} value={district.code}>
                                                                {district.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Form.Item
                                                    name="ward"
                                                    label={<span className="text-xs font-medium">PhÆ°á»ng/XÃ£</span>}
                                                    rules={[{ required: true, message: 'Chá»n phÆ°á»ng/xÃ£!' }]}
                                                    className="!mb-3"
                                                >
                                                    <Select
                                                        placeholder="Chá»n phÆ°á»ng/xÃ£"
                                                        loading={loading.wards}
                                                        onChange={handleWardChange}
                                                        value={selectedWard}
                                                        disabled={!selectedDistrict}
                                                        showSearch
                                                        filterOption={(input, option) =>
                                                            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                                        }
                                                    >
                                                        {wards.map(ward => (
                                                            <Select.Option key={ward.code} value={ward.code}>
                                                                {ward.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    name='detailAddress'
                                                    label={<span className="text-xs font-medium">Äá»‹a chá»‰ cá»¥ thá»ƒ</span>}
                                                    rules={[
                                                        { required: true, message: 'Nháº­p Ä‘á»‹a chá»‰!' },
                                                        { min: 5, message: 'Tá»‘i thiá»ƒu 5 kÃ½ tá»±!' },
                                                    ]}
                                                    className="!mb-3"
                                                >
                                                    <Input placeholder="Sá»‘ nhÃ , tÃªn Ä‘Æ°á»ng..." className="!py-2" />
                                                </Form.Item>
                                            </div>

                                            <Form.Item
                                                name='note'
                                                label={<span className="text-xs font-medium">Ghi chÃº</span>}
                                                className="!mb-4"
                                            >
                                                <TextArea
                                                    rows={3}
                                                    placeholder="Ghi chÃº cho Ä‘Æ¡n hÃ ng (tÃ¹y chá»n)"
                                                    showCount
                                                    maxLength={500}
                                                    className="!text-sm"
                                                />
                                            </Form.Item>

                                            {/* Order Summary */}
                                            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-3 mb-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Táº¡m tÃ­nh ({cart.cartItems.length} sáº£n pháº©m)</span>
                                                    <span className="font-medium">{formatCurrencyVND(calculateTotal())}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">PhÃ­ váº­n chuyá»ƒn</span>
                                                    <span className="font-medium text-green-600">
                                                        {calculateTotal() >= 2000000 ? 'Miá»…n phÃ­' : 'TÃ­nh khi giao hÃ ng'}
                                                    </span>
                                                </div>
                                                <Divider className="!my-2" />
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-gray-800 dark:text-white">Tá»•ng cá»™ng</span>
                                                    <span className="font-bold text-xl text-red-500">{formatCurrencyVND(calculateTotal())}</span>
                                                </div>
                                            </div>

                                            <Button
                                                type='primary'
                                                htmlType='submit'
                                                block
                                                size="large"
                                                className="!h-14 !rounded-lg !font-bold !text-base"
                                                disabled={!cart || cart.cartItems.length === 0 || calculateTotal() < 2000}
                                            >
                                                {(!cart || cart.cartItems.length === 0)
                                                    ? 'Giá» hÃ ng trá»‘ng'
                                                    : calculateTotal() < 2000
                                                        ? `ThÃªm ${formatCurrencyVND(2000 - calculateTotal())} Ä‘á»ƒ Ä‘áº·t hÃ ng`
                                                        : 'Äáº¶T HÃ€NG NGAY'
                                                }
                                            </Button>
                                            <p className="text-center text-xs text-gray-400 mt-2">
                                                NhÃ¢n viÃªn sáº½ liÃªn há»‡ xÃ¡c nháº­n Ä‘Æ¡n hÃ ng qua Ä‘iá»‡n thoáº¡i
                                            </p>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty Cart State */
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                                <ShoppingCartOutlined className="text-6xl text-blue-300 dark:text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Giá» hÃ ng trá»‘ng</h2>
                            <p className="text-gray-400 mb-6 text-center max-w-md">
                                Báº¡n chÆ°a cÃ³ sáº£n pháº©m nÃ o trong giá» hÃ ng. HÃ£y khÃ¡m phÃ¡ cÃ¡c sáº£n pháº©m cÃ´ng nghá»‡ háº¥p dáº«n ngay!
                            </p>
                            <Link
                                href="/home"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-sm"
                            >
                                Tiáº¿p tá»¥c mua sáº¯m
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}