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
        queryKey: ['profile-guest', user?._id],
        queryFn: () => accountGuestService.getProfile(),
        enabled: !!user?._id,
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
            message.success('Cáº­p nháº­t thÃ´ng tin thÃ nh cÃ´ng!');
            queryClient.invalidateQueries({ queryKey: ['profile-guest'] });
            setUser({
                ...user,
                avatar: guestUpdated.avatar,
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('CÃ³ lá»—i xáº£y ra khi cáº­p nháº­t thÃ´ng tin');
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
                message.error('Chá»‰ cÃ³ thá»ƒ upload file JPG/PNG!');
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('áº¢nh pháº£i nhá» hÆ¡n 2MB!');
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
                title="ThÃ´ng tin cÃ¡ nhÃ¢n - PC Store"
                description="Quáº£n lÃ½ thÃ´ng tin cÃ¡ nhÃ¢n, cáº­p nháº­t há»“ sÆ¡ ngÆ°á»i dÃ¹ng táº¡i PC Store. Cáº­p nháº­t thÃ´ng tin Ä‘á»ƒ nháº­n Æ°u Ä‘Ã£i vÃ  quÃ  táº·ng háº¥p dáº«n."
                keywords="thÃ´ng tin cÃ¡ nhÃ¢n, há»“ sÆ¡, tÃ i khoáº£n, cáº­p nháº­t thÃ´ng tin"
                ogTitle="Quáº£n lÃ½ thÃ´ng tin cÃ¡ nhÃ¢n - PC Store"
                ogDescription="Cáº­p nháº­t vÃ  quáº£n lÃ½ thÃ´ng tin cÃ¡ nhÃ¢n cá»§a báº¡n"
            />
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className='mx-5 xl:mx-32'>
                    <Breadcrumb items={[
                        { label: 'Há»“ sÆ¡ ngÆ°á»i dÃ¹ng', href: '/profile/detail' },
                        { label: 'ThÃ´ng tin chi tiáº¿t' },
                    ]} />
                </div>

                <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                    <ProfileSidebar user={user} activePage="detail" />

                    <div className='col-span-12 lg:col-span-9 p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 dark:text-white'>
                        <h2 className='text-xl font-bold pb-3 border-solid border-b-2 border-blue-200 dark:border-slate-900 dark:text-white mb-6'>
                            Cáº­p nháº­t thÃ´ng tin cÃ¡ nhÃ¢n
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
                                <h3 className="font-semibold text-lg mb-2">áº¢nh Ä‘áº¡i diá»‡n</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                    Chá»n áº£nh Ä‘áº¡i diá»‡n Ä‘á»ƒ hiá»ƒn thá»‹ trÃªn há»“ sÆ¡ cá»§a báº¡n
                                </p>
                                <Upload {...uploadProps}>
                                    <Button icon={<CameraOutlined />}>
                                        Thay Ä‘á»•i áº£nh
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
                                label={<span className="dark:text-white font-medium">Há» vÃ  tÃªn</span>}
                                rules={[
                                    { required: true, message: 'Vui lÃ²ng nháº­p há» vÃ  tÃªn!' },
                                    { min: 2, message: 'Há» tÃªn pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±!' }
                                ]}
                            >
                                <Input
                                    className="py-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nháº­p há» vÃ  tÃªn"
                                />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label={<span className="dark:text-white font-medium">Email</span>}
                                rules={[
                                    { required: true, message: 'Vui lÃ²ng nháº­p email!' },
                                    { type: 'email', message: 'Email khÃ´ng há»£p lá»‡!' }
                                ]}
                            >
                                <Input
                                    className="py-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nháº­p Ä‘á»‹a chá»‰ email"
                                    disabled // Email thÆ°á»ng khÃ´ng cho phÃ©p thay Ä‘á»•i
                                />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label={<span className="dark:text-white font-medium">Sá»‘ Ä‘iá»‡n thoáº¡i</span>}
                                rules={[
                                    { required: true, message: 'Vui lÃ²ng nháº­p sá»‘ Ä‘iá»‡n thoáº¡i!' },
                                    { pattern: /^[0-9]{10,11}$/, message: 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡!' }
                                ]}
                            >
                                <Input
                                    className="py-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i"
                                />
                            </Form.Item>

                            <Form.Item
                                name="gender"
                                label={<span className="dark:text-white font-medium">Giá»›i tÃ­nh</span>}
                            >
                                <Select
                                    className="dark:bg-gray-700"
                                    placeholder="Chá»n giá»›i tÃ­nh"
                                >
                                    <Select.Option value="MALE">Nam</Select.Option>
                                    <Select.Option value="FEMALE">Ná»¯</Select.Option>
                                    <Select.Option value="OTHER">KhÃ¡c</Select.Option>
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
                                    {loading ? 'Äang cáº­p nháº­t...' : 'Cáº­p nháº­t thÃ´ng tin'}
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                LÆ°u Ã½:
                            </h3>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                <li>â€¢ Email khÃ´ng thá»ƒ thay Ä‘á»•i sau khi Ä‘Ã£ xÃ¡c thá»±c</li>
                                <li>â€¢ ThÃ´ng tin cÃ¡ nhÃ¢n sáº½ Ä‘Æ°á»£c sá»­ dá»¥ng cho cÃ¡c Ä‘Æ¡n hÃ ng cá»§a báº¡n</li>
                                <li>â€¢ Vui lÃ²ng cung cáº¥p thÃ´ng tin chÃ­nh xÃ¡c Ä‘á»ƒ trÃ¡nh sai sÃ³t khi giao hÃ ng</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}