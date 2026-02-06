'use client'
import { Form, Input, Button, Avatar, Upload, message } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';

export default function ProfileDetails() {
    const { accountLogin } = useAuthEmployee();
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        message.info('Tính năng cập nhật đang được phát triển');
        console.log('Update profile:', values);
    };

    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="flex flex-col items-center mb-8">
                <Avatar size={100} icon={<UserOutlined />} className="mb-4 bg-blue-500" />
                <Upload showUploadList={false}>
                    <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
                </Upload>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    name: accountLogin?.username,
                    IDEmp: accountLogin?.IDEmp,
                }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Mã nhân viên" name="IDEmp">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Tên hiển thị" name="name" rules={[{ required: true, message: 'Không được để trống' }]}>
                        <Input />
                    </Form.Item>
                </div>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
