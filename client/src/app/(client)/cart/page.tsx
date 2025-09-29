'use client';
import CartProduct from "@/components/client/Cart/CartProduct";
import useCartStore from "@/hooks/useCart";
import { Button, Form, Input, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import Link from "next/link";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { CartPageSkeleton } from "@/components/Skeletons";



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

export default function CartClient() {
    const { cart, calculateTotal, updateQuantity, removeFromCart } = useCartStore();
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();
    const [selectedWard, setSelectedWard] = useState<number | undefined>();
    const [pageLoading, setPageLoading] = useState(true);
    const [loading, setLoading] = useState({
        provinces: false,
        districts: false,
        wards: false
    });

    // Mock saved addresses - in real app, this would come from user profile API
    const [savedAddresses] = useState([
        {
            id: 'home',
            label: 'Nhà riêng',
            province: { code: 79, name: 'TP Hồ Chí Minh' },
            district: { code: 760, name: 'Quận 1' },
            ward: { code: 26734, name: 'Phường Bến Nghé' },
            detailAddress: '123 Nguyễn Huệ',
            isDefault: true
        },
        {
            id: 'office',
            label: 'Văn phòng',
            province: { code: 79, name: 'TP Hồ Chí Minh' },
            district: { code: 769, name: 'Quận 7' },
            ward: { code: 27106, name: 'Phường Tân Thuận Đông' },
            detailAddress: '456 Nguyễn Thị Thập',
            isDefault: false
        }
    ]);

    const [form] = Form.useForm();

    // Load provinces on component mount
    useEffect(() => {
        const initialLoad = async () => {
            setPageLoading(true);
            await fetchProvinces();
            setPageLoading(false);
        }
        initialLoad();
    }, []);

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

        const address = savedAddresses.find(addr => addr.id === addressId);
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

    const handlePlaceOrder = async () => {
        // if (e.address === undefined && e.address_default === undefined) {
        //     toast.error("Địa chỉ giao hàng không được để trống")
        //     return;
        // }
        // else if (e.address === "" && e.address_default === "") {
        //     toast.error("Địa chỉ giao hàng không được để trống")
        //     return;
        // } else if (e.address_default === "default" && e.address === "") {
        //     toast.error("Địa chỉ giao hàng không được để trống")
        //     return;
        // } else if (e.fullname === undefined || e.fullname.trim() === "") {
        //     toast.error("Họ tên không được để trống")
        //     return;
        // } else if (e.email === undefined || e.email.trim() === "") {
        //     toast.error("Email không được để trống")
        //     return;
        // } else if (e.phone === undefined || e.phone.trim() === "") {
        //     toast.error("Điện thoại không được để trống")
        //     return;
        // }

        // if (cart && cart?.cartItems?.length <= 0) {
        //     toast.error("Bạn chưa mua sản phẩm nào !!")
        //     return;
        // }

        // const userInfo = {
        //     user_id: inforUser._id || "userVangLai",
        //     fullName: e.fullname,
        //     phone: e.phone,
        //     address: (e.address === "" || e.address === undefined) ? e.address_default : e.address,
        //     note: (e.note === "" || e.note === undefined) ? "" : e.note,
        //     email: e.email,
        // }

        // const products = carts.map(cart => (
        //     {
        //         product_id: cart._id,
        //         name: cart.title,
        //         unitPrice: cart.unitPrice,
        //         quanlity: cart.quanlity
        //     }
        // ));

        // let totalPrice = getTotalUnitPrice();

        // const data = {
        //     userInfo, products, totalPrice: totalPrice
        // }



        toast.success("Đặt hàng thành công !!")

        // const statusOrder = await post("order/checkout", data);
        // if (statusOrder.code === 200) {
        //     localStorage.setItem("cart", JSON.stringify([]));
        //     // navigation(`/order/success/${statusOrder.order_id}`)
        //     // setCarts([]);
        // }

    }

    if (pageLoading) {
        return <CartPageSkeleton />
    }


    return (
        <>
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
                        <div className='cart-list-product overflow-y-scroll' style={{ maxHeight: "550px", scrollbarWidth: "none" }}>
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
                            <p className='font-bold text-blue-500 text-lg md:text-2xl'>{calculateTotal().toLocaleString()} đ</p>
                        </div>
                    </div>
                    <div className='col-span-12 lg:col-span-5 py-3 px-5 border-solid border-2 rounded-lg shadow-xl border-blue-500'>
                        <h2 className='font-bold text-xl text-blue-500'>Thông tin thanh toán</h2>
                        <p className='my-5 font-medium text-base text-stone-500'>
                            Để tiếp tục đặt hàng, quý khách xin vui lòng
                            <Link href={"#"} className='text-blue-500 font-bold'> đăng nhập </Link>
                            để nhập thông tin bên dưới
                        </p>
                        <Form
                            form={form}
                            onFinish={handlePlaceOrder}
                            layout="vertical"
                            initialValues={{
                                // fullname: inforUser?.fullname,
                                // phone: inforUser?.phone,
                                // email: inforUser?.email,
                                fullname: "",
                                phone: "",
                                email: "",
                                savedAddress: "new"
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <Form.Item name='fullname' label="Họ và tên">
                                    <Input
                                        // defaultValue={inforUser?.fullname}
                                        name='fullname'
                                        className='text-base dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500 py-2 font-medium'
                                        placeholder='Nhập họ và tên'
                                    />
                                </Form.Item>
                                <Form.Item name='phone' label="Số điện thoại">
                                    <Input
                                        // defaultValue={inforUser?.phone} 
                                        name='phone'
                                        className='text-base dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500 py-2 font-medium'
                                        placeholder='Nhập số điện thoại'
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item name='email' label="Email">
                                <Input
                                    //  defaultValue={inforUser?.email} 
                                    name='email'
                                    className='text-base dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500 py-2 font-medium'
                                    placeholder='Nhập email'
                                />
                            </Form.Item>

                            {/* Saved Address Selection */}
                            <Form.Item name="savedAddress" label="Địa chỉ giao hàng">
                                <Select
                                    placeholder="Chọn địa chỉ có sẵn hoặc nhập mới"
                                    onChange={handleSavedAddressChange}
                                    className="w-full"
                                >
                                    <Select.Option value="new">📍 Nhập địa chỉ mới</Select.Option>
                                    {savedAddresses.map(address => (
                                        <Select.Option key={address.id} value={address.id}>
                                            {address.isDefault ? '🏠' : '🏢'} {address.label} - {address.detailAddress}, {address.ward.name}, {address.district.name}, {address.province.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* Address Details */}
                            <Form.Item name="province" label="Tỉnh/Thành phố">
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

                            <Form.Item name="district" label="Quận/Huyện">
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
                                <Form.Item name="ward" label="Phường/Xã">
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

                                <Form.Item name='detailAddress' label="Địa chỉ cụ thể">
                                    <Input
                                        className='text-base py-2 font-medium dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500'
                                        placeholder='Số nhà, tên đường...'
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item name='note' label="Ghi chú">
                                <TextArea name='note' rows={4} className='text-base font-medium dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500' placeholder='Ghi chú đơn hàng (tùy chọn)' />
                            </Form.Item>
                            <Button type='primary' htmlType='submit' className='!h-24 !block !text-center !w-full'>
                                <h2 className='font-bold uppercase text-2xl'>Đặt hàng</h2>
                                <div className='text-sm '>Tư vấn viên sẽ gọi điện thoại để xác nhận</div>
                            </Button>
                        </Form>
                    </div>
                </div >
            </div >
        </>
    );
}
