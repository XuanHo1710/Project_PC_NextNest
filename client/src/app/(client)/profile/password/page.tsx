'use client';

import { Button, Form, Image, Input, message } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined } from '@ant-design/icons';
import {
    PasswordPageSkeleton,
    ProfilePageSkeleton
} from "@/components/Skeletons";
import { accountGuestService } from "@/services/client/account.client.service";
import useAuthUser from "@/hooks/useAuthUser";
import { DynamicMetadata } from "@/components/common/DynamicMetadata";

interface PasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ProfilePassword() {
    const { user } = useAuthUser();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        // Simulate initial data fetch
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Check if user is using Google authentication
    const isGoogleUser = user?.authProvider === 'google';

    const handleSubmit = async (values: PasswordFormValues) => {
        if (!user?.id) {
            message.error('Không tìm thấy thông tin người dùng');
            return;
        }

        setLoading(true);
        try {
            await accountGuestService.changePassword(
                user.id,
                values.currentPassword,
                values.newPassword
            );

            message.success('Đổi mật khẩu thành công!');
            form.resetFields();
        } catch (error) {
            console.error('Error changing password:', error);
            // Handle axios error response
            const axiosError = error as { response?: { data?: { message?: string } } };
            const errorMessage = axiosError?.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const validateConfirmPassword = (_: unknown, value: string) => {
        if (!value || form.getFieldValue('newPassword') === value) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
    };

    const layout = {
        labelCol: {
            span: 9,
        },
        wrapperCol: {
            span: 25,
        },
    };

    if (pageLoading) {
        return (
            <ProfilePageSkeleton>
                <PasswordPageSkeleton />
            </ProfilePageSkeleton>
        )
    }

    return (
        <>
            <DynamicMetadata
                title="Đổi mật khẩu - PC Store"
                description="Đổi mật khẩu tài khoản PC Store để bảo mật thông tin cá nhân. Đơn giản, nhanh chóng và an toàn."
                keywords="đổi mật khẩu, thay đổi mật khẩu, bảo mật tài khoản, reset password"
                ogTitle="Thay đổi mật khẩu - PC Store"
                ogDescription="Cập nhật mật khẩu để bảo mật tài khoản của bạn"
            />
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <Link href="/profile/detail" className="font-medium text-lg text-stone-500 dark:text-white mr-3">Hồ sơ người dùng</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-400 dark:text-white mr-3">Thay đổi mật khẩu</h3>
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
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/address"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-location-dot w-9"></i>
                                    <span className='font-medium'>Quản lý địa chỉ</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 bg-blue-400 text-white px-5 rounded-lg' href={"/profile/password"}>
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
                        <h2 className='text-xl font-bold pb-3 border-solid border-b-2 border-blue-200 dark:border-slate-900 dark:text-white mb-6'>
                            Thay đổi mật khẩu
                        </h2>

                        <div className="max-w-md">
                            {isGoogleUser ? (
                                // Google User - Show blocked message
                                <div className="text-center py-8">
                                    <div className="mb-6">
                                        <i className="fab fa-google text-6xl text-red-500 mb-4"></i>
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                            Tài khoản Google
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            Bạn đang sử dụng tài khoản Google để đăng nhập
                                        </p>
                                    </div>

                                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6 mb-6">
                                        <div className="flex items-center justify-center mb-3">
                                            <i className="fas fa-lock text-red-600 dark:text-red-400 text-3xl"></i>
                                        </div>
                                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                                            Không thể thay đổi mật khẩu
                                        </h4>
                                        <p className="text-red-700 dark:text-red-300 text-sm">
                                            Tài khoản Google không sử dụng mật khẩu riêng.
                                            Mật khẩu của bạn được quản lý bởi Google.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => window.open('https://myaccount.google.com/security', '_blank')}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                                        >
                                            <i className="fas fa-external-link-alt"></i>
                                            Quản lý bảo mật Google
                                        </button>

                                        <Link
                                            href="/profile/detail"
                                            className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center"
                                        >
                                            <i className="fas fa-arrow-left mr-2"></i>
                                            Quay lại hồ sơ
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                // Local User - Show password form
                                <div>
                                    <Form
                                        form={form}
                                        {...layout}
                                        onFinish={handleSubmit}
                                        labelAlign="left"
                                        className="space-y-4"
                                    >
                                        <Form.Item
                                            name="currentPassword"
                                            label={<span className="dark:text-white font-medium">Mật khẩu hiện tại</span>}
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' },
                                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                            ]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined className="text-gray-400" />}
                                                placeholder="Nhập mật khẩu hiện tại"
                                                className="py-2 dark:bg-gray-700 dark:text-white"
                                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="newPassword"
                                            label={<span className="dark:text-white font-medium">Mật khẩu mới</span>}
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                                                {
                                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
                                                    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!'
                                                }
                                            ]}
                                            hasFeedback
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined className="text-gray-400" />}
                                                placeholder="Nhập mật khẩu mới"
                                                className="py-2 dark:bg-gray-700 dark:text-white"
                                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="confirmPassword"
                                            label={<span className="dark:text-white font-medium">Xác nhận mật khẩu</span>}
                                            dependencies={['newPassword']}
                                            rules={[
                                                { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                                { validator: validateConfirmPassword }
                                            ]}
                                            hasFeedback
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined className="text-gray-400" />}
                                                placeholder="Nhập lại mật khẩu mới"
                                                className="py-2 dark:bg-gray-700 dark:text-white"
                                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                            />
                                        </Form.Item>

                                        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                className="bg-blue-500 hover:bg-blue-600 font-bold py-2 px-8"
                                                size="large"
                                            >
                                                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                                            </Button>
                                        </Form.Item>
                                    </Form>

                                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            Lưu ý về bảo mật:
                                        </h3>
                                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                            <li>• Mật khẩu phải có ít nhất 6 ký tự</li>
                                            <li>• Bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số</li>
                                            <li>• Không sử dụng mật khẩu dễ đoán</li>
                                            <li>• Thay đổi mật khẩu định kỳ để bảo mật tài khoản</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}