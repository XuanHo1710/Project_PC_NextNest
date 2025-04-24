'use client'
import { DataType, useSelectedRowsEmployee } from '@/app/(admin)/admin/employee/page';
import '@ant-design/v5-patch-for-react-19';

import { Table } from "antd";
import { ColumnsType } from 'antd/es/table';






export default function TableContent({ data, columns }: { columns: ColumnsType<DataType>, data: DataType[] }) {
  const { setSelectedRows, selectedRows } = useSelectedRowsEmployee();

  // Selection row key
  const ChangeSelectionRow = (_: unknown, elementsSelect: DataType[]) => {
    const listIDs = elementsSelect.map(item => item._id as string);
    setSelectedRows(listIDs);
  }
  const rowSelection = {
    selectedRows,
    onChange: ChangeSelectionRow
  }

  // End selection row key

  return (
    <>
      <Table pagination={{ pageSize: 4 }} rowSelection={rowSelection} columns={columns} dataSource={data} />
    </>
  );
}
