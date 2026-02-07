'use client'
import { Table, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/config/axios';
import { useState, useEffect } from 'react';

interface IHistoryLog {
    _id: string;
    adminName: string;
    method: string;
    path: string;
    description: string;
    body: Object;
    createdAt: string;
}

const getMethodColor = (method: string) => {
    switch (method) {
        case 'POST': return 'green';
        case 'PATCH': return 'orange';
        case 'PUT': return 'orange';
        case 'DELETE': return 'red';
        default: return 'blue';
    }
};

export default function ActivityLog() {
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });

    const fetchLogs = async (params: { page: number, limit: number }) => {
        const res = await axiosInstance.get(`/history`, { params });
        return res as any;
    };

    const { data: result, isLoading, refetch } = useQuery({
        queryKey: ['history-logs', pagination],
        queryFn: () => fetchLogs(pagination),
        refetchOnMount: true,
        staleTime: 0,
    });

    useEffect(() => {
        refetch();
    }, []);

    // Fix: Dữ liệu thực tế nằm trong result.data.data do cấu trúc response từ backend
    // Response: { statusCode: 200, data: { data: [], pagination: {} } }
    // Axios interceptor trả về response.data -> result = { data: { data: [], pagination: {} }, ... }
    const logs = result?.data?.data || [];
    const meta = result?.data?.pagination || { totalItems: 0, itemsPerPage: 10 };

    const columns: ColumnsType<IHistoryLog> = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => text ? new Date(text).toLocaleString('vi-VN') : '',
            width: 180,
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'adminName',
            key: 'adminName',
            width: 150,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Tag color={getMethodColor(record.method)}>{record.method}</Tag>
            )
        },
        {
            title: 'Nội dung',
            dataIndex: 'body',
            key: 'body',
            ellipsis: true,
            render: (_, record) => (
                <pre
                    style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxWidth: 600,
                    }}
                >
                    {JSON.stringify(record.body, null, 2)}
                </pre>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Endpoint',
            dataIndex: 'path',
            key: 'path',
            ellipsis: true,
        },
    ];

    return (
        <div className="py-6">
            <Table
                dataSource={logs}
                columns={columns}
                scroll={{ x: 'max-content' }}
                rowKey="_id"
                loading={isLoading}
                bordered
                pagination={{
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: meta.totalItems,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    onChange: (page, limit) => setPagination({ page, limit }),
                }}
            />

        </div>
    );
}
