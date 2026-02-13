'use client';

import { useState } from 'react';
import {
    Card, Tag, Image, Empty, Tabs, Pagination, Button, Modal, Input, message, Space, Badge,
} from 'antd';
import {
    SearchOutlined, TruckOutlined, CloseCircleOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { IOrder, IOrderDetailItem } from '@/types/order';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthUser from '@/hooks/useAuthUser';
import { orderClientService } from '@/services/client/order.client.service';
import { PaginatedResponse } from '@/types';

type OrderStatus = 'ALL' | 'COMPLETED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    COMPLETED: { label: 'Chờ giao hàng', color: 'green' },
    SHIPPING: { label: 'Đang vận chuyển', color: 'blue' },
    DELIVERED: { label: 'Đã giao hàng', color: 'cyan' },
    CANCELLED: { label: 'Đã hủy', color: 'red' },
    REFUNDED: { label: 'Hoàn tiền', color: 'purple' },
};

const PAYMENT_LABELS: Record<string, string> = {
    COD: 'COD',
    CARD: 'Trực tuyến',
};

const PAGE_SIZE = 10;

export default function SellerOrdersPage() {
    const [activeTab, setActiveTab] = useState<OrderStatus>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const { user } = useAuthUser();
    const queryClient = useQueryClient();

    const { data, isLoading, refetch } = useQuery<PaginatedResponse<IOrder>>({
        queryKey: ['seller-orders', user?.id, activeTab, currentPage, search],
        queryFn: () => orderClientService.getSellerOrders(user?.id as string, {
            page: currentPage,
            limit: PAGE_SIZE,
            status: activeTab,
            search: search || undefined,
        }),
        enabled: !!user?.id,
    });

    const statusMutation = useMutation({
        mutationFn: ({ orderId, status, reason }: { orderId: string; status: string; reason?: string }) =>
            orderClientService.updateOrderStatus(orderId, status, reason),
        onSuccess: () => {
            message.success('Cập nhật trạng thái đơn hàng thành công');
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
        },
        onError: () => {
            message.error('Cập nhật trạng thái thất bại');
        },
    });

    const handleShipOrder = (orderId: string) => {
        Modal.confirm({
            title: 'Xác nhận giao hàng',
            content: 'Bạn xác nhận đơn hàng này sẽ được chuyển sang trạng thái đang vận chuyển?',
            okText: 'Xác nhận giao hàng',
            cancelText: 'Hủy',
            onOk: () => statusMutation.mutate({ orderId, status: 'SHIPPING' }),
        });
    };

    const handleRejectOrder = (orderId: string) => {
        let reason = '';
        Modal.confirm({
            title: 'Từ chối đơn hàng',
            content: (
                <div>
                    <p className="mb-2">Bạn có chắc chắn muốn từ chối đơn hàng này?</p>
                    <Input.TextArea
                        placeholder="Lý do từ chối (bắt buộc)"
                        rows={3}
                        onChange={(e) => { reason = e.target.value; }}
                    />
                </div>
            ),
            okText: 'Xác nhận từ chối',
            okButtonProps: { danger: true },
            cancelText: 'Đóng',
            onOk: () => {
                if (!reason.trim()) {
                    message.warning('Vui lòng nhập lý do từ chối');
                    return Promise.reject();
                }
                return statusMutation.mutateAsync({ orderId, status: 'CANCELLED', reason });
            },
        });
    };

    const handleSearch = () => {
        setSearch(searchInput.trim());
        setCurrentPage(1);
    };

    const handleTabChange = (key: string) => {
        setActiveTab(key as OrderStatus);
        setCurrentPage(1);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const tabItems = [
        { key: 'ALL', label: 'Tất cả' },
        ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
            key,
            label: config.label,
        })),
    ];

    const orders = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                <h2 className="text-xl font-bold m-0">Đơn hàng sản phẩm</h2>
                <div className="flex gap-2 items-center">
                    <Input
                        placeholder="Tìm theo tên khách hàng..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 260 }}
                        allowClear
                    />
                    <Button icon={<SearchOutlined />} type="primary" onClick={handleSearch}>Tìm</Button>
                    <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
                </div>
            </div>

            {/* Status Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
                className="mb-4"
            />

            {/* Summary badges */}
            {!isLoading && pagination && (
                <div className="mb-4 text-sm text-gray-500">
                    Tổng {pagination.totalItems} đơn hàng
                </div>
            )}

            {/* Orders List */}
            {isLoading ? (
                <div className="py-16 text-center text-gray-400">Đang tải...</div>
            ) : orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <SellerOrderCard
                            key={order._id}
                            order={order}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            onShipOrder={handleShipOrder}
                            onRejectOrder={handleRejectOrder}
                            isUpdating={statusMutation.isPending}
                        />
                    ))}

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center pt-4">
                            <Pagination
                                current={currentPage}
                                total={pagination.totalItems}
                                pageSize={PAGE_SIZE}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false}
                                showTotal={(total) => `Tổng ${total} đơn hàng`}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-16">
                    <Empty description="Chưa có đơn hàng nào" />
                </div>
            )}
        </div>
    );
}

function SellerOrderCard({
    order,
    formatCurrency,
    formatDate,
    onShipOrder,
    onRejectOrder,
    isUpdating,
}: {
    order: IOrder;
    formatCurrency: (amount: number) => string;
    formatDate: (date: string) => string;
    onShipOrder: (orderId: string) => void;
    onRejectOrder: (orderId: string) => void;
    isUpdating: boolean;
}) {
    const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, color: 'default' };

    return (
        <Card
            className="shadow-sm hover:shadow-md !my-5 transition-shadow border border-gray-100 dark:border-gray-700"
            styles={{ body: { padding: '16px 20px' } }}
        >
            {/* Order Header */}
            <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-gray-500">Mã đơn:</span>
                    <span className="font-mono font-semibold text-blue-600 text-sm">
                        #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-500">
                        {formatDate(order.orderDate || order.createdAt)}
                    </span>
                    <span className="text-gray-300">|</span>
                    <Tag color={order.payment?.type === 'CARD' ? 'blue' : 'orange'} className="!m-0 !text-xs">
                        {PAYMENT_LABELS[order.payment?.type] || order.payment?.type}
                    </Tag>
                </div>
                <Tag color={statusConfig.color} className="!m-0 font-medium">
                    {statusConfig.label}
                </Tag>
            </div>

            {/* Customer Info */}
            <div className="py-2 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-50 dark:border-gray-700">
                <span className="font-medium">Khách hàng: </span>
                <span>{order.customerInfo?.fullname}</span>
                <span className="mx-2 text-gray-300">|</span>
                <span>{order.customerInfo?.phone}</span>
                {order.customerInfo?.address && (
                    <>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-gray-400">{order.customerInfo.address}</span>
                    </>
                )}
            </div>

            {/* Order Items */}
            <div className="py-3 space-y-3">
                {order.orderDetail.map((item: IOrderDetailItem, idx: number) => {
                    const variantImage = item.images?.[0];
                    const combination = item.combination;
                    const combinationText = combination && Object.keys(combination).length > 0
                        ? Object.entries(combination).map(([k, v]) => `${k}: ${v}`).join(' | ')
                        : '';

                    return (
                        <div key={idx} className="flex items-center gap-3">
                            <Image
                                src={variantImage || '/laptop.png'}
                                alt={item.productName || 'Product'}
                                width={64}
                                height={64}
                                className="!w-16 !h-16 object-cover rounded-lg border border-gray-200"
                                fallback="/laptop.png"
                                preview={false}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1 text-sm">
                                    {item.productName || `SP #${item.variantId?.slice(-6)?.toUpperCase()}`}
                                </p>
                                {combinationText && (
                                    <p className="text-xs text-gray-400 mt-0.5">{combinationText}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-0.5">
                                    SKU: {item.sku} | x{item.quantity}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-red-500 font-semibold text-sm">
                                    {formatCurrency(item.price)}
                                </p>
                                {item.discount > 0 && (
                                    <p className="text-xs text-gray-400 line-through">
                                        {formatCurrency(item.variantPrice)}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Order Footer */}
            <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700 gap-2">
                <div className="text-sm">
                    <span className="text-gray-500">{order.orderDetail.length} sản phẩm</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-gray-500">Tổng: </span>
                    <span className="text-red-500 font-bold text-lg">
                        {formatCurrency(order.totalAmount)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* COMPLETED: seller can ship or reject */}
                    {order.status === 'COMPLETED' && (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                icon={<TruckOutlined />}
                                onClick={() => onShipOrder(order._id)}
                                loading={isUpdating}
                            >
                                Giao hàng
                            </Button>
                            <Button
                                danger
                                size="small"
                                icon={<CloseCircleOutlined />}
                                onClick={() => onRejectOrder(order._id)}
                                loading={isUpdating}
                            >
                                Từ chối
                            </Button>
                        </>
                    )}
                    {/* Show reason if cancelled */}
                    {order.reason && order.status === 'CANCELLED' && (
                        <span className="text-xs text-gray-400 italic">Lý do: {order.reason}</span>
                    )}
                </div>
            </div>
        </Card>
    );
}
