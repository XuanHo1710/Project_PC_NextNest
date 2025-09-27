'use client';

import { useState, useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { LockOutlined } from '@ant-design/icons';

export default function ResetPasswordForm() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Kiểm tra xác thực OTP
        const otpToken = localStorage.getItem('otpToken');
        const storedEmail = localStorage.getItem('resetEmail');

        if (!otpToken) {
            message.error('Phiên đặt lại mật khẩu không hợp lệ. Vui lòng thực hiện lại từ đầu.');
            router.push('/forgot-password');
            return;
        }

        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, [router]);

    const onFinish = async (values: { password: string; confirmPassword: string }) => {
        setLoading(true);

        try {
            // Giả lập gọi API đặt lại mật khẩu
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Đặt lại mật khẩu với:', {
                email,
                password: values.password
            });

            // Xóa các thông tin đã lưu trong localStorage
            localStorage.removeItem('resetEmail');
            localStorage.removeItem('otpToken');

            message.success('Mật khẩu đã được đặt lại thành công!');

            // Chờ một chút để người dùng thấy thông báo thành công
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Chuyển hướng về trang chủ hoặc trang đăng nhập
            router.push('/');
        } catch (error) {
            console.error('Lỗi đặt lại mật khẩu:', error);
            message.error('Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="text-gray-600 mb-6 text-center">
                <p>Tạo mật khẩu mới cho tài khoản:</p>
                <p className="font-medium text-gray-800 mt-1">{email}</p>
                <p className="mt-4">Mật khẩu cần có ít nhất 8 ký tự, bao gồm chữ cái, số và ký tự đặc biệt.</p>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="space-y-4"
            >
                <Form.Item
                    name="password"
                    label={<span className="text-base font-medium">Mật khẩu mới</span>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        {
                            min: 8,
                            message: 'Mật khẩu phải có ít nhất 8 ký tự'
                        },
                        {
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                            message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
                        }
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        className="py-3 text-base rounded-lg"
                        size="large"
                        placeholder="Nhập mật khẩu mới"
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label={<span className="text-base font-medium">Xác nhận mật khẩu</span>}
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Hai mật khẩu không khớp nhau'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        className="py-3 text-base rounded-lg"
                        size="large"
                        placeholder="Xác nhận mật khẩu mới"
                    />
                </Form.Item>

                <Form.Item className="mt-6">
                    <Button
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        className="bg-blue-500 text-white font-semibold py-3 h-auto w-full hover:bg-blue-700 text-base transition-all rounded-lg"
                    >
                        Đặt lại mật khẩu
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}