'use client'
import { useSelectedRowsEmployee } from '@/app/(admin)/admin/employee/page';
import TableContent from '@/components/TableContent/TableContent';
import { IEmployee } from '@/types/modal.d';
import { DataType } from '@/types/table.d';
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Avatar, Spin, TableProps, Tag } from 'antd';





export default function TableImportEmployeeCSV({ employees, loading }: { employees: DataType<IEmployee>[], loading: boolean }) {
    const { selectedRows, setSelectedRows } = useSelectedRowsEmployee();

    const columns: TableProps<DataType<IEmployee>>['columns'] = [
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
            render: (_, { name, avatar }) => {
                return (
                    <div className="flex items-center gap-4">
                        <Avatar src={avatar} alt={name} />
                        <h2 className="text-md">{name}</h2>
                    </div>
                )
            },
        },
        {
            title: 'Tuổi',
            dataIndex: 'age',
            key: 'age',
            render: (_, { age }) => {
                return (
                    <Tag color="cyan">{age}</Tag>
                )
            }
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (_, { gender }) => {
                return (
                    <Tag color={gender === "Nam" ? "blue" : "pink"}>{gender}</Tag>
                )
            }
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Address',
            key: 'address',
            dataIndex: 'address',
        }
    ];


    let dataTable: DataType<IEmployee>[] = [];
    if (employees.length > 0) {
        dataTable = employees.map((item, index) => (
            {
                key: index.toString(),
                name: item.name,
                age: item.age,
                address: item.address,
                avatar: item.avatar,
                email: item.email,
                _id: item._id,
                gender: item.gender
            }
        ))
    }


    return (
        <>
            <Spin size='large' spinning={loading}>
                <h2 className='text-lg font-bold my-4'>Table employee</h2>
                <TableContent<DataType<IEmployee>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
            </Spin>
        </>
    );
}
