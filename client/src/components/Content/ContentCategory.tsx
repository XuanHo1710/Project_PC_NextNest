'use client'
import { Modal, Popconfirm, Spin } from "antd";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { createContext, useContext, useState, useEffect } from "react";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import TableContent from "@/components/TableContent/TableContent";
import EditSortCategory from "@/components/EditSort/category/EditSortCategory";
import ActionCategory from "@/components/ActionFilter/category/ActionCategory";
import { ColumnsType } from "antd/es/table";
import FilterCategory from "@/components/ActionFilter/category/FilterCategory";
import ContentModalCategory from "@/components/ContentModal/category/ContentModalCategory";
import UpdateModalCategory from "@/components/ContentModal/category/UpdateModalCategory";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { DataType, SelectedContextType } from "@/types/table.d";
import { ICategory } from "@/types/category";
import { useCategories, useDeleteCategory } from "@/hooks/admin/useCategory";

// Extended type for category with parent name
type CategoryWithParent = ICategory & { parentName?: string };

// Helper to get parent name from populated parentId
const getParentName = (parentId: ICategory['parentId']): string | undefined => {
    if (!parentId) return undefined;
    if (typeof parentId === 'object' && parentId.name) {
        return parentId.name;
    }
    return undefined;
};

const SelectedContextCategory = createContext<SelectedContextType | undefined>(undefined);

export default function ContentCategory() {
    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType<CategoryWithParent>>(null);
    const { queryParams, setQueryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    const [isReady, setIsReady] = useState(false);

    const { accountLogin } = useAuthEmployee();

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
    } = useCategories(isReady ? queryParams.toString() : "page=1&limit=10");


    const deleteCategory = useDeleteCategory();

    const handleDelete = async (id: string) => {
        try {
            await deleteCategory.mutateAsync(id);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    }

    const columns: ColumnsType<DataType<CategoryWithParent>> = [
        {
            title: '_id',
            dataIndex: '_id',
            key: '_id',
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Danh mục cha',
            dataIndex: 'parentName',
            key: 'parentName',
            render: (_, record) => {
                return <>{record.parentName || 'Không có'}</>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div key={record._id} className='flex items-center gap-5'>
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "PATCH" && p.path === "/api/v1/admin/category/:id"
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
                        (p) => p.method === "DELETE" && p.path === "/api/v1/admin/category/:id"
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

    // Build data table - parentId is already populated from backend
    let dataTable: DataType<CategoryWithParent>[] = [];
    if (!loading && result?.data && result.data.length > 0) {
        dataTable = result.data.map((item: ICategory, index: number) => {
            const row: DataType<CategoryWithParent> = {
                key: index.toString(),
                _id: item._id,
                name: item.name,
                parentId: item.parentId,
                slug: item.slug,
                parentName: getParentName(item.parentId),
            };
            return row;
        });
    }

    return (
        <>
            <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "PATCH" && p.path === "/api/v1/admin/category/:id"
                ) &&
                    <UpdateModalCategory setOpen={setOpen} dataCategory={dataClick} />
                }
            </Modal>
            <SelectedContextCategory.Provider value={{ selectedRows, setSelectedRows }} >
                <ActionCategory Filter={<FilterCategory />} EditSort={<EditSortCategory />} ContentModal={<ContentModalCategory />} />
                <Spin size="large" spinning={loading}>
                    <TableContent<DataType<CategoryWithParent>>
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        columns={columns}
                        data={dataTable}
                        pagination={{
                            current: result?.pagination?.currentPage || 1,
                            pageSize: result?.pagination?.itemsPerPage || 10,
                            total: result?.pagination?.totalItems || 0,
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
            </SelectedContextCategory.Provider>
        </>
    )
}

// Custom hook để dùng trong các component khác
export const useSelectedRowsCategory = () => {
    const context = useContext(SelectedContextCategory);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong Category Provider");
    }
    return context;
};
