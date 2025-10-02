'use client';

import { Button, Form, Input, DatePicker, Select, message, Avatar, Upload } from "antd";
import Link from "next/link";
import { useState, useEffect } from "react";
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {
    DetailPageSkeleton,
    ProfilePageSkeleton
} from "@/components/Skeletons";
import dayjs from 'dayjs';
import useAuthUser from "@/hooks/useAuthUser";
import { IGuest } from "@/types/account";
import { useQuery } from "@tanstack/react-query";
import { guestClientService } from "@/services/client";
import { UploadImage } from "@/utils/uploadImage";

interface ProfileFormValues {
    fullname: string;
    email: string;
    phone: string;
    dateOfBirth?: dayjs.Dayjs;
    gender?: string;
    avatar?: string;
}



export default function ProfileDetail() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [fileUrl, setFileUrl] = useState<File | null>(null);

    const { user } = useAuthUser();

    const { data: guest, isLoading } = useQuery<IGuest | null>({
        queryKey: ['profile-guest', user?.id], // key để cache
        queryFn: () => guestClientService.getProfile(user?.id || ''),
        enabled: !!user?.id, // chỉ chạy query khi userId tồn tại
    });



    const handleSubmit = async (values: ProfileFormValues) => {
        setLoading(true);
        try {

            if (fileUrl) {
                const avatarUploadedUrl: string = await UploadImage(fileUrl);
                console.log('Uploaded Avatar URL:', avatarUploadedUrl);
                // TODO: Implement API call to update profile
                console.log('Profile update values:', {
                    ...values,
                    dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
                    avatar: avatarUrl
                });

                const inforGuestUpdate = {
                    fullname: values.fullname,
                    phone: values.phone,
                    birthday: values.dateOfBirth?.format('YYYY-MM-DD'),
                    avatar: avatarUploadedUrl,
                    gender: values.gender
                }

                await guestClientService.updateProfile(user?.id || '', inforGuestUpdate as Partial<IGuest>);
            } else {
                const inforGuestUpdate = {
                    fullname: values.fullname,
                    phone: values.phone,
                    birthday: values.dateOfBirth?.format('YYYY-MM-DD'),
                    gender: values.gender
                }
                await guestClientService.updateProfile(user?.id || '', inforGuestUpdate as Partial<IGuest>);

            }
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            message.success('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps: UploadProps = {
        name: 'avatar',
        listType: 'picture-card',
        className: 'avatar-uploader',
        showUploadList: false,
        accept: 'image/*',
        beforeUpload: async (file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('Chỉ có thể upload file JPG/PNG!');
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Ảnh phải nhỏ hơn 2MB!');
                return false;
            }
            setFileUrl(file as File)

            // Convert to base64 for preview
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
            return false; // Prevent auto upload
        },
    };

    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 20,
        },
    };

    // Set form values when guest data is loaded
    useEffect(() => {
        if (guest && !isLoading) {
            form.setFieldsValue({
                fullname: guest?.fullname,
                email: guest?.email,
                phone: guest?.phone,
                dateOfBirth: guest?.birthday ? dayjs(guest.birthday) : undefined,
                gender: guest?.gender,
            });
        }
    }, [guest, isLoading, form]);

    if (isLoading) {
        return (
            <ProfilePageSkeleton>
                <DetailPageSkeleton />
            </ProfilePageSkeleton>
        )
    }

    return (
        <>
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <Link href="/profile/detail" className="font-medium text-lg text-stone-500 dark:text-white mr-3">Hồ sơ người dùng</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-400 dark:text-white mr-3">Thông tin chi tiết</h3>
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
                            <Link className='font-medium block my-3 py-3 bg-blue-400 text-white px-5 rounded-lg' href={"/profile/detail"}>
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
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/profile/address"}>
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
                        <h2 className='text-xl font-bold pb-3 border-solid border-b-2 border-blue-200 dark:border-slate-900 dark:text-white mb-6'>
                            Cập nhật thông tin cá nhân
                        </h2>

                        {/* Avatar Section */}
                        <div className="flex items-center mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Avatar
                                size={80}
                                src={avatarUrl || guest?.avatar}
                                icon={<UserOutlined />}
                                className="mr-4"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2">Ảnh đại diện</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                    Chọn ảnh đại diện để hiển thị trên hồ sơ của bạn
                                </p>
                                <Upload {...uploadProps}>
                                    <Button icon={<CameraOutlined />}>
                                        Thay đổi ảnh
                                    </Button>
                                </Upload>
                            </div>
                        </div>

                        <Form
                            form={form}
                            {...layout}
                            onFinish={handleSubmit}
                            labelAlign="left"
                            className="space-y-4"
                        >
                            <Form.Item
                                name="fullname"
                                label={<span className="dark:text-white font-medium">Họ và tên</span>}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập họ và tên!' },
                                    { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                                ]}
                            >
                                <Input
                                    className="py-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập họ và tên"
                                />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label={<span className="dark:text-white font-medium">Email</span>}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    className="py-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập địa chỉ email"
                                    disabled // Email thường không cho phép thay đổi
                                />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label={<span className="dark:text-white font-medium">Số điện thoại</span>}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    className="py-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập số điện thoại"
                                />
                            </Form.Item>

                            <Form.Item
                                name="dateOfBirth"
                                label={<span className="dark:text-white font-medium">Ngày sinh</span>}
                            >
                                <DatePicker
                                    className="w-full py-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Chọn ngày sinh"
                                    format="DD/MM/YYYY"
                                    disabledDate={(current) => current && current > dayjs().subtract(13, 'year')}
                                />
                            </Form.Item>

                            <Form.Item
                                name="gender"
                                label={<span className="dark:text-white font-medium">Giới tính</span>}
                            >
                                <Select
                                    className="dark:bg-gray-700"
                                    placeholder="Chọn giới tính"
                                >
                                    <Select.Option value="male">Nam</Select.Option>
                                    <Select.Option value="female">Nữ</Select.Option>
                                    <Select.Option value="other">Khác</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item wrapperCol={{ offset: 4, span: 20 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="bg-blue-500 hover:bg-blue-600 font-bold py-2 px-8"
                                    size="large"
                                >
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                Lưu ý:
                            </h3>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                <li>• Email không thể thay đổi sau khi đã xác thực</li>
                                <li>• Thông tin cá nhân sẽ được sử dụng cho các đơn hàng của bạn</li>
                                <li>• Vui lòng cung cấp thông tin chính xác để tránh sai sót khi giao hàng</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}