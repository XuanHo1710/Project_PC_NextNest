'use client'
import ActionAccountEmployee from "@/components/ActionFilter/account-employee/ActionAccountEmployee";
import FilterAccountEmployee from "@/components/ActionFilter/account-employee/FilterAccountEmployee";
import ContentModalAccountEmployee from "@/components/ContentModal/account-employee/ContentModalAccountEmployee";
import UpdateModalAccountEmployee from "@/components/ContentModal/account-employee/UpdateModalAccountEmployee";
import DetailModalAccountEmployee from "@/components/ContentModal/account-employee/DetailModalAccountEmployee";
import EditSortAccountEmployee from "@/components/EditSort/account-employee/EditSortAccountEmployee";
import TableContent from "@/components/TableContent/TableContent";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import { IAccountEmployee } from "@/types";
import { DataType, SelectedContextType } from "@/types/table.d";
import { Avatar, Modal, Popconfirm, Spin, Tag } from "antd";
import { ColumnsType, ColumnType } from "antd/es/table";
import { createContext, useContext, useState, useEffect } from "react";
import { FaPen, FaTrashAlt, FaEye } from "react-icons/fa";
import { useAccountEmployees, useDeleteAccountEmployee } from "@/hooks/admin";

const SelectedAccountEmployeeContext = createContext<SelectedContextType | undefined>(undefined);

export default function ContentAccountEmployee() {

    const [isOpen, setOpen] = useState(false);
    const [isOpenDetail, setOpenDetail] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType<IAccountEmployee>>(null);
    const [dataDetail, setDataDetail] = useState<null | DataType<IAccountEmployee>>(null);
    const { queryParams, setQueryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    const [isReady, setIsReady] = useState(false);
    const [fields, setFields] = useState<Array<string>>([
        "IDEmp",
        "avatar",
        "name",
        "email",
        "status",
        "roleId",
        "age",
        "gender"
    ]);

    // Reset pagination to page=1 when component mounts and wait for it to complete
    useEffect(() => {
        // Set default pagination params
        setQueryParams(new URLSearchParams("page=1&limit=10"));
        // Mark as ready after setting params
        setIsReady(true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Use TanStack Query hooks - only enable when ready
    const {
        data: result,
        isLoading: loading
    } = useAccountEmployees(isReady ? queryParams.toString() : "page=1&limit=10");

    // Axios interceptor already unwraps response.data, so result = { data: [...], pagination: {...} }
    const accountEmployees = (result as any)?.data || [];
    const pagination = (result as any)?.pagination || { currentPage: 1, totalItems: 0, itemsPerPage: 10 };

    const deleteAccountEmployee = useDeleteAccountEmployee();
    const { accountLogin } = useAuthEmployee();

    const handleDelete = async (id: string) => {
        try {
            await deleteAccountEmployee.mutateAsync(id);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    }

    const columns: ColumnsType<DataType<IAccountEmployee>> = [
        ...fields.map((field) => {
            const columnConfig: ColumnType<DataType<IAccountEmployee>> = {
                title: getFieldTitle(field),
                dataIndex: field,
                key: field,
            };

            if (field === "avatar") {
                columnConfig.render = (_: unknown, record: DataType<IAccountEmployee>) => (
                    record.avatar ? <Avatar src={record.avatar} alt={record.name || 'Avatar'} /> : <Avatar>{record.name?.charAt(0) || 'U'}</Avatar>
                );
            } else if (field === "status") {
                columnConfig.render = (_: unknown, { status }: { status: string }) => (
                    <Tag color={status === "ACTIVE" ? "green" : "volcano"}>{status === "ACTIVE" ? "Hoạt động" : "Dừng hoạt động"}</Tag>
                );

            } else if (field === "roleId") {
                columnConfig.render = (_: unknown, record: DataType<IAccountEmployee>) => (
                    <Tag color="blue">{record.roleId?.name || "Chưa có"}</Tag>
                );
            } else if (field === "gender") {
                columnConfig.render = (_: unknown, record: DataType<IAccountEmployee>) => (
                    <Tag color={record.gender === "MALE" ? "blue" : record.gender === "FEMALE" ? "magenta" : "default"}>
                        {record.gender === "MALE" ? "Nam" : record.gender === "FEMALE" ? "Nữ" : "Khác"}
                    </Tag>
                );
            }

            return columnConfig;
        }),
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div key={record._id} className='flex items-center gap-5'>
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "GET" && p.path === "/api/v1/admin/account-employee"
                    ) &&
                        <FaEye
                            onClick={() => {
                                setOpenDetail(true);
                                setDataDetail(record);
                            }}
                            className='hover:text-green-500 cursor-pointer text-lg'
                            title="Xem chi tiết"
                        />
                    }

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
                            title="Xóa tài khoản nhân viên"
                            description="Bạn có chắc chắn muốn xóa tài khoản này?"
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
        dataTable = accountEmployees.map((item: IAccountEmployee, index: number) => {
            return {
                key: index.toString(),
                _id: item._id,
                IDEmp: item.IDEmp,
                avatar: item.avatar,
                name: item.name,
                email: item.email,
                status: item.status,
                roleId: item.roleId,
                gender: item.gender,
                age: item.age,
            } as DataType<IAccountEmployee>;
        });
    }

    return (
        <>
            <DetailModalAccountEmployee isOpen={isOpenDetail} setOpen={setOpenDetail} data={dataDetail} />
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
                    <TableContent<DataType<IAccountEmployee>>
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        columns={columns}
                        data={dataTable}
                        pagination={{
                            current: pagination.currentPage,
                            pageSize: pagination.itemsPerPage,
                            total: pagination.totalItems,
                            onChange: (page: number, pageSize: number) => {
                                setQueryParams((prev) => {
                                    const newParams = new URLSearchParams(prev);
                                    newParams.set('page', page.toString());
                                    newParams.set('limit', pageSize.toString());
                                    return newParams;
                                });
                            }
                        }}
                    ></TableContent>
                </Spin>
            </SelectedAccountEmployeeContext.Provider>
        </>
    )
}

function getFieldTitle(field: string): string {
    const titles: Record<string, string> = {
        IDEmp: "Mã NV",
        avatar: "Ảnh",
        name: "Họ tên",
        email: "Email",
        status: "Trạng thái",
        roleId: "Vai trò",
        gender: "Giới tính",
        age: "Tuổi",
        phone: "SĐT"
    };
    return titles[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

export const useSelectedRowsAccountEmployee = () => {
    const context = useContext(SelectedAccountEmployeeContext);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong DiscountProvider");
    }
    return context;
};