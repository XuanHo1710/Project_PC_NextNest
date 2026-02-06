'use client';

import { Tabs } from 'antd';
import ProfileDetails from './_components/ProfileDetails';
import ChangePassword from './_components/ChangePassword';
import ActivityLog from './_components/ActivityLog';
import { UserOutlined, LockOutlined, HistoryOutlined } from '@ant-design/icons';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';

export default function ProfilePage() {
    const { accountLogin } = useAuthEmployee();

    const items = [
        {
            key: '1',
            label: (
                <span className='flex items-center gap-2'>
                    <UserOutlined />
                    Thông tin cá nhân
                </span>
            ),
            children: <ProfileDetails />
        },
        {
            key: '2',
            label: (
                <span className='flex items-center gap-2'>
                    <LockOutlined />
                    Đổi mật khẩu
                </span>
            ),
            children: <ChangePassword />
        },
        {
            key: '3',
            label: (
                <span className='flex items-center gap-2'>
                    <HistoryOutlined />
                    Nhật ký hoạt động
                </span>
            ),
            children: <ActivityLog />
        }
    ];

    if (!accountLogin) return <div className="p-6">Đang tải thông tin...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm m-4 h-[calc(100vh-100px)] overflow-y-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Hồ sơ quản trị viên</h1>
            <Tabs defaultActiveKey="1" items={items} size="large" destroyOnHidden />
        </div>
    );
}
