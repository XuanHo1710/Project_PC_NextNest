'use client';
import CartProduct from "@/components/client/Cart/CartProduct";
import useCartStore from "@/hooks/useCart";
import { Button, Form, Input, Select, Empty, Divider, Avatar } from "antd";
import TextArea from "antd/es/input/TextArea";
import { ShoppingCartOutlined, SafetyCertificateOutlined, CarOutlined, CustomerServiceOutlined } from "@ant-design/icons";
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
import { accountGuestService } from "@/services/client";
import { formatCurrencyVND } from "@/utils/productHelpers";
import { District, IOrderData, Province, Ward } from "@/types";

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

    // Query user profile với TanStack Query
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
        staleTime: 5 * 60 * 1000, // 5 phút
        retry: 2,
        refetchOnWindowFocus: false
    });

    // Lấy saved addresses từ profile
    const savedAddresses = profile?.addresses || [];

    const [form] = Form.useForm();

    // Update form values khi profile được load
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
                toast.error('Không thể tải dữ liệu tỉnh/thành phố');
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
            toast.error('Không thể tải dữ liệu quận/huyện');
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
            toast.error('Không thể tải dữ liệu phường/xã');
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

        // Validate giỏ hàng không được trống
        if (!cart || cart.cartItems.length === 0) {
            toast.error("Giỏ hàng trống! Vui lòng thêm sản phẩm để đặt hàng.");
            return;
        }

        // Validate tổng tiền phải > 0 và >= đơn hàng tối thiểu
        const totalAmount = calculateTotal();
        // const minOrderAmount = 100000; // 100k VND

        // if (totalAmount <= 0) {
        //     toast.error("Tổng tiền đơn hàng không hợp lệ!");
        //     return;
        // }

        // if (totalAmount < minOrderAmount) {
        //     toast.error(`Đơn hàng tối thiểu ${minOrderAmount.toLocaleString()}đ! Hiện tại: ${totalAmount.toLocaleString()}đ`);
        //     return;
        // }

        // Validate địa chỉ đầy đủ
        if (!data.province || !data.district || !data.ward || !data.detailAddress) {
            toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng!");
            return;
        }

        // Tìm tên province, district, ward từ code
        const provinceName = provinces.find(p => p.code === data.province)?.name || '';
        const districtName = districts.find(d => d.code === data.district)?.name || '';
        const wardName = wards.find(w => w.code === data.ward)?.name || '';

        // Tạo đầy đủ địa chỉ
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
                title={`Giỏ hàng của bạn - PC Store`}
                description={`Xem lại giỏ hàng và hoàn tất đơn hàng của bạn tại PC Store. Miễn phí vận chuyển cho đơn hàng trên 2 triệu. Hỗ trợ trả góp 0%.`}
                keywords="giỏ hàng, thanh toán, mua hàng, đơn hàng, pc store"
                ogTitle={`Giỏ hàng`}
                ogDescription="Hoàn tất đơn hàng ngay để nhận ưu đãi miễn phí vận chuyển và trả góp 0%"
            />
            <div className="md:pt-4 pt-52 pb-10 dark:bg-slate-900 min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm py-3">
                        <Link href="/home" className="text-gray-500 hover:text-blue-500 transition-colors">Trang chủ</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-blue-500 font-medium">Giỏ hàng</span>
                    </nav>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="font-bold text-2xl lg:text-3xl text-gray-800 dark:text-white flex items-center gap-3">
                            <ShoppingCartOutlined className="text-blue-500" />
                            Giỏ hàng
                            <span className="text-base font-normal text-gray-400">
                                ({cart?.cartItems.length || 0} sản phẩm)
                            </span>
                        </h1>
                    </div>

                    {cart && cart.cartItems.length > 0 ? (
                        <div className="grid grid-cols-12 gap-6">
                            {/* Cart Items Column */}
                            <div className="col-span-12 lg:col-span-7">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                                    {/* Cart Header */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        <div className="col-span-6">Sản phẩm</div>
                                        <div className="col-span-2 text-center">Đơn giá</div>
                                        <div className="col-span-2 text-center">Số lượng</div>
                                        <div className="col-span-2 text-right">Thành tiền</div>
                                    </div>

                                    {/* Cart Items */}
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                                        {cart.cartItems.map((cartItem) => (
                                            <CartProduct
                                                key={cartItem.variant._id}
                                                cartItem={cartItem}
                                                handle={{ removeFromCart, updateQuantity }}
                                            />
                                        ))}
                                    </div>

                                    {/* Cart Summary Bar */}
                                    <div className="border-t-2 border-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 px-4 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-600 dark:text-gray-300 font-medium">
                                                    Tổng ({cart.cartItems.length} sản phẩm):
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl md:text-2xl text-blue-600 dark:text-blue-400">
                                                    {formatCurrencyVND(calculateTotal())}
                                                </p>
                                                {calculateTotal() >= 2000000 && (
                                                    <p className="text-xs text-green-600 mt-0.5 font-medium">
                                                        <CarOutlined className="mr-1" />Miễn phí vận chuyển
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {/* {calculateTotal() < 100000 && (
                                            <div className="mt-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-md">
                                                Đơn hàng tối thiểu 100.000đ. Thêm {formatCurrencyVND(100000 - calculateTotal())} nữa để đặt hàng.
                                            </div>
                                        )} */}
                                    </div>
                                </div>

                                {/* Trust badges */}
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                        <SafetyCertificateOutlined className="text-green-500 text-lg" />
                                        <span className="text-xs text-gray-600 dark:text-gray-300">Bảo hành chính hãng</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                        <CarOutlined className="text-blue-500 text-lg" />
                                        <span className="text-xs text-gray-600 dark:text-gray-300">Giao hàng toàn quốc</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                        <CustomerServiceOutlined className="text-orange-500 text-lg" />
                                        <span className="text-xs text-gray-600 dark:text-gray-300">Hỗ trợ 24/7</span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Form Column */}
                            <div className="col-span-12 lg:col-span-5">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                                    <div className="p-5">
                                        <h2 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-clipboard-list text-blue-500"></i>
                                            Thông tin đặt hàng
                                        </h2>

                                        {/* User Profile Badge */}
                                        {user && profile ? (
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 mb-4 border border-blue-100 dark:border-blue-800">
                                                <div className="flex items-center gap-3">
                                                    {profile.avatar ?
                                                        <Avatar src={profile.avatar} />
                                                        :
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
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
                                                    <Link href="#" className="text-blue-500 font-semibold hover:underline">Đăng nhập</Link>
                                                    {" "}để tự động điền thông tin và sử dụng địa chỉ đã lưu.
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
                                                    label={<span className="text-xs font-medium">Họ và tên</span>}
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập họ tên!' },
                                                        { min: 2, message: 'Tối thiểu 2 ký tự!' },
                                                        { max: 50, message: 'Tối đa 50 ký tự!' },
                                                    ]}
                                                    className="!mb-3"
                                                >
                                                    <Input placeholder="Nhập họ và tên" className="!py-2" />
                                                </Form.Item>
                                                <Form.Item
                                                    name='phone'
                                                    label={<span className="text-xs font-medium">Số điện thoại</span>}
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập SĐT!' },
                                                        { pattern: /^(0|84|\+84)[1-9][0-9]{8,9}$/, message: 'SĐT không hợp lệ!' },
                                                    ]}
                                                    className="!mb-3"
                                                >
                                                    <Input placeholder="Nhập số điện thoại" className="!py-2" />
                                                </Form.Item>
                                            </div>

                                            <Form.Item
                                                name='email'
                                                label={<span className="text-xs font-medium">Email</span>}
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email!' },
                                                    { type: 'email', message: 'Email không hợp lệ!' },
                                                ]}
                                                className="!mb-3"
                                            >
                                                <Input placeholder="Nhập email" className="!py-2" />
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
                                                                    <span className="text-sm">🏠</span>
                                                                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Địa chỉ mặc định</span>
                                                                    <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">{defaultAddr.label}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-300">{defaultAddr.detailAddress}</p>
                                                            </div>
                                                        );
                                                    })()}
                                                    <Form.Item
                                                        name="savedAddress"
                                                        label={<span className="text-xs font-medium">Địa chỉ giao hàng</span>}
                                                        className="!mb-3"
                                                    >
                                                        <Select
                                                            placeholder="Chọn địa chỉ hoặc nhập mới"
                                                            onChange={handleSavedAddressChange}
                                                            className="w-full"
                                                        >
                                                            <Select.Option value="new">+ Nhập địa chỉ mới</Select.Option>
                                                            {savedAddresses.map((address) => (
                                                                <Select.Option key={address._id} value={address._id}>
                                                                    {address.isDefault ? '🏠' : '📍'} {address.label} - {address.detailAddress}
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                <Form.Item
                                                    name="province"
                                                    label={<span className="text-xs font-medium">Tỉnh/Thành phố</span>}
                                                    rules={[{ required: true, message: 'Chọn tỉnh/TP!' }]}
                                                    className="!mb-3"
                                                >
                                                    <Select
                                                        placeholder="Chọn tỉnh/TP"
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
                                                    label={<span className="text-xs font-medium">Quận/Huyện</span>}
                                                    rules={[{ required: true, message: 'Chọn quận/huyện!' }]}
                                                    className="!mb-3"
                                                >
                                                    <Select
                                                        placeholder="Chọn quận/huyện"
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
                                                    label={<span className="text-xs font-medium">Phường/Xã</span>}
                                                    rules={[{ required: true, message: 'Chọn phường/xã!' }]}
                                                    className="!mb-3"
                                                >
                                                    <Select
                                                        placeholder="Chọn phường/xã"
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
                                                    label={<span className="text-xs font-medium">Địa chỉ cụ thể</span>}
                                                    rules={[
                                                        { required: true, message: 'Nhập địa chỉ!' },
                                                        { min: 5, message: 'Tối thiểu 5 ký tự!' },
                                                    ]}
                                                    className="!mb-3"
                                                >
                                                    <Input placeholder="Số nhà, tên đường..." className="!py-2" />
                                                </Form.Item>
                                            </div>

                                            <Form.Item
                                                name='note'
                                                label={<span className="text-xs font-medium">Ghi chú</span>}
                                                className="!mb-4"
                                            >
                                                <TextArea
                                                    rows={3}
                                                    placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                                                    showCount
                                                    maxLength={500}
                                                    className="!text-sm"
                                                />
                                            </Form.Item>

                                            {/* Order Summary */}
                                            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-3 mb-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Tạm tính ({cart.cartItems.length} sản phẩm)</span>
                                                    <span className="font-medium">{formatCurrencyVND(calculateTotal())}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Phí vận chuyển</span>
                                                    <span className="font-medium text-green-600">
                                                        {calculateTotal() >= 2000000 ? 'Miễn phí' : 'Tính khi giao hàng'}
                                                    </span>
                                                </div>
                                                <Divider className="!my-2" />
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-gray-800 dark:text-white">Tổng cộng</span>
                                                    <span className="font-bold text-xl text-red-500">{formatCurrencyVND(calculateTotal())}</span>
                                                </div>
                                            </div>

                                            <Button
                                                type='primary'
                                                htmlType='submit'
                                                block
                                                size="large"
                                                className="!h-14 !rounded-lg !font-bold !text-base"
                                                // disabled={!cart || cart.cartItems.length === 0 || calculateTotal() < 100000}
                                                disabled={!cart || cart.cartItems.length === 0}

                                            >
                                                {(!cart || cart.cartItems.length === 0)
                                                    ? 'Giỏ hàng trống'
                                                    // : calculateTotal() < 100000
                                                    //     ? `Thêm ${formatCurrencyVND(100000 - calculateTotal())} để đặt hàng`
                                                    : 'ĐẶT HÀNG NGAY'
                                                }
                                            </Button>
                                            <p className="text-center text-xs text-gray-400 mt-2">
                                                Nhân viên sẽ liên hệ xác nhận đơn hàng qua điện thoại
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
                            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Giỏ hàng trống</h2>
                            <p className="text-gray-400 mb-6 text-center max-w-md">
                                Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm công nghệ hấp dẫn ngay!
                            </p>
                            <Link
                                href="/home"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-sm"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}