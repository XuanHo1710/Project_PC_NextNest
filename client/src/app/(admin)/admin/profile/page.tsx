'use client';

import { Tabs } from 'antd';
import ProfileDetails from './_components/ProfileDetails';
import ChangePassword from './_components/ChangePassword';
import { UserOutlined, LockOutlined, HistoryOutlined } from '@ant-design/icons';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';

export default function ProfilePage() {
    const { accountLogin } = useAuthEmployee();

    const items = [
        {
            key: '1',
            label: (
                <span>
                    <UserOutlined />
                    Thông tin cá nhân
                </span>
            ),
            children: <ProfileDetails />
        },
        {
            key: '2',
            label: (
                <span>
                    <LockOutlined />
                    Đổi mật khẩu
                </span>
            ),
            children: <ChangePassword />
        },
        {
            key: '3',
            label: (
                <span>
                    <HistoryOutlined />
                    Nhật ký hoạt động
                </span>
            ),
            children: (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
                    <HistoryOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <p className="text-lg">Tính năng Nhật ký hoạt động đang được xây dựng</p>
                    <p className="text-sm">Tại đây bạn sẽ xem được lịch sử đăng nhập và các thao tác trên hệ thống.</p>
                </div>
            )
        }
    ];

    if (!accountLogin) return <div className="p-6">Đang tải thông tin...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm m-4 h-[calc(100vh-100px)] overflow-y-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Hồ sơ quản trị viên</h1>
            <div className="bg-white">
                <Tabs defaultActiveKey="1" items={items} size="large" />
            </div>
        </div>
    );
}
