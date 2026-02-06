'use client'
import { Form, Input, Button, message } from 'antd';

export default function ChangePassword() {
    const onFinish = (values: any) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp!');
            return;
        }
        message.success('Đổi mật khẩu thành công (Demo)');
    };

    return (
        <div className="max-w-md mx-auto py-6">
            <Form layout="vertical" onFinish={onFinish}>
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
                    <Button type="primary" htmlType="submit">
                        Đổi mật khẩu
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
