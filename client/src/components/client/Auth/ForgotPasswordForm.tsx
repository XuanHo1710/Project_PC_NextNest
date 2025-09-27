'use client';

import { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { MailOutlined } from '@ant-design/icons';

export default function ForgotPasswordForm() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onFinish = async (values: { email: string }) => {
        setLoading(true);

        try {
            // Giả lập gọi API gửi OTP
            await new Promise((resolve) => setTimeout(resolve, 1500));

            message.success('Mã xác thực đã được gửi đến email của bạn!');

            // Lưu email vào localStorage để sử dụng ở các bước tiếp theo
            localStorage.setItem('resetEmail', values.email);

            // Chuyển đến trang xác thực OTP
            router.push('/verify-otp');
        } catch (error) {
            console.error('Lỗi gửi mã OTP:', error);
            message.error('Có lỗi xảy ra khi gửi mã xác thực. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <p className="text-gray-600 mb-6 text-center">
                Nhập địa chỉ email của bạn và chúng tôi sẽ gửi một mã xác thực để đặt lại mật khẩu.
            </p>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="space-y-4"
            >
                <Form.Item
                    name="email"
                    label={<span className="text-base font-medium">Email</span>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập email của bạn' },
                        { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="text-gray-400" />}
                        className="py-3 text-base rounded-lg"
                        size="large"
                        placeholder="Nhập email của bạn"
                    />
                </Form.Item>

                <Form.Item className="mt-6">
                    <Button
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        className="bg-blue-500 text-white font-semibold py-3 h-auto w-full hover:bg-blue-700 text-base transition-all rounded-lg"
                    >
                        Gửi mã xác thực
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}