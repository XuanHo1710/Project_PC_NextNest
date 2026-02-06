'use client'

import { Table } from "antd";
import { ColumnsType } from 'antd/es/table';



type TableContentProps<T> = {
  columns: ColumnsType<T>;
  data: T[];
  selectedRows: Array<string>;
  setSelectedRows: React.Dispatch<React.SetStateAction<Array<string>>>;
};

export default function TableContent<T extends { _id?: string }>({ data, columns, setSelectedRows, selectedRows }: TableContentProps<T>) {

  // Selection row key
  const ChangeSelectionRow = (_: unknown, elementsSelect: T[]) => {
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
      {/* <div className="overflow-x-auto max-w-full"> */}
      <Table
        // scroll={{ x: 'max-content', y: 200 }}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 4 }}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
      />
      {/* </div> */}
    </>
  );
}
