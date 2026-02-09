'use client';

import { Button, Card, Form, Input, Modal, Select, Tag, message, Popconfirm, Image } from "antd";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import {
    AddressPageSkeleton,
    ProfilePageSkeleton
} from "@/components/Skeletons";
import { accountGuestService } from "@/services/client/account.client.service";
import useAuthUser from "@/hooks/useAuthUser";
import { IAddress } from "@/types/account-guest";
import { DynamicMetadata } from "@/components/common/DynamicMetadata";

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

interface AddressFormValues {
    label: string;
    province: number;
    district: number;
    ward: number;
    detailAddress: string;
}

export default function ProfileAddress() {
    const { user } = useAuthUser();
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    // Address data
    const [addresses, setAddresses] = useState<IAddress[]>([]);

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

    const fetchUserAddresses = useCallback(async () => {
        if (!user?.id) return;

        try {
            const addresses = await accountGuestService.getAddresses();
            setAddresses(addresses || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            message.error('Không thể tải danh sách địa chỉ');
        }
    }, [user?.id]);

    // Load provinces and user addresses on component mount
    useEffect(() => {
        const loadData = async () => {
            setPageLoading(true);
            try {
                await fetchProvinces();
                if (user?.id) {
                    await fetchUserAddresses();
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
            } finally {
                setPageLoading(false);
            }
        }
        loadData();
    }, [user?.id, fetchUserAddresses]);

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

    const showModal = (address?: IAddress) => {
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
        setSelectedProvince(undefined);
        setSelectedDistrict(undefined);
        setDistricts([]);
        setWards([]);
    };

    const handleSubmit = async (values: AddressFormValues) => {
        if (!user?.id) {
            message.error('Không tìm thấy thông tin người dùng');
            return;
        }

        setSubmitting(true);
        try {
            const selectedProvinceName = provinces.find(p => p.code === values.province)?.name || '';
            const selectedDistrictName = districts.find(d => d.code === values.district)?.name || '';
            const selectedWardName = wards.find(w => w.code === values.ward)?.name || '';

            const addressData: Omit<IAddress, 'id'> = {
                label: values.label,
                province: { code: values.province, name: selectedProvinceName },
                district: { code: values.district, name: selectedDistrictName },
                ward: { code: values.ward, name: selectedWardName },
                detailAddress: values.detailAddress,
                isDefault: editingAddress?.isDefault || false
            };

            if (editingAddress) {
                // Update existing address
                await accountGuestService.updateAddress(user.id, editingAddress._id!, addressData);
                message.success('Cập nhật địa chỉ thành công!');
            } else {
                // Add new address
                await accountGuestService.addAddress(user.id, addressData);
                message.success('Thêm địa chỉ mới thành công!');
            }

            // Reload addresses
            await fetchUserAddresses();
            handleCancel();
        } catch (error) {
            console.error('Error saving address:', error);
            message.error('Có lỗi xảy ra khi lưu địa chỉ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (addressId: string) => {
        if (!user?.id) {
            message.error('Không tìm thấy thông tin người dùng');
            return;
        }

        const addressToDelete = addresses.find(addr => addr._id === addressId);
        if (addressToDelete?.isDefault) {
            message.error('Không thể xóa địa chỉ mặc định');
            return;
        }

        try {
            await accountGuestService.deleteAddress(addressId);
            message.success('Xóa địa chỉ thành công!');
            await fetchUserAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            message.error('Có lỗi xảy ra khi xóa địa chỉ');
        }
    };

    const handleSetDefault = async (addressId: string) => {
        if (!user?.id) {
            message.error('Không tìm thấy thông tin người dùng');
            return;
        }

        try {
            await accountGuestService.setDefaultAddress(addressId);
            message.success('Đã đặt làm địa chỉ mặc định!');
            await fetchUserAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            message.error('Có lỗi xảy ra khi đặt địa chỉ mặc định');
        }
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
            <DynamicMetadata
                title="Quản lý địa chỉ - PC Store"
                description="Quản lý địa chỉ giao hàng của bạn tại PC Store. Thêm, sửa, xóa địa chỉ để nhận hàng nhanh chóng và thuận tiện."
                keywords="quản lý địa chỉ, địa chỉ giao hàng, sổ địa chỉ, thêm địa chỉ"
                ogTitle="Quản lý địa chỉ giao hàng - PC Store"
                ogDescription="Quản lý địa chỉ nhận hàng một cách dễ dàng"
            />
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <Link href="/profile/detail" className="font-medium text-lg text-stone-500 dark:text-white mr-3">Hồ sơ người dùng</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-400 dark:text-white mr-3">Quản lý địa chỉ</h3>
                </div>

                <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                    <div className='col-span-12 lg:col-span-3'>
                        <div className='flex items-center'>
                            {user && user.avatar ? (
                                <Image src={user.avatar} alt="User Avatar" width={40} height={40} className="rounded-full" />
                            ) : (
                                <>
                                    <i className='fas fa-user-circle text-5xl text-blue-600'></i>
                                </>
                            )}
                            <div className='mx-4'>
                                <h6 className='text-base font-semibold'>Tài khoản của,</h6>
                                <h1 className='font-bold text-lg'>{user?.fullname || 'Người dùng'}</h1>
                            </div>
                        </div>
                        <ul className='pl-0 my-5'>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/detail"}>
                                <li className='inline-block'>
                                    <i className="fa-regular fa-user w-9"></i>
                                    <span className='font-medium'>Thông tin tài khoản</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/order"}>
                                <li className='inline-block'>
                                    <i className="far fa-list-alt w-9"></i>
                                    <span className='font-medium'>Tra cứu đơn hàng</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/wishlist"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-heart w-9"></i>
                                    <span className='font-medium'>Danh sách yêu thích</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 bg-blue-400 text-white px-5 rounded-lg' href={"/profile/address"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-location-dot w-9"></i>
                                    <span className='font-medium'>Quản lý địa chỉ</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/password"}>
                                <li className='inline-block'>
                                    <i className="fas fa-lock w-9"></i>
                                    <span className='font-medium'>Thay đổi mật khẩu</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/home"}>
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
                                    key={address._id}
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
                                                onClick={() => handleSetDefault(address._id!)}
                                            >
                                                Đặt mặc định
                                            </Button>
                                        ),
                                        !address.isDefault && (
                                            <Popconfirm
                                                key="delete"
                                                title="Xóa địa chỉ"
                                                description="Bạn có chắc chắn muốn xóa địa chỉ này?"
                                                onConfirm={() => handleDelete(address._id!)}
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
                                            {`${address.detailAddress}, ${address.ward.name}, ${address.district.name}, ${address.province.name}`}
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
                    destroyOnClose={false}
                    maskClosable={false}
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
                                loading={submitting}
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