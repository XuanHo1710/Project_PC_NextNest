'use client'
import ActionAccountEmployee from "@/components/ActionFilter/account-employee/ActionAccountEmployee";
import FilterAccountEmployee from "@/components/ActionFilter/account-employee/FilterAccountEmployee";
import ContentModalAccountEmployee from "@/components/ContentModal/account-employee/ContentModalAccountEmployee";
import UpdateModalAccountEmployee from "@/components/ContentModal/account-employee/UpdateModalAccountEmployee";
import EditSortAccountEmployee from "@/components/EditSort/account-employee/EditSortAccountEmployee";
import TableContent from "@/components/TableContent/TableContent";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import { useAccountEmployeeStore } from "@/stores/server/accountEmployeeStore";
import { IAccountEmployee, IEmployee } from "@/types/modal.d";
import { DataType, SelectedContextType } from "@/types/table.d";
import { Modal, Popconfirm, Spin, Tag } from "antd";
import { ColumnsType, ColumnType } from "antd/es/table";
import { createContext, useContext, useEffect, useState } from "react";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";



const SelectedAccountEmployeeContext = createContext<SelectedContextType | undefined>(undefined);

export default function ContentAccountEmployee() {

    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType<IAccountEmployee>>(null);
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    const [fields, setFields] = useState<Array<string>>([
        "IDEmp",
        "password",
        "employee",
        "status",
        "role"
    ]);

    const { accountEmployees, deleteAccountEmployee, fetchAccountEmployees, loading, message } = useAccountEmployeeStore()
    const { accountLogin } = useAuthEmployee();


    useEffect(() => {
        fetchAccountEmployees("?" + queryParams.toString() as string)
    }, [fetchAccountEmployees, queryParams, message]);


    const handleDelete = async (id: string) => {
        try {
            const status = await deleteAccountEmployee(id);
            if (status !== 500)
                toast.success("Xóa tài khoản này thành công !!");
        } catch (err) {
            toast.error("Xóa tài khoản này thất bại do lỗi: " + err);
        }
    }



    const columns: ColumnsType<DataType<IAccountEmployee>> = [
        ...fields.map((field) => {
            const columnConfig: ColumnType<DataType<IAccountEmployee>> = {
                title: field.charAt(0).toUpperCase() + field.slice(1), // Tạo title từ field
                dataIndex: field,
                key: field,
            };

            // Thêm render tùy chỉnh cho các trường cụ thể
            if (field === "password") {
                columnConfig.render = () => (
                    <h2>-----------------------------</h2>
                );
            } else if (field === "status") {
                columnConfig.render = (_: unknown, { status }: { status: string }) => (
                    <Tag color={status === "ACTIVE" ? "green-inverse" : "volcano-inverse"}>{status === "ACTIVE" ? "Hoạt động" : "Dừng hoạt động"}</Tag>
                );
            } else if (field === "employee") {
                columnConfig.render = (_: unknown, { employee }: { employee: IEmployee }) => (
                    <h2>{employee.name}</h2>
                );
            } else if (field === "role") {
                columnConfig.render = (_: unknown, record: DataType<IAccountEmployee>) => (
                    <h2>{record.role?.name ? record.role.name : ""}</h2>
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
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "PATCH" && p.path === "/api/v1/admin/account-employee/:id"
                    ) &&
                        <FaPen
                            onClick={() => {
                                setOpen(true);
                                setDataClick(record);
                            }}
                            className='hover:text-blue-500 cursor-pointer'
                        />
                    }
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "DELETE" && p.path === "/api/v1/admin/account-employee/:id"
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

    let dataTable: DataType<IAccountEmployee>[] = [];
    if (!loading && accountEmployees.length > 0 && accountLogin && accountLogin.role && accountLogin.role.permission.some(
        (p) => p.method === "GET" && p.path === "/api/v1/admin/account-employee"
    )) {
        dataTable = accountEmployees.map((item, index) => {
            const row = {
                key: index.toString(),
                _id: item._id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...fields.reduce((acc: any, field: any) => {
                    if (item.hasOwnProperty(field)) {
                        acc[field] = item[field as keyof IAccountEmployee];
                    }
                    return acc;
                }, {}),
            };
            return row as DataType<IAccountEmployee>;
        });
    }


    return (
        <>
            <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "PATCH" && p.path === "/api/v1/admin/account-employee/:id"
                ) &&
                    <UpdateModalAccountEmployee setOpen={setOpen} dataAccountEmployee={dataClick} />
                }
            </Modal>
            <SelectedAccountEmployeeContext.Provider value={{ selectedRows, setSelectedRows }} >
                <ActionAccountEmployee ConfigFields={{ fields, setFields }} Filter={<FilterAccountEmployee />} EditSort={<EditSortAccountEmployee />} ContentModal={<ContentModalAccountEmployee />} />
                <Spin size="large" spinning={loading}>
                    <TableContent<DataType<IAccountEmployee>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
                </Spin>
            </SelectedAccountEmployeeContext.Provider>
        </>
    )
}


// Custom hook để dùng trong các component khác
export const useSelectedRowsAccountEmployee = () => {
    const context = useContext(SelectedAccountEmployeeContext);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong DiscountProvider");
    }
    return context;
};