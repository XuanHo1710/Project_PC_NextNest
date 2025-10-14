'use client';
import CartProduct from "@/components/client/Cart/CartProduct";
import useCartStore from "@/hooks/useCart";
import { Button, Form, Input, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import Link from "next/link";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { CartPageSkeleton } from "@/components/Skeletons";
import useAuthUser from "@/hooks/useAuthUser";
import { IGuest } from "@/types/account";
import { useQuery } from "@tanstack/react-query";
import { guestClientService } from "@/services/client";
import { useRouter } from "next/navigation";
import { IOrderData } from "@/types/model.client";
import { DynamicMetadata } from "@/components/common/DynamicMetadata";



interface Province {
    code: number;
    name: string;
    districts: District[];
}

interface District {
    code: number;
    name: string;
    wards: Ward[];
}

interface Ward {
    code: number;
    name: string;
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

    // Query user profile với TanStack Query
    const {
        data: profile,
        isLoading: isLoadingProfile
    } = useQuery<IGuest | null>({
        queryKey: ['user-profile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            return await guestClientService.getProfile(user.id);
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
            form.setFieldsValue({
                fullname: profile.fullname || "",
                phone: profile.phone || "",
                email: profile.email || "",
                savedAddress: profile.addresses && profile.addresses.length > 0 && "new",
                note: ""
            });
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
        const minOrderAmount = 100000; // 100k VND

        if (totalAmount <= 0) {
            toast.error("Tổng tiền đơn hàng không hợp lệ!");
            return;
        }

        if (totalAmount < minOrderAmount) {
            toast.error(`Đơn hàng tối thiểu ${minOrderAmount.toLocaleString()}đ! Hiện tại: ${totalAmount.toLocaleString()}đ`);
            return;
        }

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
            guestId: user?.id || "guest",
            customerInfo: {
                fullname: data.fullname,
                phone: data.phone,
                email: data.email,
                address: fullAddress,
                note: data.note || ''
            },
            orderDetail: cart.cartItems,
            totalAmount: totalAmount,
            orderDate: new Date(),
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
            <div className="md:pt-3 pt-52 dark:bg-slate-900">
                <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg dark:text-white text-blue-500 mr-3">Thông tin giỏ hàng</h3>
                </div>
                <h1 className='mx-5 xl:mx-32 py-2 border-b-blue-400 border-solid border-b-2 md:w-2/3 xl:w-1/3 font-bold text-xl lg:text-3xl uppercase text-blue-500'>Giỏ hàng của tôi
                    <span className='ml-2 text-sm border-none text-stone-400 lowercase font-medium'>({cart?.cartItems.length} sản phẩm)</span>
                </h1>
                <div className='mx-5 xl:mx-32 mt-5 pb-10 content-body grid grid-flow-row grid-cols-12 gap-8 '>
                    <div className='col-span-12 lg:col-span-7 max-h-max bg-white shadow-lg rounded-lg'>
                        <div className='cart-list-product overflow-y-scroll' style={{ maxHeight: "700px", scrollbarWidth: "none" }}>
                            {cart && cart.cartItems.length > 0 ?
                                cart.cartItems.map((cartItem, index) => (
                                    <CartProduct key={index} cartItem={cartItem} handle={{ removeFromCart, updateQuantity }} />
                                ))
                                :
                                <div className='text-center flex flex-col py-10 cursor-default font-bold text-2xl text-blue-400 dark:bg-slate-900 border-solid border-t-[1px] border-x-[1px] border-blue-500'>
                                    <span> Không có sản phẩm nào trong giỏ hàng</span>
                                    <i className="py-10 text-blue-200 block fa-solid fa-cart-shopping text-8xl"></i>
                                </div>
                            }

                        </div>
                        <div className='subtotal border-solid border-[1px] border-blue-500 p-4 flex items-center justify-between dark:bg-slate-900 dark:text-white'>
                            <h2 className='dark:text-white font-bold text-stone-500'>Tổng giá trị đơn hàng: </h2>
                            <div className="text-right">
                                <p className='font-bold text-blue-500 text-lg md:text-2xl'>{calculateTotal().toLocaleString()} đ</p>
                                {calculateTotal() < 100000 && (
                                    <p className="text-xs text-orange-500 mt-1">
                                        ⚠️ Đơn hàng tối thiểu 100.000đ
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='col-span-12 lg:col-span-5 py-3 px-5 border-solid border-2 rounded-lg shadow-xl border-blue-500'>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className='font-bold text-xl text-blue-500'>Thông tin thanh toán</h2>
                            {user && profile && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-green-600 font-medium">Đã đăng nhập</span>
                                </div>
                            )}
                        </div>

                        {/* Hiển thị thông tin user khi đã đăng nhập */}
                        {user && profile ? (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {profile.fullname.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-blue-800 dark:text-blue-300">{profile.fullname}</p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">{profile.email}</p>
                                        {profile.phone && (
                                            <p className="text-sm text-blue-600 dark:text-blue-400">{profile.phone}</p>
                                        )}
                                    </div>
                                </div>
                                {profile.addresses.length > 0 && (
                                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                        📍 {profile.addresses.length} địa chỉ đã lưu
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className='my-5 font-medium text-base text-stone-500'>
                                Để tiếp tục đặt hàng, quý khách xin vui lòng
                                <Link href={"#"} className='text-blue-500 font-bold'> đăng nhập </Link>
                                để nhập thông tin bên dưới
                            </p>
                        )}

                        <Form
                            form={form}
                            onFinish={handlePlaceOrder}
                            layout="vertical"
                            initialValues={{
                                fullname: profile?.fullname || "",
                                phone: profile?.phone || "",
                                email: profile?.email || "",
                                savedAddress: profile?.addresses && profile.addresses.length > 0 ? profile.addresses[0]._id : "new",
                                note: ""
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <Form.Item
                                    name='fullname'
                                    label="Họ và tên"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập họ và tên!' },
                                        { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' },
                                        { max: 50, message: 'Họ tên không được vượt quá 50 ký tự!' },
                                        { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Họ tên chỉ được chứa chữ cái và khoảng trắng!' }
                                    ]}
                                >
                                    <Input
                                        name='fullname'
                                        className='text-base dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500 py-2 font-medium'
                                        placeholder='Nhập họ và tên'
                                    />
                                </Form.Item>
                                <Form.Item
                                    name='phone'
                                    label="Số điện thoại"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                        { pattern: /^(0|84|\+84)[1-9][0-9]{8,9}$/, message: 'Số điện thoại không hợp lệ!' },
                                        { min: 10, message: 'Số điện thoại phải có ít nhất 10 số!' },
                                        { max: 12, message: 'Số điện thoại không được vượt quá 12 số!' }
                                    ]}
                                >
                                    <Input
                                        name='phone'
                                        className='text-base dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500 py-2 font-medium'
                                        placeholder='Nhập số điện thoại'
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item
                                name='email'
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' },
                                    { max: 100, message: 'Email không được vượt quá 100 ký tự!' }
                                ]}
                            >
                                <Input
                                    name='email'
                                    className='text-base dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500 py-2 font-medium'
                                    placeholder='Nhập email'
                                />
                            </Form.Item>

                            {/* Saved Address Selection - Chỉ hiện khi user đã đăng nhập */}
                            {user && profile && savedAddresses.length > 0 && (
                                <Form.Item name="savedAddress" label="Địa chỉ giao hàng">
                                    <Select
                                        placeholder="Chọn địa chỉ có sẵn hoặc nhập mới"
                                        onChange={handleSavedAddressChange}
                                        className="w-full"
                                    >
                                        <Select.Option value="new">📍 Nhập địa chỉ mới</Select.Option>
                                        {savedAddresses.map((address) => (
                                            <Select.Option key={address._id} value={address._id}>
                                                {address.isDefault ? '🏠' : '🏢'} {address.label} - {address.detailAddress}, {address.ward.name}, {address.district.name}, {address.province.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}

                            {/* Address form - Luôn hiển thị để có thể nhập địa chỉ mới */}
                            <Form.Item
                                name="province"
                                label="Tỉnh/Thành phố"
                                rules={[
                                    { required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }
                                ]}
                            >
                                <Select
                                    placeholder="Chọn tỉnh/thành phố"
                                    loading={loading.provinces}
                                    onChange={handleProvinceChange}
                                    value={selectedProvince}
                                    className="w-full"
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
                                label="Quận/Huyện"
                                rules={[
                                    { required: true, message: 'Vui lòng chọn quận/huyện!' }
                                ]}
                            >
                                <Select
                                    placeholder="Chọn quận/huyện"
                                    loading={loading.districts}
                                    onChange={handleDistrictChange}
                                    value={selectedDistrict}
                                    className="w-full"
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


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Form.Item
                                    name="ward"
                                    label="Phường/Xã"
                                    rules={[
                                        { required: true, message: 'Vui lòng chọn phường/xã!' }
                                    ]}
                                >
                                    <Select
                                        placeholder="Chọn phường/xã"
                                        loading={loading.wards}
                                        onChange={handleWardChange}
                                        value={selectedWard}
                                        className="w-full"
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
                                    label="Địa chỉ cụ thể"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' },
                                        { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự!' },
                                        { max: 200, message: 'Địa chỉ không được vượt quá 200 ký tự!' }
                                    ]}
                                >
                                    <Input
                                        className='text-base py-2 font-medium dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500'
                                        placeholder='Số nhà, tên đường...'
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item
                                name='note'
                                label="Ghi chú"
                                rules={[
                                    { max: 500, message: 'Ghi chú không được vượt quá 500 ký tự!' }
                                ]}
                            >
                                <TextArea
                                    name='note'
                                    rows={4}
                                    className='text-base font-medium dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500'
                                    placeholder='Ghi chú đơn hàng (tùy chọn)'
                                    showCount
                                    maxLength={500}
                                />
                            </Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                                className='!h-24 !block !text-center !w-full'
                                disabled={!cart || cart.cartItems.length === 0 || calculateTotal() < 100000}
                                loading={false}
                            >
                                <h2 className='font-bold uppercase text-2xl'>
                                    {(!cart || cart.cartItems.length === 0)
                                        ? 'Giỏ hàng trống'
                                        : calculateTotal() < 100000
                                            ? 'Chưa đủ đơn tối thiểu'
                                            : 'Đặt hàng'
                                    }
                                </h2>
                                <div className='text-sm'>
                                    {(!cart || cart.cartItems.length === 0)
                                        ? 'Vui lòng thêm sản phẩm vào giỏ hàng'
                                        : calculateTotal() < 100000
                                            ? 'Đơn hàng tối thiểu 100.000đ'
                                            : 'Tư vấn viên sẽ gọi điện thoại để xác nhận'
                                    }
                                </div>
                            </Button>
                        </Form>
                    </div>
                </div >
            </div >
        </>
    );
}