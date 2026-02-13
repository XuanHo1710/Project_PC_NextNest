'use client'

import { Table, Tag } from "antd"
import { useOrderStats } from "@/hooks/admin/useOrder"
import type { ColumnsType } from 'antd/es/table';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
    PENDING: { color: 'orange', label: 'Chờ xử lý' },
    SHIPPING: { color: 'blue', label: 'Đang giao' },
    DELIVERED: { color: 'cyan', label: 'Đã giao' },
    COMPLETED: { color: 'green', label: 'Hoàn thành' },
    CANCELLED: { color: 'red', label: 'Đã hủy' },
    REFUNDED: { color: 'purple', label: 'Hoàn tiền' },
    EXPIRED: { color: 'default', label: 'Hết hạn' },
};

interface RecentOrder {
    _id: string;
    totalAmount: number;
    status: string;
    payment: { isCheckout: boolean; type: string };
    createdAt: string;
    customerInfo?: { fullname?: string };
}

const columns: ColumnsType<RecentOrder> = [
    {
        title: 'Mã đơn',
        dataIndex: '_id',
        key: '_id',
        width: 200,
        render: (id: string) => `#${id.slice(-8).toUpperCase()}`,
    },
    {
        title: 'Khách hàng',
        key: 'customer',
        width: 180,
        render: (_: unknown, record: RecentOrder) => record.customerInfo?.fullname || '—',
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: string) => {
            const cfg = STATUS_MAP[status] || { color: 'default', label: status };
            return <Tag color={cfg.color}>{cfg.label}</Tag>;
        },
    },
    {
        title: 'Thanh toán',
        key: 'payment',
        width: 120,
        render: (_: unknown, record: RecentOrder) => (
            <div>
                <Tag color={record.payment?.type === 'CARD' ? 'blue' : 'gold'}>
                    {record.payment?.type || 'COD'}
                </Tag>
                {record.payment?.isCheckout && <Tag color="green" className="!text-[10px]">Đã TT</Tag>}
            </div>
        ),
    },
    {
        title: 'Tổng tiền',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        width: 140,
        align: 'right',
        render: (amount: number) => `${(amount || 0).toLocaleString()}đ`,
        sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
        title: 'Ngày đặt',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 160,
        render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : '—',
    },
];

export const TableReport = () => {
    const { data: stats, isLoading } = useOrderStats();
    const recentOrders = (stats?.recentOrders || []) as RecentOrder[];

    return (
        <Table<RecentOrder>
            columns={columns}
            dataSource={recentOrders}
            rowKey="_id"
            loading={isLoading}
            pagination={false}
            size="middle"
        />
    );
}