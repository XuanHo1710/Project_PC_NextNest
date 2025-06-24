'use client'

import { Table, TableProps, Tag } from "antd"


interface DataType {
    key: string;
    _id: string;
    totalOther: number;
    status: string;
    totalAmount: number;
}


const columns: TableProps<DataType>['columns'] = [
    {
        title: 'Order Number',
        dataIndex: '_id',
        key: '_id',
        sorter: (a, b) => a._id.localeCompare(b._id),
    },
    {
        title: 'Total Order',
        dataIndex: 'totalOther',
        key: 'totalOther',
        sorter: (a, b) => a.totalOther - b.totalOther,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (_: unknown, { status }) => {
            return <Tag color="green" >{status}</Tag>
        },
        sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
        title: 'Total Amount',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
];

const data: DataType[] = [
    {
        key: '1',
        _id: '81782172',
        totalOther: 12,
        status: 'Pending',
        totalAmount: 2000
    },
    {
        key: '2',
        _id: '98618231',
        totalOther: 21,
        status: 'Approve',
        totalAmount: 1200
    }
];

export const TableReport = () => {
    return (
        <>
            <Table<DataType> columns={columns} dataSource={data} />
        </>
    )
}


