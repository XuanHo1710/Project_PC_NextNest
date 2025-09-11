'use client'

import { Modal, Popconfirm, Spin } from "antd";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import TableContent from "@/components/TableContent/TableContent";
import { ColumnsType } from "antd/es/table";
import { useRoleStore } from "@/stores/roleStore";
import UpdateModalRole from "@/components/ContentModal/role/UpdateModalRole";
import ActionRole from "@/components/ActionFilter/role/ActionRole";
import FilterRole from "@/components/ActionFilter/role/FilterRole";
import EditSortRole from "@/components/EditSort/role/EditSortRole";
import ContentModalRole from "@/components/ContentModal/role/ContentModalRole";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { DataType, SelectedContextType } from "@/types/table.d";
import { IRole } from "@/types/modal.d";


const SelectedContextRole = createContext<SelectedContextType | undefined>(undefined);


export default function ContentRole() {
    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType<IRole>>(null);
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);

    const { deleteRole, fetchRoles, loading, message, roles } = useRoleStore();
    const { accountLogin } = useAuthEmployee();



    useEffect(() => {
        fetchRoles("?" + queryParams.toString() as string)
    }, [fetchRoles, queryParams, message]);


    const handleDelete = async (id: string) => {
        try {
            const status = await deleteRole(id);
            if (status !== 500) {
                toast.success("Xóa vai trò này thành công !!");
                fetchRoles("?" + queryParams.toString() as string)
            }
        } catch (err) {
            toast.error("Xóa vai trò này thất bại do lỗi: " + err);
        }
    }



    const columns: ColumnsType<DataType<IRole>> = [
        {
            title: '_id',
            dataIndex: '_id',
            key: '_id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (_, { description }) => {
                return <>{description}</>
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div key={record._id} className='flex items-center gap-5'>
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "PATCH" && p.path === "/api/v1/admin/role/:id"
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
                        (p) => p.method === "DELETE" && p.path === "/api/v1/admin/role/:id"
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

    let dataTable: DataType<IRole>[] = [];
    if (!loading && roles.length > 0 && accountLogin && accountLogin.role && accountLogin.role.permission.some(
        (p) => p.method === "GET" && p.path === "/api/v1/admin/role"
    )) {
        dataTable = roles.map((item: IRole, index) => {
            const row: DataType<IRole> = {
                key: index.toString(),
                _id: item._id,
                name: item.name,
                description: item.description,
                permission: item.permission
            };
            return row;
        });
    }
    return (
        <>
            <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "PATCH" && p.path === "/api/v1/admin/role/:id"
                ) &&
                    <UpdateModalRole setOpen={setOpen} dataRole={dataClick} />
                }
            </Modal>
            <SelectedContextRole.Provider value={{ selectedRows, setSelectedRows }} >
                <ActionRole Filter={<FilterRole />} EditSort={<EditSortRole />} ContentModal={<ContentModalRole />} />
                <Spin size="large" spinning={loading}>
                    <TableContent<DataType<IRole>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
                </Spin>
            </SelectedContextRole.Provider>
        </>
    )
}

// Custom hook để dùng trong các component khác
export const useSelectedRowsRole = () => {
    const context = useContext(SelectedContextRole);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong Role Provider");
    }
    return context;
};