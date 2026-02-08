'use client'
import ActionProduct from "@/components/ActionFilter/product/ActionProduct";
import FilterProduct from "@/components/ActionFilter/product/FilterProduct";
import ContentModalProduct from "@/components/ContentModal/product/ContentModalProduct";
import UpdateModalProduct from "@/components/ContentModal/product/UpdateModalProduct";
import EditSortProduct from "@/components/EditSort/product/EditSortProduct";
import TableContent from "@/components/TableContent/TableContent";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import { ICategory } from "@/types/category";
import { IProduct } from "@/types/product";
import { DataType, SelectedContextType } from "@/types/table.d";
import { Modal, Spin, Tag, Input, Descriptions, Divider } from "antd";
import { ColumnsType, ColumnType } from "antd/es/table";
import { createContext, useContext, useState } from "react";
import { FaPen, FaTrashAlt, FaEye } from "react-icons/fa";
import { useProducts, useUpdateProduct } from "@/hooks/admin";


const SelectedProductContext = createContext<SelectedContextType | undefined>(undefined);


export default function ContentProduct() {
    const [isOpen, setOpen] = useState(false);
    const { accountLogin } = useAuthEmployee();
    const [dataClick, setDataClick] = useState<null | DataType<IProduct>>(null);
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);

    // Soft-delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Detail modal state
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState<DataType<IProduct> | null>(null);

    const [fields, setFields] = useState<Array<string>>([
        "name",
        "images",
        "category",
        "maxPrice",
        "stock",
        "soldCount",
        "status",
        "position",
        "feature",
        "discount",
        "minPrice"
    ]);

    // Use TanStack Query hooks
    const {
        data: productsResponse,
        isLoading: loading
    } = useProducts(queryParams.toString());

    const products = productsResponse?.data ?? [];

    const updateProduct = useUpdateProduct();

    const handleSoftDelete = async () => {
        if (!deleteTarget || !deleteReason.trim()) return;
        setDeleteLoading(true);
        try {
            await updateProduct.mutateAsync({
                id: deleteTarget,
                data: { isDeleted: true, deleteReason: deleteReason.trim() } as Partial<IProduct>,
            });
        } catch (err) {
            console.error('Soft delete failed:', err);
        } finally {
            setDeleteLoading(false);
            setDeleteModalOpen(false);
            setDeleteTarget(null);
            setDeleteReason('');
        }
    }

    const openDeleteModal = (id: string) => {
        setDeleteTarget(id);
        setDeleteReason('');
        setDeleteModalOpen(true);
    }

    const openDetailModal = (record: DataType<IProduct>) => {
        setDetailData(record);
        setDetailModalOpen(true);
    }



    const columns: ColumnsType<DataType<IProduct>> = [
        ...fields.map((field) => {
            const columnConfig: ColumnType<DataType<IProduct>> = {
                title: field.charAt(0).toUpperCase() + field.slice(1), // Tạo title từ field
                dataIndex: field,
                key: field,
                width: 3600,
            };




            return columnConfig;
        }),
        // Cột action luôn xuất hiện
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div key={record._id} className='flex items-center gap-5'>
                    <FaEye
                        onClick={() => openDetailModal(record)}
                        className='hover:text-blue-500 cursor-pointer'
                        title="Xem chi tiết"
                    />
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "PATCH" && p.path === "/api/v1/admin/product/:id"
                    ) &&
                        <FaPen
                            onClick={() => {
                                setOpen(true);
                                setDataClick(record);
                            }}
                            className='hover:text-blue-500 cursor-pointer'
                            title="Chỉnh sửa"
                        />
                    }
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "DELETE" && p.path === "/api/v1/admin/product/:id"
                    ) &&
                        <FaTrashAlt
                            onClick={() => openDeleteModal(record._id as string)}
                            className='hover:text-red-500 cursor-pointer'
                            title="Xóa (soft delete)"
                        />
                    }
                </div>
            ),
        },
    ];


    let dataTable: DataType<IProduct>[] = [];
    if (!loading && products.length > 0 && accountLogin && accountLogin.role && accountLogin.role.permission.some(
        (p) => p.method === "GET" && p.path === "/api/v1/admin/product"
    )) {

    }

    return (
        <>
            <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "PATCH" && p.path === "/api/v1/admin/product/:id"
                ) &&
                    <UpdateModalProduct setOpen={setOpen} dataProduct={dataClick} />
                }
            </Modal>

            {/* Soft Delete Modal */}
            <Modal
                title="Xóa sản phẩm"
                open={deleteModalOpen}
                onCancel={() => { setDeleteModalOpen(false); setDeleteTarget(null); setDeleteReason(''); }}
                onOk={handleSoftDelete}
                okText="Xác nhận xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: deleteLoading, disabled: !deleteReason.trim() }}
                destroyOnClose
            >
                <p className="mb-2 text-gray-600">
                    Sản phẩm sẽ được đánh dấu là đã xóa (soft delete). Vui lòng nhập lý do:
                </p>
                <Input.TextArea
                    rows={3}
                    placeholder="Nhập lý do xóa sản phẩm..."
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    maxLength={500}
                    showCount
                />
            </Modal>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết sản phẩm"
                open={detailModalOpen}
                onCancel={() => { setDetailModalOpen(false); setDetailData(null); }}
                footer={null}
                width={800}
                destroyOnClose
            >
                {detailData && (
                    <div>

                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Tên sản phẩm" span={2}>{(detailData as DataType<IProduct> & { name: string }).name}</Descriptions.Item>
                            <Descriptions.Item label="Danh mục">{(detailData as DataType<IProduct> & { category?: ICategory }).category?.name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={(detailData as DataType<IProduct> & { status: string }).status === 'ACTIVE' ? 'green' : 'red'}>
                                    {(detailData as DataType<IProduct> & { status: string }).status === 'ACTIVE' ? 'Hoạt động' : 'Dừng hoạt động'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá gốc">
                                <Tag color="blue">{((detailData as DataType<IProduct> & { oldPrice: number }).oldPrice || 0).toLocaleString()} VND</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giảm giá">
                                <Tag color="cyan">{((detailData as DataType<IProduct> & { discount: number }).discount || 0) * 100}%</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tồn kho">
                                <Tag color="geekblue">{(detailData as DataType<IProduct> & { stock: number }).stock || 0}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Đã bán">
                                <Tag color="geekblue">{(detailData as DataType<IProduct> & { soldCount: number }).soldCount || 0}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Nổi bật">
                                <Tag color="gold">{(detailData as DataType<IProduct> & { feature?: boolean }).feature ? 'Có' : 'Không'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Vị trí">
                                <Tag color="blue">{(detailData as DataType<IProduct> & { position?: number }).position ?? '-'}</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                        {detailData.description && (
                            <>
                                <Divider />
                                <div>
                                    <h4 className="font-semibold mb-2">Mô tả</h4>
                                    <p className="text-gray-600 whitespace-pre-wrap">{(detailData as DataType<IProduct> & { description: string }).description}</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            <SelectedProductContext.Provider value={{ selectedRows, setSelectedRows }} >
                <ActionProduct ConfigFields={{ fields, setFields }} Filter={<FilterProduct />} EditSort={<EditSortProduct />} ContentModal={<ContentModalProduct />} />
                <Spin size="large" spinning={loading}>
                    <TableContent<DataType<IProduct>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
                </Spin>
            </SelectedProductContext.Provider>
        </>
    )
}

// Custom hook để dùng trong các component khác
export const useSelectedRowsProduct = () => {
    const context = useContext(SelectedProductContext);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong ProductContext");
    }
    return context;
};