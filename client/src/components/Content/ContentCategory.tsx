'use client'
import { Modal, Popconfirm, Spin } from "antd";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import TableContent from "@/components/TableContent/TableContent";
import EditSortCategory from "@/components/EditSort/category/EditSortCategory";
import ActionCategory from "@/components/ActionFilter/category/ActionCategory";
import { useCategoryStore } from "@/stores/categoryStore";
import { ColumnsType } from "antd/es/table";
import FilterCategory from "@/components/ActionFilter/category/FilterCategory";
import ContentModalCategory from "@/components/ContentModal/category/ContentModalCategory";
import UpdateModalCategory from "@/components/ContentModal/category/UpdateModalCategory";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { DataType, SelectedContextType } from "@/types/table.d";
import { ICategory } from "@/types/modal.d";

const SelectedContextCategory = createContext<SelectedContextType | undefined>(undefined);

export default function ContentCategory() {
    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType<ICategory>>(null);
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);

    const { deleteCategory, fetchCategorys, loading, message, categorys } = useCategoryStore()
    const { accountLogin } = useAuthEmployee();



    useEffect(() => {
        fetchCategorys("?" + queryParams.toString() as string)
    }, [fetchCategorys, queryParams, message]);


    const handleDelete = async (id: string) => {
        try {
            const status = await deleteCategory(id);
            if (status !== 500) {
                toast.success("Xóa danh mục này thành công !!");
                fetchCategorys("?" + queryParams.toString() as string)
            }
        } catch (err) {
            toast.error("Xóa danh mục này thất bại do lỗi: " + err);
        }
    }



    const columns: ColumnsType<DataType<ICategory>> = [
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
            title: 'Parent',
            dataIndex: 'parent',
            key: 'parent',
            render: (_, { parent }) => {
                return <>{parent !== null && parent.name}</>
            }
        },
        {
            title: 'Action',
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

    let dataTable: DataType<ICategory>[] = [];
    if (!loading && categorys.length > 0 && accountLogin && accountLogin.role && accountLogin.role.permission.some(
        (p) => p.method === "GET" && p.path === "/api/v1/admin/category"
    )) {
        dataTable = categorys.map((item: ICategory, index) => {
            const row: DataType<ICategory> = {
                key: index.toString(),
                _id: item._id,
                name: item.name,
                parent: item.parent // assign the full parent object or undefined
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
                    <TableContent<DataType<ICategory>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
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
