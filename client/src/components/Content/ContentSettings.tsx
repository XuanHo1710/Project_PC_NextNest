'use client'

import { Card, Tabs, Switch, Form, Input, Button, Select, ColorPicker, Divider, Upload, message } from "antd";
import { FaCog, FaPalette, FaBell, FaShieldAlt, FaEnvelope, FaUpload, FaGlobe } from "react-icons/fa";
import { useState } from "react";
import type { UploadProps } from 'antd';

const { TabPane } = Tabs;
const { TextArea } = Input;

export default function ContentSettings() {
    const [generalForm] = Form.useForm();
    const [emailForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Handle save settings
    const handleSaveGeneral = async (values: any) => {
        setLoading(true);
        try {
            // TODO: Call API to save settings
            console.log('General settings:', values);
            message.success('Đã lưu cài đặt chung!');
        } catch (error) {
            message.error('Lưu cài đặt thất bại!');
        }
        setLoading(false);
    };

    const handleSaveEmail = async (values: any) => {
        setLoading(true);
        try {
            // TODO: Call API to save email settings
            console.log('Email settings:', values);
            message.success('Đã lưu cài đặt email!');
        } catch (error) {
            message.error('Lưu cài đặt thất bại!');
        }
        setLoading(false);
    };

    const uploadProps: UploadProps = {
        name: 'logo',
        action: '/api/upload', // TODO: Replace with actual upload endpoint
        onChange(info) {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} tải lên thành công`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} tải lên thất bại`);
            }
        },
    };

    return (
        <div className="py-4 px-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaCog className="text-blue-500" />
                Cài đặt hệ thống
            </h2>

            <Tabs defaultActiveKey="general" type="card" size="large">
                {/* General Settings */}
                <TabPane
                    tab={
                        <span className="flex items-center gap-2">
                            <FaGlobe />
                            Chung
                        </span>
                    }
                    key="general"
                >
                    <Card className="shadow-sm">
                        <Form
                            form={generalForm}
                            layout="vertical"
                            onFinish={handleSaveGeneral}
                            initialValues={{
                                siteName: 'NextNest PC',
                                siteDescription: 'Cửa hàng linh kiện máy tính',
                                contactEmail: 'admin@nextnest.com',
                                contactPhone: '0123456789',
                                address: 'TP. Hồ Chí Minh, Việt Nam',
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Form.Item
                                    label="Tên website"
                                    name="siteName"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên website' }]}
                                >
                                    <Input placeholder="Nhập tên website" />
                                </Form.Item>

                                <Form.Item
                                    label="Email liên hệ"
                                    name="contactEmail"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email' },
                                        { type: 'email', message: 'Email không hợp lệ' }
                                    ]}
                                >
                                    <Input placeholder="admin@example.com" />
                                </Form.Item>

                                <Form.Item
                                    label="Số điện thoại"
                                    name="contactPhone"
                                >
                                    <Input placeholder="0123456789" />
                                </Form.Item>

                                <Form.Item
                                    label="Địa chỉ"
                                    name="address"
                                >
                                    <Input placeholder="Nhập địa chỉ" />
                                </Form.Item>
                            </div>

                            <Form.Item
                                label="Mô tả website"
                                name="siteDescription"
                            >
                                <TextArea rows={3} placeholder="Mô tả ngắn về website của bạn" />
                            </Form.Item>

                            <Form.Item label="Logo website">
                                <Upload {...uploadProps} listType="picture" maxCount={1}>
                                    <Button icon={<FaUpload />}>Tải lên logo</Button>
                                </Upload>
                            </Form.Item>

                            <div className="flex justify-end">
                                <Button type="primary" htmlType="submit" loading={loading} size="large">
                                    Lưu cài đặt
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </TabPane>

                {/* Appearance Settings */}
                <TabPane
                    tab={
                        <span className="flex items-center gap-2">
                            <FaPalette />
                            Giao diện
                        </span>
                    }
                    key="appearance"
                >
                    <Card className="shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Cài đặt giao diện</h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Chế độ tối (Dark Mode)</h4>
                                    <p className="text-gray-500 text-sm">Bật chế độ tối cho giao diện admin</p>
                                </div>
                                <Switch defaultChecked={false} />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Màu chủ đạo</h4>
                                    <p className="text-gray-500 text-sm">Chọn màu chủ đạo cho giao diện</p>
                                </div>
                                <ColorPicker defaultValue="#1890ff" showText />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Sidebar thu gọn</h4>
                                    <p className="text-gray-500 text-sm">Thu gọn sidebar mặc định</p>
                                </div>
                                <Switch defaultChecked={false} />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Số dòng mỗi trang</h4>
                                    <p className="text-gray-500 text-sm">Số dòng hiển thị mặc định trong bảng</p>
                                </div>
                                <Select defaultValue={10} style={{ width: 100 }}>
                                    <Select.Option value={5}>5</Select.Option>
                                    <Select.Option value={10}>10</Select.Option>
                                    <Select.Option value={20}>20</Select.Option>
                                    <Select.Option value={50}>50</Select.Option>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button type="primary" size="large">
                                Lưu cài đặt
                            </Button>
                        </div>
                    </Card>
                </TabPane>

                {/* Notification Settings */}
                <TabPane
                    tab={
                        <span className="flex items-center gap-2">
                            <FaBell />
                            Thông báo
                        </span>
                    }
                    key="notifications"
                >
                    <Card className="shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Cài đặt thông báo</h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Thông báo đơn hàng mới</h4>
                                    <p className="text-gray-500 text-sm">Nhận thông báo khi có đơn hàng mới</p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Thông báo tồn kho thấp</h4>
                                    <p className="text-gray-500 text-sm">Nhận thông báo khi sản phẩm sắp hết hàng</p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Thông báo đánh giá mới</h4>
                                    <p className="text-gray-500 text-sm">Nhận thông báo khi có đánh giá sản phẩm mới</p>
                                </div>
                                <Switch defaultChecked={false} />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Gửi email thông báo</h4>
                                    <p className="text-gray-500 text-sm">Gửi email cho các thông báo quan trọng</p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button type="primary" size="large">
                                Lưu cài đặt
                            </Button>
                        </div>
                    </Card>
                </TabPane>

                {/* Email Settings */}
                <TabPane
                    tab={
                        <span className="flex items-center gap-2">
                            <FaEnvelope />
                            Email SMTP
                        </span>
                    }
                    key="email"
                >
                    <Card className="shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Cài đặt SMTP Email</h3>

                        <Form
                            form={emailForm}
                            layout="vertical"
                            onFinish={handleSaveEmail}
                            initialValues={{
                                smtpHost: 'smtp.gmail.com',
                                smtpPort: 587,
                                smtpSecure: 'tls',
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Form.Item
                                    label="SMTP Host"
                                    name="smtpHost"
                                    rules={[{ required: true, message: 'Vui lòng nhập SMTP host' }]}
                                >
                                    <Input placeholder="smtp.gmail.com" />
                                </Form.Item>

                                <Form.Item
                                    label="SMTP Port"
                                    name="smtpPort"
                                    rules={[{ required: true, message: 'Vui lòng nhập port' }]}
                                >
                                    <Input type="number" placeholder="587" />
                                </Form.Item>

                                <Form.Item
                                    label="SMTP Username"
                                    name="smtpUsername"
                                    rules={[{ required: true, message: 'Vui lòng nhập username' }]}
                                >
                                    <Input placeholder="your-email@gmail.com" />
                                </Form.Item>

                                <Form.Item
                                    label="SMTP Password"
                                    name="smtpPassword"
                                    rules={[{ required: true, message: 'Vui lòng nhập password' }]}
                                >
                                    <Input.Password placeholder="App password" />
                                </Form.Item>

                                <Form.Item
                                    label="Bảo mật"
                                    name="smtpSecure"
                                >
                                    <Select>
                                        <Select.Option value="tls">TLS</Select.Option>
                                        <Select.Option value="ssl">SSL</Select.Option>
                                        <Select.Option value="none">None</Select.Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label="Email gửi"
                                    name="fromEmail"
                                >
                                    <Input placeholder="noreply@example.com" />
                                </Form.Item>
                            </div>

                            <div className="flex justify-between mt-4">
                                <Button>Gửi email test</Button>
                                <Button type="primary" htmlType="submit" loading={loading} size="large">
                                    Lưu cài đặt
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </TabPane>

                {/* Security Settings */}
                <TabPane
                    tab={
                        <span className="flex items-center gap-2">
                            <FaShieldAlt />
                            Bảo mật
                        </span>
                    }
                    key="security"
                >
                    <Card className="shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Cài đặt bảo mật</h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Xác thực 2 lớp (2FA)</h4>
                                    <p className="text-gray-500 text-sm">Yêu cầu xác thực 2 lớp cho tài khoản admin</p>
                                </div>
                                <Switch defaultChecked={false} />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Tự động đăng xuất</h4>
                                    <p className="text-gray-500 text-sm">Tự động đăng xuất sau thời gian không hoạt động</p>
                                </div>
                                <Select defaultValue={30} style={{ width: 150 }}>
                                    <Select.Option value={15}>15 phút</Select.Option>
                                    <Select.Option value={30}>30 phút</Select.Option>
                                    <Select.Option value={60}>1 giờ</Select.Option>
                                    <Select.Option value={0}>Không bao giờ</Select.Option>
                                </Select>
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Giới hạn IP truy cập</h4>
                                    <p className="text-gray-500 text-sm">Chỉ cho phép truy cập từ các IP được cho phép</p>
                                </div>
                                <Switch defaultChecked={false} />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Ghi log hoạt động</h4>
                                    <p className="text-gray-500 text-sm">Ghi lại tất cả hoạt động của admin</p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Độ mạnh mật khẩu tối thiểu</h4>
                                    <p className="text-gray-500 text-sm">Yêu cầu mật khẩu mạnh cho tất cả tài khoản</p>
                                </div>
                                <Select defaultValue="medium" style={{ width: 150 }}>
                                    <Select.Option value="low">Thấp</Select.Option>
                                    <Select.Option value="medium">Trung bình</Select.Option>
                                    <Select.Option value="high">Cao</Select.Option>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button type="primary" size="large">
                                Lưu cài đặt
                            </Button>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
}
