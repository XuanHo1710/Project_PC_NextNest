'use client'
import TableContent from "@/components/TableContent/TableContent";
import { Popconfirm, TableProps, Tag } from "antd";
import { FaPen, FaTrashAlt } from "react-icons/fa";


interface DataType {
    key: string;
    name: string;
    age: number;
    address: string;
    tags: string[];
}

const columns: TableProps<DataType>['columns'] = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <a>{text}</a>,
    },
    {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: 'Tags',
        key: 'tags',
        dataIndex: 'tags',
        render: (_, { tags }) => (
            <>
                {tags.map((tag) => {
                    let color = tag.length > 5 ? 'geekblue' : 'green';
                    if (tag === 'loser') {
                        color = 'volcano';
                    }
                    return (
                        <Tag color={color} key={tag}>
                            {tag.toUpperCase()}
                        </Tag>
                    );
                })}
            </>
        ),
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <>
                <div key={record.name} className='flex items-center gap-5'>
                    <FaPen className='hover:text-blue-500 cursor-pointer' />
                    <Popconfirm
                        title="Xóa dòng của bạn"
                        description="Bạn có chắc chắn muốn xóa dòng này ?"
                        // onConfirm={confirm}
                        // onCancel={cancel}
                        okText="Xóa"
                        cancelText="Không"
                    >
                        <FaTrashAlt className='hover:text-red-500 cursor-pointer' />
                    </Popconfirm>
                </div>
            </>
        ),
    },
];

const data: DataType[] = [
    {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
        tags: ['nice', 'developer'],
    },
    {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
        tags: ['loser'],
    },
    {
        key: '4',
        name: 'Joe Black',
        age: 32,
        address: 'Sydney No. 1 Lake Park',
        tags: ['cool', 'teacher'],
    },
    {
        key: '5',
        name: 'Joe Black',
        age: 32,
        address: 'Sydney No. 1 Lake Park',
        tags: ['cool', 'teacher'],
    },
    {
        key: '6',
        name: 'Joe Black',
        age: 32,
        address: 'Sydney No. 1 Lake Park',
        tags: ['cool', 'teacher'],
    },
];

export default function Product() {
    return (
        <>
            <div className="py-2">
                <h2 className="text-center text-2xl font-bold">Trang sản phẩm</h2>
                {/* <ActionEmployee ContentModal={<ContentModalProduct />}></ActionEmployee> */}
                <TableContent data={data} columns={columns} ></TableContent>
            </div>
        </>
    );
}
