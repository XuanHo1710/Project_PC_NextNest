'use client';

import React, { useState } from 'react';
import { Button, Form, Input, Tabs, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormValues {
    email: string;
    password: string;
}

interface RegisterFormValues {
    email: string;
    password: string;
    fullname: string;
    confirmPassword: string;
}

export default function AuthPage() {
    const [loginForm] = Form.useForm();
    const [registerForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { login, register, loginWithGoogle } = useAuth();
    const router = useRouter();

    const handleLogin = async (values: LoginFormValues) => {
        setLoading(true);
        const success = await login(values.email, values.password);
        if (success) {
            router.push('/home');
        }
        setLoading(false);
    };

    const handleRegister = async (values: RegisterFormValues) => {
        if (values.password !== values.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        const success = await register(values.email, values.password, values.fullname);
        if (success) {
            registerForm.resetFields();
            message.info('Vui lòng chuyển sang tab Đăng nhập để tiếp tục');
        }
        setLoading(false);
    };

    const handleGoogleLogin = () => {
        loginWithGoogle();
    };

    const loginContent = (
        <Form
            form={loginForm}
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
            className="space-y-4"
        >
            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                ]}
            >
                <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="Nhập email của bạn"
                    className="py-3"
                />
            </Form.Item>

            <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Nhập mật khẩu"
                    className="py-3"
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 h-12 text-lg font-semibold"
                >
                    Đăng nhập
                </Button>
            </Form.Item>

            <Divider className="text-gray-400">Hoặc</Divider>

            <Button
                icon={<GoogleOutlined />}
                onClick={handleGoogleLogin}
                className="w-full h-12 text-lg font-semibold border-red-500 text-red-500 hover:bg-red-50"
            >
                Đăng nhập với Google
            </Button>

            <div className="text-center mt-4">
                <Link href="/forgot-password" className="text-blue-500 hover:text-blue-600">
                    Quên mật khẩu?
                </Link>
            </div>
        </Form>
    );

    const registerContent = (
        <Form
            form={registerForm}
            name="register"
            onFinish={handleRegister}
            layout="vertical"
            size="large"
            className="space-y-4"
        >
            <Form.Item
                name="fullname"
                label="Họ và tên"
                rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên!' },
                    { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                ]}
            >
                <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Nhập họ và tên"
                    className="py-3"
                />
            </Form.Item>

            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                ]}
            >
                <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="Nhập email của bạn"
                    className="py-3"
                />
            </Form.Item>

            <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
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
                    placeholder="Nhập mật khẩu"
                    className="py-3"
                />
            </Form.Item>

            <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={['password']}
                rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                    }),
                ]}
                hasFeedback
            >
                <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Nhập lại mật khẩu"
                    className="py-3"
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 h-12 text-lg font-semibold"
                >
                    Đăng ký
                </Button>
            </Form.Item>

            <Divider className="text-gray-400">Hoặc</Divider>

            <Button
                icon={<GoogleOutlined />}
                onClick={handleGoogleLogin}
                className="w-full h-12 text-lg font-semibold border-red-500 text-red-500 hover:bg-red-50"
            >
                Đăng ký với Google
            </Button>
        </Form>
    );

    const tabItems = [
        {
            key: 'login',
            label: 'Đăng nhập',
            children: loginContent,
        },
        {
            key: 'register',
            label: 'Đăng ký',
            children: registerContent,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link href="/home" className="inline-block">
                        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            PC Shop
                        </h1>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-300">
                        Chào mừng bạn đến với cửa hàng máy tính
                    </p>
                </div>

                {/* Auth Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <Tabs
                        defaultActiveKey="login"
                        items={tabItems}
                        centered
                        className="auth-tabs"
                    />
                </div>

                {/* Footer */}
                <div className="text-center">
                    <Link href="/home" className="text-blue-500 hover:text-blue-600 dark:text-blue-400">
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}