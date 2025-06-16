'use client'
import { Modal, Popconfirm, Spin, Tag } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import TableContent from "@/components/TableContent/TableContent";
import { IAccountEmployee, useAccountEmployeeStore } from "@/stores/accountEmployeeStore";
import UpdateModalAccountEmployee from "@/components/ContentModal/account-employee/UpdateModalAccountEmployee";
import ActionAccountEmployee from "@/components/ActionFilter/account-employee/ActionAccountEmployee";
import FilterAccountEmployee from "@/components/ActionFilter/account-employee/FilterAccountEmployee";
import EditSortAccountEmployee from "@/components/EditSort/account-employee/EditSortAccountEmployee";
import ContentModalAccountEmployee from "@/components/ContentModal/account-employee/ContentModalAccountEmployee";
import { IEmployee } from "@/stores/employeeStore";


export interface DataType extends IAccountEmployee {
    key: string;
}

type SelectedContextType = {
    selectedRows: Array<string>;
    setSelectedRows: React.Dispatch<React.SetStateAction<Array<string>>>;
};

const SelectedAccountEmployeeContext = createContext<SelectedContextType | undefined>(undefined);


export default function Discount() {
    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType>(null);
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    const [fields, setFields] = useState<Array<string>>([
        "IDEmp",
        "password",
        "employee",
        "status",
    ]);

    const { accountEmployees, deleteAccountEmployee, fetchAccountEmployees, loading, message } = useAccountEmployeeStore()


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



    const columns: ColumnsType<DataType> = [
        ...fields.map((field) => {
            const columnConfig: ColumnType<DataType> = {
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
            }

            return columnConfig;
        }),
        // Cột action luôn xuất hiện
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div key={record._id} className='flex items-center gap-5'>
                    <FaPen
                        onClick={() => {
                            setOpen(true);
                            setDataClick(record);
                        }}
                        className='hover:text-blue-500 cursor-pointer'
                    />
                    <Popconfirm
                        title="Xóa dòng của bạn"
                        description="Bạn có chắc chắn muốn xóa dòng này ?"
                        onConfirm={() => handleDelete(record._id as string)}
                        okText="Xóa"
                        cancelText="Không"
                    >
                        <FaTrashAlt className='hover:text-red-500 cursor-pointer' />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    let dataTable: DataType[] = [];
    if (!loading && accountEmployees.length > 0) {
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
            return row as DataType;
        });
    }


    return (
        <>
            <SelectedAccountEmployeeContext.Provider value={{ selectedRows, setSelectedRows }} >
                <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                    <UpdateModalAccountEmployee setOpen={setOpen} dataAccountEmployee={dataClick} />
                </Modal>
                <div className="py-2">
                    <h2 className="text-center text-2xl font-bold">Trang tài khoản nhân viên</h2>
                    <ActionAccountEmployee ConfigFields={{ fields, setFields }} Filter={<FilterAccountEmployee />} EditSort={<EditSortAccountEmployee />} ContentModal={<ContentModalAccountEmployee />} />
                    <Spin size="large" spinning={loading}>
                        <TableContent<DataType> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
                    </Spin>
                </div>
            </SelectedAccountEmployeeContext.Provider>
        </>
    );
}

// Custom hook để dùng trong các component khác
export const useSelectedRowsAccountEmployee = () => {
    const context = useContext(SelectedAccountEmployeeContext);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong DiscountProvider");
    }
    return context;
};
