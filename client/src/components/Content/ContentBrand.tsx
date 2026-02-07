'use client'
import { Modal, Popconfirm, Spin, Tag } from "antd";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { createContext, useContext, useState, useEffect } from "react";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import TableContent from "@/components/TableContent/TableContent";
import EditSortBrand from "@/components/EditSort/brand/EditSortBrand";
import ActionBrand from "@/components/ActionFilter/brand/ActionBrand";
import { ColumnsType } from "antd/es/table";
import ContentModalBrand from "@/components/ContentModal/brand/ContentModalBrand";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { DataType, SelectedContextType } from "@/types/table.d";
import { IBrand } from "@/types/brand";
import { useBrands, useDeleteBrand } from "@/hooks/admin/useBrand";
import UpdateModalBrand from "@/components/ContentModal/brand/UpdateModalBrand";
import FilterBrand from "@/components/ActionFilter/brand/FilterBrand";

const SelectedContextBrand = createContext<SelectedContextType | undefined>(undefined);

export default function ContentBrand() {
    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType<IBrand>>(null);
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
    } = useBrands(isReady ? queryParams.toString() : "page=1&limit=10");

    // Axios interceptor already unwraps response.data, so result = { data: [...], page, limit, total, totalPages }
    const brands = result?.data || [];
    const paginationData = {
        currentPage: result?.page || 1,
        totalItems: result?.total || 0,
        itemsPerPage: result?.limit || 10,
    };

    const deleteBrand = useDeleteBrand();

    const handleDelete = async (id: string) => {
        try {
            await deleteBrand.mutateAsync(id);
        } catch (err) {
            // Error handling is done in the hook
            console.error('Delete failed:', err);
        }
    }

    const columns: ColumnsType<DataType<IBrand>> = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: 220,
            ellipsis: true,
        },
        {
            title: 'Logo',
            dataIndex: 'logo',
            key: 'logo',
            width: 80,
            render: (_, { logo }) => (
                <div className="w-12 h-12 flex items-center justify-center">
                    {logo ? (
                        <img src={logo} alt="Logo" className="w-full h-full object-contain rounded" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                            No Logo
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Tên thương hiệu',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 300,
            ellipsis: true,
        },
        {
            title: 'Website',
            dataIndex: 'website',
            key: 'website',
            width: 200,
            render: (_, { website }) => (
                website ? (
                    <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {website}
                    </a>
                ) : '-'
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (_, { status }) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <div key={record._id} className='flex items-center gap-5'>
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "PATCH" && p.path === "/api/v1/admin/brand/:id"
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
                        (p) => p.method === "DELETE" && p.path === "/api/v1/admin/brand/:id"
                    ) &&
                        <Popconfirm
                            title="Xóa thương hiệu"
                            description="Bạn có chắc chắn muốn xóa thương hiệu này?"
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

    let dataTable: DataType<IBrand>[] = [];
    if (!loading && brands.length > 0) {
        dataTable = brands.map((item: IBrand, index: number) => {
            const row: DataType<IBrand> = {
                key: index.toString(),
                _id: item._id,
                name: item.name,
                description: item.description,
                logo: item.logo,
                website: item.website,
                status: item.status,
            };
            return row;
        });
    }

    return (
        <>
            <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "PATCH" && p.path === "/api/v1/admin/brand/:id"
                ) &&
                    <UpdateModalBrand setOpen={setOpen} dataBrand={dataClick} />
                }
            </Modal>
            <SelectedContextBrand.Provider value={{ selectedRows, setSelectedRows }} >
                <ActionBrand Filter={<FilterBrand />} EditSort={<EditSortBrand />} ContentModal={<ContentModalBrand />} />
                <Spin size="large" spinning={loading}>
                    <TableContent<DataType<IBrand>>
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        columns={columns}
                        data={dataTable}
                        pagination={{
                            current: paginationData.currentPage,
                            pageSize: paginationData.itemsPerPage,
                            total: paginationData.totalItems,
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
            </SelectedContextBrand.Provider>
        </>
    )
}

// Custom hook để dùng trong các component khác
export const useSelectedRowsBrand = () => {
    const context = useContext(SelectedContextBrand);
    if (!context) {
        throw new Error("useSelectedRowsBrand phải được dùng trong Brand Provider");
    }
    return context;
};
