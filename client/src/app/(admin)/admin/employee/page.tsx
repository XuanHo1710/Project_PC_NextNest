'use client'
import { Avatar, Modal, Popconfirm, Spin, TableProps, Tag } from "antd";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { IEmployee, useEmployeeStore } from "@/stores/employeeStore";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import UpdateModalEmployee from "@/components/ContentModal/employee/UpdateModalEmployee";
import ActionEmployee from "@/components/ActionFilter/employee/ActionEmployee";
import FilterEmployee from "@/components/ActionFilter/employee/FilterEmployee";
import EditSortEmployee from "@/components/EditSort/employee/EditSortEmployee";
import ContentModalEmployee from "@/components/ContentModal/employee/ContentModalEmployee";
import TableContent from "@/components/TableContent/TableContent";


export interface DataType extends IEmployee {
    key: string;
}

type SelectedContextType = {
    selectedRows: Array<string>;
    setSelectedRows: React.Dispatch<React.SetStateAction<Array<string>>>;
};

const SelectedContext = createContext<SelectedContextType | undefined>(undefined);


export default function Employee() {

    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType>(null);
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);

    const { employees, deleteEmployee, fetchEmployees, loading, message } = useEmployeeStore()


    useEffect(() => {
        fetchEmployees("?" + queryParams.toString() as string)
    }, [fetchEmployees, queryParams, message]);


    const handleDelete = async (id: string) => {
        try {
            const status = await deleteEmployee(id);
            if (status !== 500)
                toast.success("Xóa nhân viên này thành công !!");
        } catch (err) {
            toast.error("Xóa nhân viên này thất bại do lỗi: " + err);
        }
    }

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
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <>
                    <div key={record._id} className='flex items-center gap-5'>
                        <FaPen onClick={() => { setOpen(true); setDataClick(record); }} className='hover:text-blue-500 cursor-pointer' />
                        <Popconfirm
                            title="Xóa dòng của bạn"
                            description="Bạn có chắc chắn muốn xóa dòng này ?"
                            onConfirm={() => handleDelete(record._id as string)}
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

    let dataTable: DataType[] = [];
    if (!loading && employees.length > 0) {
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
            <SelectedContext.Provider value={{ selectedRows, setSelectedRows }} >
                <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                    <UpdateModalEmployee setOpen={setOpen} dataEmployee={dataClick} />
                </Modal>
                <div className="py-2">
                    <h2 className="text-center text-2xl font-bold">Trang nhân viên</h2>
                    <ActionEmployee Filter={<FilterEmployee />} EditSort={<EditSortEmployee />} ContentModal={<ContentModalEmployee />}></ActionEmployee>
                    <Spin size="large" spinning={loading}>
                        <TableContent<DataType> columns={columns} data={dataTable}></TableContent>
                    </Spin>
                </div>
            </SelectedContext.Provider>
        </>
    );
}

// Custom hook để dùng trong các component khác
export const useSelectedRowsEmployee = () => {
    const context = useContext(SelectedContext);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong QueryParamsProvider");
    }
    return context;
};
