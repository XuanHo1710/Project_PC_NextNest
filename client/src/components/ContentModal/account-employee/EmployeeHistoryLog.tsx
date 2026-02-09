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
    createdAt: string;
    action?: string;
    body?: Object;
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

export default function EmployeeHistoryLog({ employeeId }: { employeeId: string }) {
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });

    const fetchLogs = async (params: { page: number, limit: number }) => {
        // API này sẽ được thêm vào gateway
        const res = await axiosInstance.get(`/account-employee/${employeeId}/history`, { params });
        return res as any;
    };

    const { data: result, isLoading, refetch } = useQuery({
        queryKey: ['employee-history-logs', employeeId, pagination],
        queryFn: () => fetchLogs(pagination),
        enabled: !!employeeId,
        refetchOnMount: true,
        staleTime: 0
    });

    useEffect(() => {
        if (employeeId) {
            refetch();
        }
    }, [employeeId]);

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
            title: 'Hành động',
            key: 'action',
            dataIndex: 'action', // Có thể dùng field action mới thêm
            render: (action, record) => (
                <Tag color={getMethodColor(record.method)}>
                    {action || record.method}
                </Tag>
            ),
            width: 120,
        },
        {
            title: 'Nội dung',
            dataIndex: 'body',
            key: 'body',
            width: 300,
            render: (val, { body }) => (
                <pre
                    style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxWidth: 600,
                    }}
                >
                    {JSON.stringify(body, null, 2)}
                </pre>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 200,
        },
    ];

    return (
        <div className="w-full py-4">
            <Table
                dataSource={logs}
                columns={columns}
                rowKey="_id"
                loading={isLoading}
                bordered
                scroll={{ x: 'max-content' }}
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
