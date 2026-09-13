'use client'

import { Modal, Spin } from "antd";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { createContext, useContext, useState, useEffect } from "react";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import TableContent from "@/components/TableContent/TableContent";
import { ColumnsType } from "antd/es/table";
import UpdateModalRole from "@/components/ContentModal/role/UpdateModalRole";
import ActionRole from "@/components/ActionFilter/role/ActionRole";
import FilterRole from "@/components/ActionFilter/role/FilterRole";
import EditSortRole from "@/components/EditSort/role/EditSortRole";
import ContentModalRole from "@/components/ContentModal/role/ContentModalRole";
import ConfirmDeletePopconfirm from "@/components/common/ConfirmDeletePopconfirm";
import { DataType, SelectedContextType } from "@/types/table.d";
import { IRole } from "@/types/role";
import { useRoles, useDeleteRole } from "@/hooks/admin";
import { useHasPermission } from "@/hooks/admin/useHasPermission";


const SelectedContextRole = createContext<SelectedContextType | undefined>(undefined);


export default function ContentRole() {
    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType<IRole>>(null);
    const { queryParams, setQueryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    const [isReady, setIsReady] = useState(false);

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
    } = useRoles(isReady ? queryParams.toString() : "page=1&limit=10");

    // Axios interceptor already unwraps response.data, so result = { data: [...], pagination: {...} }
    const roles = (result as any)?.data || [];
    const pagination = (result as any)?.pagination || { currentPage: 1, totalItems: 0, itemsPerPage: 10 };

    const deleteRole = useDeleteRole();
    const hasPermission = useHasPermission();

    // Hard delete: role is removed via service.delete().
    const handleDelete = async (id: string) => {
        try {
            await deleteRole.mutateAsync(id);
        } catch (err) {
            // Error handling is done in the hook
            console.error('Delete failed:', err);
        }
    }



    const columns: ColumnsType<DataType<IRole>> = [
        {
            title: '_id',
            dataIndex: '_id',
            key: '_id',
        },
        {
            title: 'Tên vai trò',
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
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div key={record._id} className='flex items-center gap-5'>
                    {hasPermission("PATCH", "/api/v1/admin/role/:id") &&
                        <FaPen
                            onClick={() => {
                                setOpen(true);
                                setDataClick(record);
                            }}
                            className='hover:text-blue-500 cursor-pointer'
                        />
                    }
                    {hasPermission("DELETE", "/api/v1/admin/role/:id") &&
                        <ConfirmDeletePopconfirm
                            onConfirm={() => handleDelete(record._id as string)}
                            loading={deleteRole.isPending}
                        >
                            <FaTrashAlt className='hover:text-red-500 cursor-pointer' />
                        </ConfirmDeletePopconfirm>
                    }
                </div>
            ),
        },
    ];

    let dataTable: DataType<IRole>[] = [];
    if (!loading && roles.length > 0 && hasPermission("GET", "/api/v1/admin/role")) {
        dataTable = roles.map((item: IRole, index: number) => {
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
                {hasPermission("PATCH", "/api/v1/admin/role/:id") &&
                    <UpdateModalRole setOpen={setOpen} dataRole={dataClick} />
                }
            </Modal>
            <SelectedContextRole.Provider value={{ selectedRows, setSelectedRows }} >
                <ActionRole Filter={<FilterRole />} EditSort={<EditSortRole />} ContentModal={<ContentModalRole />} />
                <Spin size="large" spinning={loading}>
                    <TableContent<DataType<IRole>>
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