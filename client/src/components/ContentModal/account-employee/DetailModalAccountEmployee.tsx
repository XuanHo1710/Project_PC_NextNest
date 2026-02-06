'use client'
import { Modal, Drawer, Descriptions, Tabs, Tag, Avatar } from 'antd';
import { UserOutlined, HistoryOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { IAccountEmployee } from "@/types";
import { DataType } from "@/types/table.d";
import EmployeeHistoryLog from './EmployeeHistoryLog';

interface DetailProps {
    isOpen: boolean;
    setOpen: (v: boolean) => void;
    data: DataType<IAccountEmployee> | null;
}

export default function DetailModalAccountEmployee({ isOpen, setOpen, data }: DetailProps) {

    if (!data) return null;

    const items = [
        {
            key: '1',
            label: <span className="flex items-center gap-2"><InfoCircleOutlined />Thông tin chung</span>,
            children: (
                <div className="p-4">
                    <div className="flex flex-col items-center mb-6">
                        <Avatar size={80} src={data.avatar} icon={<UserOutlined />} className="mb-2 bg-blue-500" />
                        <h3 className="text-xl font-bold">{data.name}</h3>
                        <p className="text-gray-500">{data.email}</p>
                        <Tag color={data.status === 'ACTIVE' ? 'green' : 'volcano'} className="mt-2">
                            {data.status === 'ACTIVE' ? 'Đang hoạt động' : 'Dừng hoạt động'}
                        </Tag>
                    </div>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Mã nhân viên">{data.IDEmp}</Descriptions.Item>
                        <Descriptions.Item label="Vai trò">
                            <Tag color="blue">{data.roleId?.name || "Chưa có"}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                            {data.gender === "MALE" ? "Nam" : data.gender === "FEMALE" ? "Nữ" : "Khác"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tuổi">{data.age}</Descriptions.Item>
                    </Descriptions>
                </div>
            )
        },
        {
            key: '2',
            label: <span className="flex items-center gap-2"><HistoryOutlined />Lịch sử hoạt động</span>,
            children: <EmployeeHistoryLog employeeId={data._id as string} />
        }
    ];

    return (
        <Drawer
            title="Chi tiết nhân viên"
            width={900}
            onClose={() => setOpen(false)}
            open={isOpen}
            destroyOnClose
        >
            <Tabs defaultActiveKey="1" items={items} />
        </Drawer>
    );
}
