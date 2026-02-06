'use client'
import { Form, Input, Button, message } from 'antd';
import { useState } from 'react';
import axiosInstance from '@/config/axios';

export default function ChangePassword() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.patch('/auth/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            message.success('Đổi mật khẩu thành công!');
            form.resetFields();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordRequest = () => {
        message.info('Tính năng đang phát triển: Yêu cầu sẽ được gửi tới QTV để duyệt.');
    };

    return (
        <div className="max-w-md mx-auto py-6">
            <Form layout="vertical" onFinish={onFinish} form={form}>
                <Form.Item
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>

                <Form.Item
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}
                >
                    <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>

                <Form.Item>
                    <div className="flex flex-col gap-4">
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Đổi mật khẩu
                        </Button>

                        <div className="border-t pt-4 mt-2">
                            <p className="text-gray-500 text-sm mb-2 italic">
                                * Quên mật khẩu? Gửi yêu cầu reset mật khẩu tới quản trị viên.
                            </p>
                            <Button onClick={handleResetPasswordRequest} block disabled>
                                Yêu cầu cấp lại mật khẩu (Coming Soon)
                            </Button>
                        </div>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
}
