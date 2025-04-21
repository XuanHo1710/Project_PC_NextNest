'use client'
import '@ant-design/v5-patch-for-react-19';

import { Table } from "antd";
import { useState } from 'react';






export default function TableContent({data, columns}) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
      };
    
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
      };




    return (
        <>
            <Table pagination={{pageSize: 4}} rowSelection={rowSelection} columns={columns} dataSource={data} />
        </>
    );
}
