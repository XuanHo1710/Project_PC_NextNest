'use client';

import { Button, Form, Input, Select, message, Avatar, Upload, Image } from "antd";
import Link from "next/link";
import { useState, useEffect } from "react";
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import Breadcrumb from '@/components/client/Breadcrumb/Breadcrumb';
import type { UploadProps } from 'antd';
import {
    DetailPageSkeleton,
    ProfilePageSkeleton
} from "@/components/Skeletons";
import useAuthUser from "@/hooks/useAuthUser";
import { IAccountGuest } from "@/types/account-guest";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { accountGuestService } from "@/services/client";
import { UploadImage } from "@/utils/uploadImage";
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import ProfileSidebar from '@/components/client/ProfileSidebar/ProfileSidebar';

interface ProfileFormValues {
    fullname: string;
    email: string;
    phone: string;
    gender?: string;
    avatar?: string;
}



export default function ProfileDetail() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [fileUrl, setFileUrl] = useState<File | null>(null);

    const { user, setUser } = useAuthUser();
    const queryClient = useQueryClient();

    const { data: guest, isLoading } = useQuery<IAccountGuest | null>({
        queryKey: ['profile-guest', user?.id],
        queryFn: () => accountGuestService.getProfile(),
        enabled: !!user?.id,
    });



    const handleSubmit = async (values: ProfileFormValues) => {
        setLoading(true);
        try {
            const inforGuestUpdate: Record<string, any> = {
                fullname: values.fullname,
                phone: values.phone,
                gender: values.gender,
            };

            if (fileUrl) {
                const avatarUploadedUrl: string = await UploadImage(fileUrl);
                inforGuestUpdate.avatar = avatarUploadedUrl;
            }

            const guestUpdated = await accountGuestService.updateProfile(inforGuestUpdate as Partial<IAccountGuest>);
            message.success('Cập nhật thông tin thành công!');
            queryClient.invalidateQueries({ queryKey: ['profile-guest'] });
            setUser({
                ...user,
                avatar: guestUpdated.avatar,
            });
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
            console.log(guest)
            form.setFieldsValue({
                fullname: guest?.fullname,
                email: guest?.email,
                phone: guest?.phone,
                gender: guest?.gender,
            });
            if (guest?.avatar) {
                setAvatarUrl(guest.avatar);
            }
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
            <DynamicMetadata
                title="Thông tin cá nhân - PC Store"
                description="Quản lý thông tin cá nhân, cập nhật hồ sơ người dùng tại PC Store. Cập nhật thông tin để nhận ưu đãi và quà tặng hấp dẫn."
                keywords="thông tin cá nhân, hồ sơ, tài khoản, cập nhật thông tin"
                ogTitle="Quản lý thông tin cá nhân - PC Store"
                ogDescription="Cập nhật và quản lý thông tin cá nhân của bạn"
            />
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className='mx-5 xl:mx-32'>
                    <Breadcrumb items={[
                        { label: 'Hồ sơ người dùng', href: '/profile/detail' },
                        { label: 'Thông tin chi tiết' },
                    ]} />
                </div>

                <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                    <ProfileSidebar user={user} activePage="detail" />

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
                                name="gender"
                                label={<span className="dark:text-white font-medium">Giới tính</span>}
                            >
                                <Select
                                    className="dark:bg-gray-700"
                                    placeholder="Chọn giới tính"
                                >
                                    <Select.Option value="MALE">Nam</Select.Option>
                                    <Select.Option value="FEMALE">Nữ</Select.Option>
                                    <Select.Option value="OTHER">Khác</Select.Option>
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