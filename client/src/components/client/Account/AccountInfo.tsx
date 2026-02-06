'use client';

import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Modal, Form, Switch, message, Avatar, Divider } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';
import { accountService } from '@/services/client/account.client.service';
import { IUpdateAccountSettingsDto } from '@/types/auth';
import useAuthUser from '@/hooks/useAuthUser';

interface AccountInfoProps {
    showAccountSettings?: boolean;
    showProfileInfo?: boolean;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
    showAccountSettings = true,
    showProfileInfo = true
}) => {
    const { user } = useAuthUser();
    const [loading, setLoading] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const [accountSettings, setAccountSettings] = useState<IUpdateAccountSettingsDto>({
        emailNotifications: true,
        smsNotifications: true,
        marketingEmails: false,
        twoFactorEnabled: false
    });

    useEffect(() => {
        if (user) {
            // In a real app, you would fetch full account details here
            // For now, we'll use the user data from auth context
        }
    }, [user]);

    const handleUpdateSettings = async (values: IUpdateAccountSettingsDto) => {
        try {
            setLoading(true);
            await accountService.updateAccountSettings(values);
            setAccountSettings(values);
            setSettingsModalVisible(false);
            message.success('Cài đặt tài khoản đã được cập nhật!');
        } catch (error) {
            console.error('Error updating account settings:', error);
            message.error('Có lỗi xảy ra khi cập nhật cài đặt');
        } finally {
            setLoading(false);
        }
    };

    const getAccountStatusColor = (status?: string) => {
        switch (status) {
            case 'ACTIVE': return 'green';
            case 'PENDING': return 'orange';
            case 'SUSPENDED': return 'red';
            case 'DELETED': return 'gray';
            default: return 'default';
        }
    };

    const getAuthProviderDisplay = (provider?: string) => {
        switch (provider) {
            case 'google': return <Tag color="red">Google</Tag>;
            case 'local': return <Tag color="blue">Email</Tag>;
            default: return <Tag>Unknown</Tag>;
        }
    };

    if (!user) {
        return (
            <Card>
                <p>Vui lòng đăng nhập để xem thông tin tài khoản</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {showProfileInfo && (
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <UserOutlined />
                            <span>Thông tin cá nhân</span>
                        </div>
                    }
                    extra={
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            href="/profile/detail"
                        >
                            Chỉnh sửa
                        </Button>
                    }
                >
                    <div className="flex items-start gap-4">
                        <Avatar
                            size={80}
                            src={user.avatar}
                            icon={<UserOutlined />}
                        />
                        <div className="flex-1">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Họ tên">
                                    {user.fullname}
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    <div className="flex items-center gap-2">
                                        {user.email}
                                        {user.isEmailVerified ? (
                                            <Tag color="green" icon={<SafetyCertificateOutlined />}>
                                                Đã xác thực
                                            </Tag>
                                        ) : (
                                            <Tag color="orange">
                                                Chưa xác thực
                                            </Tag>
                                        )}
                                    </div>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    {user.phone || 'Chưa cập nhật'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Giới tính">
                                    {user.gender === 'MALE' ? 'Nam' :
                                        user.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    </div>
                </Card>
            )}

            {showAccountSettings && (
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <SettingOutlined />
                            <span>Thông tin tài khoản</span>
                        </div>
                    }
                    extra={
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => {
                                form.setFieldsValue(accountSettings);
                                setSettingsModalVisible(true);
                            }}
                        >
                            Cài đặt
                        </Button>
                    }
                >
                    <Descriptions column={2} size="small">
                        <Descriptions.Item label="Trạng thái tài khoản">
                            <Tag color={getAccountStatusColor(user.accountStatus)}>
                                {user.accountStatus === 'ACTIVE' ? 'Hoạt động' :
                                    user.accountStatus === 'PENDING' ? 'Chờ kích hoạt' :
                                        user.accountStatus === 'SUSPENDED' ? 'Tạm khóa' : 'Đã xóa'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức đăng nhập">
                            {getAuthProviderDisplay(user.authProvider)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email được xác thực">
                            {user.isEmailVerified ? (
                                <Tag color="green">Đã xác thực</Tag>
                            ) : (
                                <Tag color="orange">Chưa xác thực</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Xác thực 2 bước">
                            <Tag color={accountSettings.twoFactorEnabled ? 'green' : 'default'}>
                                {accountSettings.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <div className="space-y-3">
                        <h4 className="font-semibold">Cài đặt thông báo:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span>Email thông báo</span>
                                <Tag color={accountSettings.emailNotifications ? 'green' : 'default'}>
                                    {accountSettings.emailNotifications ? 'Bật' : 'Tắt'}
                                </Tag>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span>SMS thông báo</span>
                                <Tag color={accountSettings.smsNotifications ? 'green' : 'default'}>
                                    {accountSettings.smsNotifications ? 'Bật' : 'Tắt'}
                                </Tag>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span>Email marketing</span>
                                <Tag color={accountSettings.marketingEmails ? 'green' : 'default'}>
                                    {accountSettings.marketingEmails ? 'Bật' : 'Tắt'}
                                </Tag>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Modal
                title="Cài đặt tài khoản"
                open={settingsModalVisible}
                onCancel={() => setSettingsModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateSettings}
                    initialValues={accountSettings}
                >
                    <Form.Item
                        name="emailNotifications"
                        label="Nhận thông báo qua email"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="smsNotifications"
                        label="Nhận thông báo qua SMS"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="marketingEmails"
                        label="Nhận email marketing"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="twoFactorEnabled"
                        label="Xác thực 2 bước"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => setSettingsModalVisible(false)}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AccountInfo;