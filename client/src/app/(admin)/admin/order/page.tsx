'use client';

import { useState } from 'react';
import {
    Table, Tag, Button, Input, Select, Card, Space, Modal,
    Descriptions, Divider, Typography, Tooltip, Badge
} from 'antd';
import {
    SearchOutlined, EyeOutlined,
    DollarOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useAdminOrders, useConfirmCodPayment } from '@/hooks/admin/useOrder';
import type { IOrder, IOrderDetailItem } from '@/types/order';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    PENDING: { color: 'orange', label: 'Chờ xử lý' },
    SHIPPING: { color: 'blue', label: 'Đang giao' },
    DELIVERED: { color: 'green', label: 'Đã giao' },
    COMPLETED: { color: 'cyan', label: 'Hoàn thành' },
    CANCELLED: { color: 'red', label: 'Đã hủy' },
    REFUNDED: { color: 'purple', label: 'Hoàn tiền' },
    EXPIRED: { color: 'default', label: 'Hết hạn' },
};

const PAYMENT_TYPE_CONFIG: Record<string, { color: string; label: string }> = {
    COD: { color: 'gold', label: 'COD' },
    CARD: { color: 'geekblue', label: 'Thẻ/PayOS' },
};

interface ConfirmModalState {
    type: 'status' | 'cod' | null;
    orderId: string;
    newStatus?: string;
    order?: IOrder;
}

export default function AdminOrderPage() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [paymentTypeFilter, setPaymentTypeFilter] = useState<string | undefined>();
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [detailModal, setDetailModal] = useState<IOrder | null>(null);
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ type: null, orderId: '' });

    const { data: ordersData, isLoading, refetch } = useAdminOrders({
        page,
        limit,
        status: statusFilter,
        paymentType: paymentTypeFilter,
        search: search || undefined,
    });

    const confirmCod = useConfirmCodPayment();

    const orders = ordersData?.data ?? [];
    const pagination = ordersData?.pagination;

    const handleSearch = () => {
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleConfirmCod = (order: IOrder) => {
        setConfirmModal({ type: 'cod', orderId: order._id, order });
    };

    const handleConfirmCodPayment = () => {
        if (confirmModal.type === 'cod' && confirmModal.order) {
            confirmCod.mutate({ id: confirmModal.order._id, amount: confirmModal.order.totalAmount });
            setConfirmModal({ type: null, orderId: '' });
        }
    };

    const columns: ColumnsType<IOrder> = [
        {
            title: 'Mã đơn',
            dataIndex: '_id',
            key: '_id',
            width: 120,
            render: (id: string) => (
                <Text copyable={{ text: id }} className="font-mono text-xs">
                    #{id.slice(-6).toUpperCase()}
                </Text>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 180,
            render: (_: unknown, record: IOrder) => (
                <div>
                    <div className="font-medium">{record.customerInfo.fullname}</div>
                    <div className="text-xs text-gray-500">{record.customerInfo.phone}</div>
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 130,
            sorter: (a: IOrder, b: IOrder) => a.totalAmount - b.totalAmount,
            render: (amount: number) => (
                <Text strong className="text-red-500">
                    {amount.toLocaleString()}đ
                </Text>
            ),
        },
        {
            title: 'Thanh toán',
            key: 'payment',
            width: 120,
            render: (_: unknown, record: IOrder) => {
                const config = PAYMENT_TYPE_CONFIG[record.payment.type] || { color: 'default', label: record.payment.type };
                return (
                    <Space direction="vertical" size={2}>
                        <Tag color={config.color}>{config.label}</Tag>
                        {record.payment.isCheckout ? (
                            <Tag color="green" className="text-xs">Đã thanh toán</Tag>
                        ) : (
                            <Tag color="red" className="text-xs">Chưa thanh toán</Tag>
                        )}
                    </Space>
                );
            },
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
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            sorter: (a: IOrder, b: IOrder) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (date: string) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 160,
            render: (_: unknown, record: IOrder) => (
                <Space size={4} wrap>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => setDetailModal(record)}
                        />
                    </Tooltip>
                    {record.payment.type === 'COD' && !record.payment.isCheckout && record.status === 'DELIVERED' && (
                        <Tooltip title="Xác nhận nhận tiền COD">
                            <Button
                                size="small"
                                style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: '#fff' }}
                                icon={<DollarOutlined />}
                                onClick={() => handleConfirmCod(record)}
                                loading={confirmCod.isPending && confirmModal.orderId === record._id}
                            >
                                Nhận tiền
                            </Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Title level={3} className="text-center mb-6">Quản lý đơn hàng</Title>

            <Card className="mb-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <Input
                        placeholder="Tìm theo tên, SĐT, email, mã đơn..."
                        prefix={<SearchOutlined />}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        style={{ width: 160 }}
                        value={statusFilter}
                        onChange={(val) => { setStatusFilter(val); setPage(1); }}
                        options={[
                            { value: 'PENDING', label: 'Chờ xử lý' },
                            { value: 'SHIPPING', label: 'Đang giao' },
                            { value: 'DELIVERED', label: 'Đã giao' },
                            { value: 'COMPLETED', label: 'Hoàn thành' },
                            { value: 'CANCELLED', label: 'Đã hủy' },
                            { value: 'EXPIRED', label: 'Hết hạn' },
                        ]}
                    />
                    <Select
                        placeholder="Thanh toán"
                        allowClear
                        style={{ width: 140 }}
                        value={paymentTypeFilter}
                        onChange={(val) => { setPaymentTypeFilter(val); setPage(1); }}
                        options={[
                            { value: 'COD', label: 'COD' },
                            { value: 'CARD', label: 'Thẻ/PayOS' },
                        ]}
                    />
                    <Button icon={<SearchOutlined />} type="primary" onClick={handleSearch}>
                        Tìm kiếm
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                        Làm mới
                    </Button>

                    {/* Quick stat badges */}
                    <div className="ml-auto flex gap-2">
                        <Badge count={orders.filter(o => o.status === 'PENDING' && o.payment.type === 'COD').length} showZero>
                            <Tag color="orange">COD chờ xử lý</Tag>
                        </Badge>
                        <Badge count={orders.filter(o => o.status === 'SHIPPING').length} showZero>
                            <Tag color="blue">Đang giao</Tag>
                        </Badge>
                    </div>
                </div>
            </Card>

            <Table
                columns={columns}
                dataSource={orders}
                rowKey="_id"
                loading={isLoading}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total: pagination?.totalItems || 0,
                    showTotal: (total) => `Tổng ${total} đơn hàng`,
                    onChange: (p) => setPage(p)
                }}
                scroll={{ x: 1000 }}
                size="middle"
            />

            {/* Confirm COD Payment Modal */}
            <Modal
                title="Xác nhận thanh toán COD"
                open={confirmModal.type === 'cod'}
                onOk={handleConfirmCodPayment}
                onCancel={() => setConfirmModal({ type: null, orderId: '' })}
                okText="Xác nhận nhận tiền"
                cancelText="Hủy"
                confirmLoading={confirmCod.isPending}
                destroyOnHidden
            >
                <p>
                    Xác nhận đã nhận <strong>{confirmModal.order?.totalAmount.toLocaleString()}đ</strong> tiền mặt
                    cho đơn <strong>#{confirmModal.order?._id.slice(-6)}</strong>?
                </p>
            </Modal>

            {/* Order Detail Modal */}
            <Modal
                title={`Chi tiết đơn hàng #${detailModal?._id?.slice(-6).toUpperCase() || ''}`}
                open={!!detailModal}
                onCancel={() => setDetailModal(null)}
                footer={null}
                width={800}
                destroyOnHidden
            >
                {detailModal && (
                    <div>
                        <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="Mã đơn hàng" span={2}>
                                <Text copyable>{detailModal._id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">{detailModal.customerInfo.fullname}</Descriptions.Item>
                            <Descriptions.Item label="SĐT">{detailModal.customerInfo.phone}</Descriptions.Item>
                            <Descriptions.Item label="Email" span={2}>{detailModal.customerInfo.email}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>{detailModal.customerInfo.address}</Descriptions.Item>
                            {detailModal.customerInfo.note && (
                                <Descriptions.Item label="Ghi chú" span={2}>{detailModal.customerInfo.note}</Descriptions.Item>
                            )}
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={STATUS_CONFIG[detailModal.status]?.color}>
                                    {STATUS_CONFIG[detailModal.status]?.label}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thanh toán">
                                <Space>
                                    <Tag color={PAYMENT_TYPE_CONFIG[detailModal.payment.type]?.color}>
                                        {PAYMENT_TYPE_CONFIG[detailModal.payment.type]?.label}
                                    </Tag>
                                    <Tag color={detailModal.payment.isCheckout ? 'green' : 'red'}>
                                        {detailModal.payment.isCheckout ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </Tag>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <Text strong className="text-red-500 text-lg">
                                    {detailModal.totalAmount.toLocaleString()}đ
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">
                                {new Date(detailModal.createdAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Sản phẩm ({detailModal.orderDetail.length})</Divider>

                        <div className="space-y-3">
                            {detailModal.orderDetail.map((item: IOrderDetailItem, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    {item.images?.[0] && (
                                        <img
                                            src={item.images[0]}
                                            alt={item.productName}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-medium">{item.productName}</div>
                                        <div className="text-xs text-gray-500">
                                            SKU: {item.sku} |{' '}
                                            {Object.entries(item.combination || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </div>
                                        <div className="text-sm">
                                            {item.discount > 0 && (
                                                <Text delete className="text-gray-400 mr-2">
                                                    {item.variantPrice.toLocaleString()}đ
                                                </Text>
                                            )}
                                            <Text strong className="text-red-500">
                                                {item.price.toLocaleString()}đ
                                            </Text>
                                            <Text className="text-gray-500"> x{item.quantity}</Text>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Text strong>{item.subtotal.toLocaleString()}đ</Text>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
