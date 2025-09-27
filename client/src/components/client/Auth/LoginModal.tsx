'use client';

import { useState } from 'react';
import { Button, Divider, Form, Image, Input, Modal } from 'antd';
import Link from 'next/link';

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

    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            // Ở đây sẽ thêm logic gửi request đăng nhập
            console.log('Đăng nhập với:', values);

            // Giả lập delay khi gọi API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Đóng modal sau khi đăng nhập thành công
            onClose();

            // Reset form
            form.resetFields();
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
        } finally {
            setLoading(false);
        }
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

            <button className="bg-blue-500 hover:bg-blue-700 flex items-center justify-center gap-3 text-white py-3 w-full font-semibold rounded-md text-base transition-all">
                <Image
                    preview={false}
                    width={24}
                    alt="Google Logo"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
                    className="bg-white p-0.5 rounded-full"
                />
                Đăng nhập với Google
            </button>

            <p className="text-center mt-5 text-base">
                Bạn chưa có tài khoản? <span onClick={switchToRegister} className="text-blue-500 cursor-pointer hover:underline font-medium">Đăng ký ngay!</span>
            </p>
        </Modal>
    );
}