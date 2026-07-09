'use client';

import { useState } from 'react';
import { Button, Divider, Form, Input, Modal } from 'antd';
import Link from 'next/link';
import useAuthUser from '@/hooks/useAuthUser';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    switchToRegister: () => void;
}

interface LoginFormValues {
    email: string;
    password: string;
    remember: boolean;
}

export default function LoginModal({ isOpen, onClose, switchToRegister }: LoginModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuthUser();

    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            const success = await login(values.email, values.password);

            if (success) {
                // Đóng modal sau khi đăng nhập thành công
                onClose();
                // Reset form
                form.resetFields();
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        onClose(); // Đóng modal trước khi redirect
        loginWithGoogle();
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title={<h2 className="text-xl font-bold">Đăng nhập</h2>}
            footer={[]}
            width={600}
            centered
        >
            <p className="mb-5">Nhập email và mật khẩu để truy cập vào tài khoản của bạn</p>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="email"
                    label={<span className="text-base">Email</span>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập email của bạn' },
                        { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                >
                    <Input className="py-3 text-base" size="large" placeholder="Nhập email" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={<span className="text-base">Mật khẩu</span>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu' }
                    ]}
                >
                    <Input.Password className="py-3 text-base" size="large" placeholder="Nhập mật khẩu" />
                </Form.Item>

                <Form.Item name="remember" valuePropName="checked" className="text-right">
                    <Link href="/forgot-password" className="text-blue-500 hover:underline text-base" onClick={onClose}>
                        Quên mật khẩu?
                    </Link>
                </Form.Item>

                <Form.Item>
                    <Button
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        className="bg-blue-500 text-white font-semibold py-3 h-auto w-full hover:bg-blue-700 text-base transition-all"
                    >
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>

            <Divider style={{ borderColor: "#c9c9c9" }} plain className="text-base">hoặc đăng nhập bằng</Divider>

            <button
                onClick={handleGoogleLogin}
                className="bg-blue-500 hover:bg-blue-700 flex items-center justify-center gap-3 text-white py-3 w-full font-semibold rounded-md text-base transition-all"
            >
                <img
                    alt="Google Logo"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="w-6 h-6 bg-white p-1 rounded-full object-contain"
                />
                Đăng nhập với Google
            </button>

            <p className="text-center mt-5 text-base">
                Bạn chưa có tài khoản? <span onClick={switchToRegister} className="text-blue-500 cursor-pointer hover:underline font-medium">Đăng ký ngay!</span>
            </p>
        </Modal>
    );
}