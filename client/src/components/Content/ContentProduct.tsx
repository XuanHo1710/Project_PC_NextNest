'use client';

import { createContext, useContext, useState } from 'react';
import {
    Table, Tag, Button, Input, Select, Card, Space, Modal,
    Descriptions, Divider, Typography, Image
} from 'antd';
import {
    SearchOutlined, CheckCircleOutlined,
    CloseCircleOutlined, DeleteOutlined, ReloadOutlined,
} from '@ant-design/icons';
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { useProducts, useUpdateProduct, useUpdateManyProducts } from "@/hooks/admin";
import { useProductVariantsByProduct } from "@/hooks/admin/useProductVariant";
import type { IProduct, IProductVariant } from "@/types/product";
import type { ColumnsType } from 'antd/es/table';

import type { SelectedContextType } from '@/types/table.d';
import { FaEye, FaTrashAlt } from 'react-icons/fa';
import { FiCheckCircle, FiEyeOff } from 'react-icons/fi';
import { HiOutlineRefresh, HiOutlineXCircle } from 'react-icons/hi';

const { Text, Title } = Typography;

const SelectedProductContext = createContext<SelectedContextType | undefined>(undefined);

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    PENDING: { color: 'orange', label: 'Chờ duyệt' },
    ACTIVE: { color: 'green', label: 'Hoạt động' },
    INACTIVE: { color: 'default', label: 'Tạm ẩn' },
    STOPSOLD: { color: 'red', label: 'Ngừng bán' },
};

export default function ContentProduct() {
    const { accountLogin } = useAuthEmployee();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [detailModal, setDetailModal] = useState<IProduct | null>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Soft-delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleteReason, setDeleteReason] = useState('');

    // Build query params
    const queryParams = new URLSearchParams();
    queryParams.set('page', String(page));
    queryParams.set('limit', '10');
    if (statusFilter) queryParams.set('status', statusFilter);
    if (search) queryParams.set('keyword', search);

    const { data: productsResponse, isLoading, refetch } = useProducts(queryParams.toString());
    const updateProduct = useUpdateProduct();
    const updateManyProducts = useUpdateManyProducts();

    const products = (productsResponse?.data ?? []) as IProduct[];
    const pagination = productsResponse?.pagination;

    const hasPermission = (method: string, path: string) =>
        accountLogin?.role?.permission?.some((p) => p.method === method && p.path === path);

    const handleSearch = () => {
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleStatusUpdate = (productId: string, newStatus: string, label: string) => {
        Modal.confirm({
            title: `Xác nhận ${label}`,
            content: `Bạn có chắc muốn chuyển trạng thái sản phẩm sang "${STATUS_CONFIG[newStatus]?.label}"?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: () => updateProduct.mutate({ id: productId, data: { status: newStatus } as Partial<IProduct> }),
        });
    };

    const handleBulkUpdate = (typeUpdate: string, label: string) => {
        if (selectedRows.length === 0) return;
        Modal.confirm({
            title: `${label} ${selectedRows.length} sản phẩm`,
            content: `Bạn có chắc muốn ${label.toLowerCase()} ${selectedRows.length} sản phẩm đã chọn?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                await updateManyProducts.mutateAsync({ ids: selectedRows, typeUpdate });
                setSelectedRows([]);
            },
        });
    };

    const handleSoftDelete = async () => {
        if (!deleteTarget || !deleteReason.trim()) return;
        await updateProduct.mutateAsync({
            id: deleteTarget,
            data: { isDeleted: true, deleteReason: deleteReason.trim() } as Partial<IProduct>,
        });
        setDeleteModalOpen(false);
        setDeleteTarget(null);
        setDeleteReason('');
    };

    const columns: ColumnsType<IProduct> = [
        {
            title: 'Sản phẩm',
            key: 'name',
            width: 280,
            render: (_: unknown, record: IProduct) => (
                <div className="flex items-center gap-3">
                    <div>
                        <div className="font-medium line-clamp-2">{record.name}</div>
                        <div className="text-xs text-gray-400">#{record._id.slice(-6)}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Giá',
            key: 'price',
            width: 180,
            sorter: (a: IProduct, b: IProduct) => a.minPrice - b.minPrice,
            render: (_: unknown, record: IProduct) => (
                <div>
                    <Text strong className="text-red-500">
                        {record.minPrice.toLocaleString()}đ
                    </Text>
                    {record.maxPrice > record.minPrice && (
                        <Text className="text-gray-400 text-xs block">
                            ~ {record.maxPrice.toLocaleString()}đ
                        </Text>
                    )}
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const config = STATUS_CONFIG[status] || { color: 'default', label: status };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            sorter: (a: IProduct, b: IProduct) =>
                new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime(),
            render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : '-',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 240,
            render: (_: unknown, record: IProduct) => (
                <Space size={10} wrap>
                    <span title="Xem chi tiết" className="inline-flex">
                        <FaEye
                            onClick={() => setDetailModal(record)}
                            className='hover:text-green-500 cursor-pointer text-lg'
                        />
                    </span>

                    {/* Approve PENDING → ACTIVE */}
                    {record.status === 'PENDING' && hasPermission('PATCH', '/api/v1/admin/product/:id') && (
                        <span title="Duyệt sản phẩm" className="inline-flex">
                            <FiCheckCircle
                                className='hover:text-yellow-500 cursor-pointer text-lg'
                                onClick={() => handleStatusUpdate(record._id, 'ACTIVE', 'Duyệt sản phẩm')}
                            />
                        </span>
                    )}

                    {/* Reject PENDING → INACTIVE */}
                    {record.status === 'PENDING' && hasPermission('PATCH', '/api/v1/admin/product/:id') && (
                        <span title="Từ chối sản phẩm" className="inline-flex">
                            <HiOutlineXCircle
                                className='hover:text-yellow-500 cursor-pointer text-lg'
                                onClick={() => handleStatusUpdate(record._id, 'INACTIVE', 'Từ chối sản phẩm')}
                            />
                        </span>
                    )}

                    {/* Toggle ACTIVE ↔ INACTIVE */}
                    {record.status === 'ACTIVE' && hasPermission('PATCH', '/api/v1/admin/product/:id') && (
                        <span title="Tạm ẩn" className="inline-flex">
                            <FiEyeOff
                                className='hover:text-yellow-500 cursor-pointer text-lg'
                                onClick={() => handleStatusUpdate(record._id, 'INACTIVE', 'Tạm ẩn sản phẩm')}
                            />
                        </span>
                    )}
                    {record.status === 'INACTIVE' && hasPermission('PATCH', '/api/v1/admin/product/:id') && (
                        <span title="Kích hoạt lại" className="inline-flex">
                            <HiOutlineRefresh
                                className='hover:text-yellow-500 cursor-pointer text-lg'
                                onClick={() => handleStatusUpdate(record._id, 'ACTIVE', 'Kích hoạt sản phẩm')}
                            />
                        </span>
                    )}

                    {/* Soft delete */}
                    {hasPermission('DELETE', '/api/v1/admin/product/:id') && (
                        <span title="Xóa" className="inline-flex">
                            <FaTrashAlt onClick={() => {
                                setDeleteTarget(record._id);
                                setDeleteReason('');
                                setDeleteModalOpen(true);
                            }} className='hover:text-red-500 cursor-pointer' />
                        </span>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <SelectedProductContext.Provider value={{ selectedRows, setSelectedRows }}>
            <div>
                {/* Filters */}
                <Card className="mb-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <Input
                            placeholder="Tìm theo tên sản phẩm..."
                            prefix={<SearchOutlined />}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ width: 280 }}
                            allowClear
                        />
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            style={{ width: 160 }}
                            value={statusFilter}
                            onChange={(val) => { setStatusFilter(val); setPage(1); }}
                            options={[
                                { value: 'PENDING', label: 'Chờ duyệt' },
                                { value: 'ACTIVE', label: 'Hoạt động' },
                                { value: 'INACTIVE', label: 'Tạm ẩn' },
                                { value: 'STOPSOLD', label: 'Ngừng bán' },
                            ]}
                        />
                        <Button icon={<SearchOutlined />} type="primary" onClick={handleSearch}>Tìm</Button>
                        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
                    </div>
                </Card>

                {/* Bulk Actions */}
                {selectedRows.length > 0 && (
                    <Card className="mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Text className="text-sm">Đã chọn <Text strong>{selectedRows.length}</Text> sản phẩm</Text>
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleBulkUpdate('ACTIVE', 'Duyệt')}
                                loading={updateManyProducts.isPending}
                            >
                                Duyệt tất cả
                            </Button>
                            <Button
                                size="small"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleBulkUpdate('INACTIVE', 'Tạm ẩn')}
                                loading={updateManyProducts.isPending}
                            >
                                Tạm ẩn tất cả
                            </Button>
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleBulkUpdate('DELETE', 'Xóa')}
                                loading={updateManyProducts.isPending}
                            >
                                Xóa tất cả
                            </Button>
                            <Button size="small" onClick={() => setSelectedRows([])}>Bỏ chọn</Button>
                        </div>
                    </Card>
                )}

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="_id"
                    loading={isLoading}
                    rowSelection={{
                        selectedRowKeys: selectedRows,
                        onChange: (keys) => setSelectedRows(keys as string[]),
                    }}
                    pagination={{
                        current: page,
                        pageSize: 10,
                        total: pagination?.totalItems || 0,
                        showTotal: (total) => `Tổng ${total} sản phẩm`,
                        onChange: (p) => setPage(p),
                    }}
                    scroll={{ x: 900 }}
                    size="middle"
                />

                {/* Soft Delete Modal */}
                <Modal
                    title="Xóa sản phẩm"
                    open={deleteModalOpen}
                    onCancel={() => { setDeleteModalOpen(false); setDeleteTarget(null); setDeleteReason(''); }}
                    onOk={handleSoftDelete}
                    okText="Xác nhận xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true, loading: updateProduct.isPending, disabled: !deleteReason.trim() }}
                    destroyOnHidden
                >
                    <p className="mb-2 text-gray-600">
                        Sản phẩm sẽ được đánh dấu là đã xóa. Vui lòng nhập lý do:
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
                    title={`Chi tiết sản phẩm: ${detailModal?.name || ''}`}
                    open={!!detailModal}
                    onCancel={() => setDetailModal(null)}
                    footer={null}
                    width={900}
                    destroyOnHidden
                >
                    {detailModal && (
                        <ProductDetailContent product={detailModal} />
                    )}
                </Modal>
            </div>
        </SelectedProductContext.Provider>
    );
}

// ============ Product Detail with Variants ============
function ProductDetailContent({ product }: { product: IProduct }) {
    const { data: variants, isLoading: loadingVariants } = useProductVariantsByProduct(product._id);

    const variantColumns: ColumnsType<IProductVariant> = [
        {
            title: 'Ảnh',
            key: 'images',
            width: 80,
            render: (_: unknown, record: IProductVariant) => (
                record.images && record.images.length > 0 ? (
                    <Image
                        src={record.images[0]}
                        alt="variant"
                        width={48}
                        height={48}
                        className="!w-12 !h-12 object-cover rounded border"
                        fallback="/laptop.png"
                    />
                ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-[10px]">
                        No img
                    </div>
                )
            ),
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 120,
            render: (sku: string) => <Text className="text-xs">{sku}</Text>,
        },
        {
            title: 'Phân loại',
            key: 'combination',
            width: 180,
            render: (_: unknown, record: IProductVariant) => {
                const isDefault = product.defaultProductVariantId === record._id
                    || (typeof product.defaultProductVariantId === 'object' && (product.defaultProductVariantId as any)?._id === record._id);
                const comboText = record.combination && Object.keys(record.combination).length > 0
                    ? Object.entries(record.combination).map(([k, v]) => `${k}: ${v}`).join(' | ')
                    : 'Mặc định';
                return (
                    <div>
                        <Text className="text-xs">{comboText}</Text>
                        {isDefault && <Tag color="blue" className="!text-[10px] ml-1">Mặc định</Tag>}
                    </div>
                );
            },
        },
        {
            title: 'Giá gốc',
            dataIndex: 'price',
            key: 'price',
            width: 110,
            align: 'right',
            render: (price: number) => <Text className="text-xs">{price?.toLocaleString()}đ</Text>,
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            width: 80,
            align: 'center',
            render: (discount: number) => discount > 0 ? <Tag color="red" className="!text-xs">-{discount}%</Tag> : <Text className="text-xs text-gray-400">0%</Text>,
        },
        {
            title: 'Giá sau giảm',
            key: 'effectivePrice',
            width: 120,
            align: 'right',
            render: (_: unknown, record: IProductVariant) => {
                const effective = Math.round(record.price * (1 - (record.discount || 0) / 100));
                return <Text strong className="text-red-500 text-xs">{effective.toLocaleString()}đ</Text>;
            },
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            width: 80,
            align: 'center',
            render: (stock: number) => (
                <Text strong className={stock > 0 ? 'text-green-600' : 'text-red-500'}>{stock}</Text>
            ),
        },
    ];

    return (
        <div>
            <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Tên sản phẩm" span={2}>{product.name}</Descriptions.Item>
                <Descriptions.Item label="Slug" span={2}>{product.slug}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={STATUS_CONFIG[product.status]?.color}>
                        {STATUS_CONFIG[product.status]?.label}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Giá">
                    <Text strong className="text-red-500">
                        {product.minPrice?.toLocaleString()}đ
                        {product.maxPrice > product.minPrice && ` ~ ${product.maxPrice?.toLocaleString()}đ`}
                    </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Đánh giá">
                    {product.avgRating ? `${product.avgRating.toFixed(1)} ⭐ (${product.totalRatings} đánh giá)` : 'Chưa có'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {product.createdAt ? new Date(product.createdAt).toLocaleString('vi-VN') : '-'}
                </Descriptions.Item>
                {(product as any).totalStock !== undefined && (
                    <Descriptions.Item label="Tổng tồn kho">
                        <Text strong>{(product as any).totalStock}</Text>
                    </Descriptions.Item>
                )}
            </Descriptions>

            {/* Description rendered as HTML with scroll */}
            {product.description && (
                <>
                    <Divider className="!text-sm">Mô tả</Divider>
                    <div
                        className="text-gray-600 text-sm border border-gray-200 rounded-lg p-3 prose prose-sm max-w-none"
                        style={{ maxHeight: 200, overflowY: 'auto' }}
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                </>
            )}

            {/* Variants Section - Paginated Table */}
            <Divider className="!text-sm">
                Biến thể sản phẩm {variants && `(${variants.data.length})`}
            </Divider>

            <Table
                columns={variantColumns}
                dataSource={variants?.data || []}
                rowKey="_id"
                loading={loadingVariants}
                size="small"
                pagination={{
                    pageSize: 5,
                    showTotal: (total) => `${total} biến thể`,
                    size: 'small',
                    hideOnSinglePage: true,
                }}
                scroll={{ x: 700 }}
            />
        </div>
    );
}

// Re-exported for backward compatibility (CSVModalProduct)
export const useSelectedRowsProduct = () => {
    const context = useContext(SelectedProductContext);
    if (!context) {
        throw new Error("useSelectedRowsProduct must be used within SelectedProductContext");
    }
    return context;
};