'use client';

import { createContext, useContext, useState } from 'react';
import {
    Table, Tag, Button, Input, Select, Card, Space, Modal,
    Descriptions, Divider, Typography, Tooltip, Image
} from 'antd';
import {
    SearchOutlined, EyeOutlined, CheckCircleOutlined,
    CloseCircleOutlined, DeleteOutlined, ReloadOutlined,
    EditOutlined
} from '@ant-design/icons';
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { useProducts, useUpdateProduct } from "@/hooks/admin";
import type { IProduct } from "@/types/product";
import type { ColumnsType } from 'antd/es/table';

import type { SelectedContextType } from '@/types/table.d';

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
                <Space size={4} wrap>
                    <Tooltip title="Xem chi tiết">
                        <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailModal(record)} />
                    </Tooltip>

                    {/* Approve PENDING → ACTIVE */}
                    {record.status === 'PENDING' && hasPermission('PATCH', '/api/v1/admin/product/:id') && (
                        <Tooltip title="Duyệt sản phẩm">
                            <Button
                                size="small"
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleStatusUpdate(record._id, 'ACTIVE', 'Duyệt sản phẩm')}
                                loading={updateProduct.isPending}
                            >
                                Duyệt
                            </Button>
                        </Tooltip>
                    )}

                    {/* Reject PENDING → INACTIVE */}
                    {record.status === 'PENDING' && hasPermission('PATCH', '/api/v1/admin/product/:id') && (
                        <Tooltip title="Từ chối sản phẩm">
                            <Button
                                size="small"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleStatusUpdate(record._id, 'INACTIVE', 'Từ chối sản phẩm')}
                                loading={updateProduct.isPending}
                            >
                                Từ chối
                            </Button>
                        </Tooltip>
                    )}

                    {/* Toggle ACTIVE ↔ INACTIVE */}
                    {record.status === 'ACTIVE' && hasPermission('PATCH', '/api/v1/admin/product/:id') && (
                        <Tooltip title="Tạm ẩn">
                            <Button
                                size="small"
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleStatusUpdate(record._id, 'INACTIVE', 'Tạm ẩn sản phẩm')}
                            />
                        </Tooltip>
                    )}
                    {record.status === 'INACTIVE' && hasPermission('PATCH', '/api/v1/admin/product/:id') && (
                        <Tooltip title="Kích hoạt lại">
                            <Button
                                size="small"
                                type="primary"
                                ghost
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleStatusUpdate(record._id, 'ACTIVE', 'Kích hoạt sản phẩm')}
                            />
                        </Tooltip>
                    )}

                    {/* Soft delete */}
                    {hasPermission('DELETE', '/api/v1/admin/product/:id') && (
                        <Tooltip title="Xóa">
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    setDeleteTarget(record._id);
                                    setDeleteReason('');
                                    setDeleteModalOpen(true);
                                }}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
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

            {/* Table */}
            <Table
                columns={columns}
                dataSource={products}
                rowKey="_id"
                loading={isLoading}
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
                width={700}
                destroyOnHidden
            >
                {detailModal && (
                    <div>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Tên sản phẩm" span={2}>{detailModal.name}</Descriptions.Item>
                            <Descriptions.Item label="Slug" span={2}>{detailModal.slug}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={STATUS_CONFIG[detailModal.status]?.color}>
                                    {STATUS_CONFIG[detailModal.status]?.label}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá">
                                <Text strong className="text-red-500">
                                    {detailModal.minPrice.toLocaleString()}đ
                                    {detailModal.maxPrice > detailModal.minPrice && ` ~ ${detailModal.maxPrice.toLocaleString()}đ`}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Đánh giá">
                                {detailModal.avgRating ? `${detailModal.avgRating.toFixed(1)} ⭐ (${detailModal.totalRatings} đánh giá)` : 'Chưa có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {detailModal.createdAt ? new Date(detailModal.createdAt).toLocaleString('vi-VN') : '-'}
                            </Descriptions.Item>
                        </Descriptions>
                        {detailModal.description && (
                            <>
                                <Divider />
                                <div>
                                    <h4 className="font-semibold mb-2">Mô tả</h4>
                                    <p className="text-gray-600 whitespace-pre-wrap line-clamp-6">{detailModal.description}</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
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