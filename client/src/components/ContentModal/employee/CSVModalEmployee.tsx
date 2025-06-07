'use client'
import TableContent from '@/components/TableContent/TableContent';
import { IEmployee } from '@/stores/employeeStore';
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Avatar, Spin, TableProps, Tag } from 'antd';



interface DataType extends IEmployee {
    key: string;
}

export default function TableImportCSV({ employees, loading }: { employees: DataType[], loading: boolean }) {

    const columns: TableProps<DataType>['columns'] = [
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
        },
        {
            title: 'Vai trò',
            key: 'role',
            dataIndex: 'role',
        }
    ];


    let dataTable: DataType[] = [];
    if (employees.length > 0) {
        dataTable = employees.map((item, index) => (
            {
                key: index.toString(),
                name: item.name,
                age: item.age,
                address: item.address,
                avatar: item.avatar,
                email: item.email,
                role: item.role,
                _id: item._id,
                gender: item.gender
            }
        ))
    }


    return (
        <>
            <Spin size='large' spinning={loading}>
                <h2 className='text-lg font-bold my-4'>Table employee</h2>
                <TableContent<DataType> columns={columns} data={dataTable}></TableContent>
            </Spin>
        </>
    );
}
