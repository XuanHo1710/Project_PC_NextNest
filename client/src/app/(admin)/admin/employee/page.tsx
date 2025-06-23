'use client'
import { Avatar, Modal, Popconfirm, Spin, Tag } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import UpdateModalEmployee from "@/components/ContentModal/employee/UpdateModalEmployee";
import ActionEmployee from "@/components/ActionFilter/employee/ActionEmployee";
import FilterEmployee from "@/components/ActionFilter/employee/FilterEmployee";
import EditSortEmployee from "@/components/EditSort/employee/EditSortEmployee";
import ContentModalEmployee from "@/components/ContentModal/employee/ContentModalEmployee";
import TableContent from "@/components/TableContent/TableContent";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { DataType, SelectedContextType } from "@/types/table.d";
import { IEmployee } from "@/types/modal.d";


const SelectedContext = createContext<SelectedContextType | undefined>(undefined);


export default function Employee() {

    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType<IEmployee>>(null);
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    const [fields, setFields] = useState<Array<string>>([
        "name",
        "age",
        "address",
        "email",
        "gender",
    ]);

    const { employees, deleteEmployee, fetchEmployees, loading, message } = useEmployeeStore();
    const { accountLogin } = useAuthEmployee();



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



    const columns: ColumnsType<DataType<IEmployee>> = [
        ...fields.map((field) => {
            const columnConfig: ColumnType<DataType<IEmployee>> = {
                title: field.charAt(0).toUpperCase() + field.slice(1), // Tạo title từ field
                dataIndex: field,
                key: field,
            };

            // Thêm render tùy chỉnh cho các trường cụ thể
            if (field === "name") {
                columnConfig.render = (_: unknown, { name, avatar }: { name: string, avatar: string }) => (
                    <div className="flex items-center gap-4">
                        <Avatar src={avatar} alt={name} />
                        <h2 className="text-md">{name}</h2>
                    </div>
                );
            } else if (field === "age") {
                columnConfig.render = (_: unknown, { age }: { age: number }) => (
                    <Tag color="cyan">{age}</Tag>
                );
            } else if (field === "gender") {
                columnConfig.render = (_: unknown, { gender }: { gender: string }) => (
                    <Tag color={gender === "Nam" ? "blue" : "pink"}>{gender}</Tag>
                );
            }

            return columnConfig;
        }),
        // Cột action luôn xuất hiện
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div key={record._id} className='flex items-center gap-5'>
                    {accountLogin && accountLogin.role.permission.some(
                        (p) => p.method === "PATCH" && p.path === "/api/v1/admin/employee/:id"
                    ) &&
                        <FaPen
                            onClick={() => {
                                setOpen(true);
                                setDataClick(record);
                            }}
                            className='hover:text-blue-500 cursor-pointer'
                        />
                    }

                    {accountLogin && accountLogin.role.permission.some(
                        (p) => p.method === "DELETE" && p.path === "/api/v1/admin/employee/:id"
                    ) &&
                        <Popconfirm
                            title="Xóa dòng của bạn"
                            description="Bạn có chắc chắn muốn xóa dòng này ?"
                            onConfirm={() => handleDelete(record._id as string)}
                            okText="Xóa"
                            cancelText="Không"
                        >
                            <FaTrashAlt className='hover:text-red-500 cursor-pointer' />
                        </Popconfirm>
                    }
                </div>
            ),
        },
    ];

    let dataTable: DataType<IEmployee>[] = [];
    if (!loading && employees.length > 0 && accountLogin && accountLogin.role.permission.some(
        (p) => p.method === "GET" && p.path === "/api/v1/admin/employee"
    )) {
        dataTable = employees.map((item, index) => {
            const row = {
                key: index.toString(),
                avatar: item.avatar,
                _id: item._id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...fields.reduce((acc: any, field: any) => {
                    if (item.hasOwnProperty(field)) {
                        acc[field] = item[field as keyof IEmployee];
                    }
                    return acc;
                }, {}),
            };
            return row as DataType<IEmployee>;
        });
    }


    return (
        <>
            <SelectedContext.Provider value={{ selectedRows, setSelectedRows }} >
                <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                    {accountLogin && accountLogin.role.permission.some(
                        (p) => p.method === "PATCH" && p.path === "/api/v1/admin/employee/:id"
                    ) &&
                        <UpdateModalEmployee setOpen={setOpen} dataEmployee={dataClick} />
                    }
                </Modal>
                <div className="py-2">
                    <h2 className="text-center text-2xl font-bold">Trang nhân viên</h2>
                    <ActionEmployee ConfigFields={{ fields, setFields }} Filter={<FilterEmployee />} EditSort={<EditSortEmployee />} ContentModal={<ContentModalEmployee />}></ActionEmployee>
                    <Spin size="large" spinning={loading}>
                        <TableContent<DataType<IEmployee>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
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
        throw new Error("useQueryParams phải được dùng trong EmployeeProvider");
    }
    return context;
};
