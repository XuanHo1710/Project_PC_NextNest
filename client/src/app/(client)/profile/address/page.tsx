'use client';

import { Button, Card, Form, Input, Modal, Select, Tag, message, Popconfirm } from "antd";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import {
    AddressPageSkeleton,
    ProfilePageSkeleton
} from "@/components/Skeletons";

interface Province {
    code: number;
    name: string;
}

interface District {
    code: number;
    name: string;
}

interface Ward {
    code: number;
    name: string;
}

interface Address {
    id: string;
    label: string;
    province: { code: number; name: string };
    district: { code: number; name: string };
    ward: { code: number; name: string };
    detailAddress: string;
    fullAddress: string;
    isDefault: boolean;
}

interface AddressFormValues {
    label: string;
    province: number;
    district: number;
    ward: number;
    detailAddress: string;
}

export default function ProfileAddress() {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Address data
    const [addresses, setAddresses] = useState<Address[]>([
        {
            id: '1',
            label: 'Nhà riêng',
            province: { code: 79, name: 'TP. Hồ Chí Minh' },
            district: { code: 760, name: 'Quận 1' },
            ward: { code: 26734, name: 'Phường Bến Nghé' },
            detailAddress: '123 Nguyễn Huệ',
            fullAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            isDefault: true
        },
        {
            id: '2',
            label: 'Công ty',
            province: { code: 79, name: 'TP. Hồ Chí Minh' },
            district: { code: 769, name: 'Quận 3' },
            ward: { code: 27166, name: 'Phường 1' },
            detailAddress: '456 Lê Văn Sỹ',
            fullAddress: '456 Lê Văn Sỹ, Phường 1, Quận 3, TP. Hồ Chí Minh',
            isDefault: false
        }
    ]);

    // API data
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    // Loading states
    const [loading, setLoading] = useState({
        provinces: false,
        districts: false,
        wards: false
    });

    // Selected values
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();

    // Load provinces on component mount
    useEffect(() => {
        const loadData = async () => {
            setPageLoading(true);
            await fetchProvinces();
            // In a real app, you would fetch user addresses here
            setPageLoading(false);
        }
        loadData();
    }, []);

    const fetchProvinces = async () => {
        setLoading(prev => ({ ...prev, provinces: true }));
        try {
            const response = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await response.json();
            setProvinces(data);
        } catch (error) {
            console.error('Error fetching provinces:', error);
            message.error('Không thể tải danh sách tỉnh/thành phố');
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
        } catch (error) {
            console.error('Error fetching districts:', error);
            message.error('Không thể tải danh sách quận/huyện');
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
        } catch (error) {
            console.error('Error fetching wards:', error);
            message.error('Không thể tải danh sách phường/xã');
        } finally {
            setLoading(prev => ({ ...prev, wards: false }));
        }
    };

    const handleProvinceChange = (value: number) => {
        setSelectedProvince(value);
        setSelectedDistrict(undefined);
        setDistricts([]);
        setWards([]);
        form.setFieldsValue({ district: undefined, ward: undefined });
        fetchDistricts(value);
    };

    const handleDistrictChange = (value: number) => {
        setSelectedDistrict(value);
        setWards([]);
        form.setFieldsValue({ ward: undefined });
        fetchWards(value);
    };

    const showModal = (address?: Address) => {
        setEditingAddress(address || null);
        setIsModalOpen(true);

        if (address) {
            // Set form values for editing
            form.setFieldsValue({
                label: address.label,
                province: address.province.code,
                district: address.district.code,
                ward: address.ward.code,
                detailAddress: address.detailAddress
            });

            // Load cascade data
            setSelectedProvince(address.province.code);
            fetchDistricts(address.province.code);
            setSelectedDistrict(address.district.code);
            fetchWards(address.district.code);
        } else {
            form.resetFields();
            setSelectedProvince(undefined);
            setSelectedDistrict(undefined);
            setDistricts([]);
            setWards([]);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingAddress(null);
        form.resetFields();
    };

    const handleSubmit = async (values: AddressFormValues) => {
        try {
            const selectedProvinceName = provinces.find(p => p.code === values.province)?.name || '';
            const selectedDistrictName = districts.find(d => d.code === values.district)?.name || '';
            const selectedWardName = wards.find(w => w.code === values.ward)?.name || '';

            const fullAddress = `${values.detailAddress}, ${selectedWardName}, ${selectedDistrictName}, ${selectedProvinceName}`;

            const addressData: Address = {
                id: editingAddress?.id || Date.now().toString(),
                label: values.label,
                province: { code: values.province, name: selectedProvinceName },
                district: { code: values.district, name: selectedDistrictName },
                ward: { code: values.ward, name: selectedWardName },
                detailAddress: values.detailAddress,
                fullAddress: fullAddress,
                isDefault: editingAddress?.isDefault || false
            };

            if (editingAddress) {
                // Update existing address
                setAddresses(prev => prev.map(addr =>
                    addr.id === editingAddress.id ? addressData : addr
                ));
                message.success('Cập nhật địa chỉ thành công!');
            } else {
                // Add new address
                setAddresses(prev => [...prev, addressData]);
                message.success('Thêm địa chỉ mới thành công!');
            }

            handleCancel();
        } catch (error) {
            console.error('Error saving address:', error);
            message.error('Có lỗi xảy ra khi lưu địa chỉ');
        }
    };

    const handleDelete = (addressId: string) => {
        const addressToDelete = addresses.find(addr => addr.id === addressId);
        if (addressToDelete?.isDefault) {
            message.error('Không thể xóa địa chỉ mặc định');
            return;
        }

        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        message.success('Xóa địa chỉ thành công!');
    };

    const handleSetDefault = (addressId: string) => {
        setAddresses(prev => prev.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
        })));
        message.success('Đã đặt làm địa chỉ mặc định!');
    };

    if (pageLoading) {
        return (
            <ProfilePageSkeleton>
                <AddressPageSkeleton />
            </ProfilePageSkeleton>
        )
    }

    return (
        <>
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <Link href="/profile" className="font-medium text-lg text-stone-500 dark:text-white mr-3">Hồ sơ người dùng</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-400 dark:text-white mr-3">Quản lý địa chỉ</h3>
                </div>

                <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                    <div className='col-span-12 lg:col-span-3'>
                        <div className='flex items-center'>
                            <i className='fas fa-user-circle text-5xl text-blue-600'></i>
                            <div className='mx-4'>
                                <h6 className='text-base font-semibold'>Tài khoản của,</h6>
                                <h1 className='font-bold text-lg'>Nguyễn Xuân Hồ</h1>
                            </div>
                        </div>
                        <ul className='pl-0 my-5'>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/profile/detail"}>
                                <li className='inline-block'>
                                    <i className="fa-regular fa-user w-9"></i>
                                    <span className='font-medium'>Thông tin tài khoản</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/profile/order"}>
                                <li className='inline-block'>
                                    <i className="far fa-list-alt w-9"></i>
                                    <span className='font-medium'>Tra cứu đơn hàng</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 bg-blue-400 text-white px-5 rounded-lg' href={"/profile/address"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-location-dot w-9"></i>
                                    <span className='font-medium'>Quản lý địa chỉ</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/profile/password"}>
                                <li className='inline-block'>
                                    <i className="fas fa-lock w-9"></i>
                                    <span className='font-medium'>Thay đổi mật khẩu</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/home"}>
                                <li className='inline-block'>
                                    <i className="fas fa-sign-out-alt w-9"></i>
                                    <span className='font-medium'>Đăng xuất</span>
                                </li>
                            </Link>
                        </ul>
                    </div>

                    <div className='col-span-12 lg:col-span-9 p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 dark:text-white'>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className='text-xl font-bold border-solid border-b-2 border-blue-200 dark:border-slate-900 pb-3'>
                                Quản lý địa chỉ giao hàng
                            </h2>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => showModal()}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                Thêm địa chỉ mới
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {addresses.map((address) => (
                                <Card
                                    key={address.id}
                                    className={`relative ${address.isDefault ? 'border-blue-500 border-2' : ''}`}
                                    actions={[
                                        <Button
                                            key="edit"
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={() => showModal(address)}
                                        >
                                            Chỉnh sửa
                                        </Button>,
                                        !address.isDefault && (
                                            <Button
                                                key="default"
                                                type="text"
                                                icon={<HomeOutlined />}
                                                onClick={() => handleSetDefault(address.id)}
                                            >
                                                Đặt mặc định
                                            </Button>
                                        ),
                                        !address.isDefault && (
                                            <Popconfirm
                                                key="delete"
                                                title="Xóa địa chỉ"
                                                description="Bạn có chắc chắn muốn xóa địa chỉ này?"
                                                onConfirm={() => handleDelete(address.id)}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                            >
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                >
                                                    Xóa
                                                </Button>
                                            </Popconfirm>
                                        )
                                    ].filter(Boolean)}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{address.label}</h3>
                                            {address.isDefault && (
                                                <Tag color="blue" icon={<HomeOutlined />}>
                                                    Mặc định
                                                </Tag>
                                            )}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {address.fullAddress}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {addresses.length === 0 && (
                            <div className="text-center py-8">
                                <i className="fa-solid fa-location-dot text-6xl text-gray-300 mb-4"></i>
                                <p className="text-gray-500 text-lg mb-4">Chưa có địa chỉ nào được lưu</p>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => showModal()}
                                    className="bg-blue-500 hover:bg-blue-600"
                                >
                                    Thêm địa chỉ đầu tiên
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Address Modal */}
                <Modal
                    title={editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                    open={isModalOpen}
                    onCancel={handleCancel}
                    footer={null}
                    width={600}
                    destroyOnClose
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        className="mt-4"
                    >
                        <Form.Item
                            name="label"
                            label="Nhãn địa chỉ"
                            rules={[{ required: true, message: 'Vui lòng nhập nhãn địa chỉ!' }]}
                        >
                            <Input
                                placeholder="VD: Nhà riêng, Công ty, Nhà bạn..."
                                className="py-2"
                            />
                        </Form.Item>

                        <Form.Item
                            name="province"
                            label="Tỉnh/Thành phố"
                            rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
                        >
                            <Select
                                placeholder="Chọn tỉnh/thành phố"
                                loading={loading.provinces}
                                onChange={handleProvinceChange}
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
                            rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
                        >
                            <Select
                                placeholder="Chọn quận/huyện"
                                loading={loading.districts}
                                onChange={handleDistrictChange}
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

                        <Form.Item
                            name="ward"
                            label="Phường/Xã"
                            rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
                        >
                            <Select
                                placeholder="Chọn phường/xã"
                                loading={loading.wards}
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
                            name="detailAddress"
                            label="Địa chỉ cụ thể"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
                        >
                            <Input.TextArea
                                placeholder="Số nhà, tên đường..."
                                rows={2}
                            />
                        </Form.Item>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button onClick={handleCancel}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                {editingAddress ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </Form>
                </Modal>
            </div>
        </>
    );
}