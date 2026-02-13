'use client';

import React, { useState } from 'react';
import { Card, Tag, Image, Empty, Tabs, Pagination, Button, Modal, Input, message } from 'antd';
import Link from 'next/link';
import { MessageOutlined } from '@ant-design/icons';
import {
    OrderPageSkeleton,
    ProfilePageSkeleton
} from "@/components/Skeletons";
import { IOrder } from '@/types/order';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthUser from '@/hooks/useAuthUser';
import { orderClientService } from '@/services/client/order.client.service';
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import ProfileSidebar from '@/components/client/ProfileSidebar/ProfileSidebar';
import Breadcrumb from '@/components/client/Breadcrumb/Breadcrumb';
import { PaginatedResponse } from '@/types';

type OrderStatus = 'ALL' | 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED' | 'PENDING_REJECTION';

const STATUS_CONFIG: Record<string, { label: string; color: string; textColor: string }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'orange', textColor: 'text-orange-500' },
    SHIPPING: { label: 'Đang vận chuyển', color: 'blue', textColor: 'text-blue-500' },
    DELIVERED: { label: 'Đã giao hàng', color: 'cyan', textColor: 'text-cyan-500' },
    COMPLETED: { label: 'Hoàn thành', color: 'green', textColor: 'text-green-600' },
    CANCELLED: { label: 'Đã hủy', color: 'red', textColor: 'text-red-500' },
    REFUNDED: { label: 'Hoàn tiền', color: 'purple', textColor: 'text-purple-500' },
    EXPIRED: { label: 'Hết hạn', color: 'default', textColor: 'text-gray-500' },
    PENDING_REJECTION: { label: 'Đang xử lý từ chối', color: 'volcano', textColor: 'text-orange-600' },
};

const PAYMENT_LABELS: Record<string, string> = {
    COD: 'COD',
    CARD: 'Trực tuyến',
};

const PAGE_SIZE = 10;

export default function OrderPage() {
    const [activeTab, setActiveTab] = useState<OrderStatus>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuthUser();
    const queryClient = useQueryClient();

    const statusMutation = useMutation({
        mutationFn: ({ orderId, status, reason }: { orderId: string; status: string; reason?: string }) =>
            orderClientService.updateOrderStatus(orderId, status, reason),
        onSuccess: () => {
            message.success('Cập nhật trạng thái đơn hàng thành công');
            queryClient.invalidateQueries({ queryKey: ['get-order-by-guest-id'] });
        },
        onError: () => {
            message.error('Cập nhật trạng thái thất bại');
        },
    });

    const handleConfirmReceived = (orderId: string) => {
        Modal.confirm({
            title: 'Xác nhận đã nhận hàng',
            content: 'Bạn xác nhận đã nhận được đơn hàng này?',
            okText: 'Đã nhận hàng',
            cancelText: 'Hủy',
            onOk: () => statusMutation.mutate({ orderId, status: 'DELIVERED' }),
        });
    };

    const handleCancelOrder = (orderId: string) => {
        let reason = '';
        Modal.confirm({
            title: 'Hủy đơn hàng',
            content: (
                <div>
                    <p className="mb-2">Bạn có chắc chắn muốn hủy đơn hàng này?</p>
                    <Input.TextArea
                        placeholder="Lý do hủy đơn (không bắt buộc)"
                        rows={3}
                        onChange={(e) => { reason = e.target.value; }}
                    />
                </div>
            ),
            okText: 'Xác nhận hủy',
            okButtonProps: { danger: true },
            cancelText: 'Đóng',
            onOk: () => statusMutation.mutate({ orderId, status: 'CANCELLED', reason }),
        });
    };

    const { data, isLoading } = useQuery<PaginatedResponse<IOrder>>({
        queryKey: ['get-order-by-guest-id', user?.id, activeTab, currentPage],
        queryFn: () => orderClientService.getOrdersByGuestId(user?.id as string, {
            page: currentPage,
            limit: PAGE_SIZE,
            status: activeTab,
        }),
        enabled: !!user?.id,
    });


    const handleTabChange = (key: string) => {
        setActiveTab(key as OrderStatus);
        setCurrentPage(1); // Reset page when switching tabs
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const tabItems = [
        { key: 'ALL', label: `Tất cả` },
        ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
            key,
            label: config.label,
        })),
    ];

    if (isLoading && currentPage === 1) {
        return (
            <ProfilePageSkeleton>
                <OrderPageSkeleton />
            </ProfilePageSkeleton>
        );
    }

    return (
        <>
            {!isLoading &&
                <DynamicMetadata
                    title={`Quản lý đơn hàng (${data?.pagination.totalItems ?? 0} đơn) - Project PC`}
                    description="Theo dõi và quản lý đơn hàng của bạn tại Project PC."
                    keywords="quản lý đơn hàng, theo dõi đơn hàng, lịch sử mua hàng"
                />
            }
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className='mx-5 xl:mx-32'>
                    <Breadcrumb items={[
                        { label: 'Hồ sơ người dùng', href: '/profile/detail' },
                        { label: 'Quản lý đơn hàng' },
                    ]} />
                </div>

                <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                    <ProfileSidebar user={user} activePage="order" />

                    <div className='col-span-12 lg:col-span-9 p-4 md:p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 dark:text-white'>
                        <div className="flex flex-wrap justify-between items-center pb-3 border-solid border-b-2 border-blue-200 dark:border-slate-900 mb-4 gap-2">
                            <h2 className='text-xl font-bold dark:text-white'>
                                Quản lý đơn hàng
                            </h2>
                            {data?.pagination.totalItems > 0 && (
                                <span className="text-sm text-gray-500">
                                    Tổng {data?.pagination.totalItems} đơn hàng
                                </span>
                            )}
                        </div>

                        {/* Status Tabs */}
                        <Tabs
                            activeKey={activeTab}
                            onChange={handleTabChange}
                            items={tabItems}
                            className="mb-4"
                        />

                        {/* Orders List */}
                        {!isLoading && data.data.length > 0 &&
                            <div className="space-y-4">
                                {data.data.length > 0 ? (
                                    <>
                                        {data.data.map((order) => (
                                            <OrderCard
                                                key={order._id}
                                                order={order}
                                                formatCurrency={formatCurrency}
                                                formatDate={formatDate}
                                                onConfirmReceived={handleConfirmReceived}
                                                onCancelOrder={handleCancelOrder}
                                                isUpdating={statusMutation.isPending}
                                            />
                                        ))}

                                        {/* Pagination */}
                                        {data.pagination.totalPages > 1 && (
                                            <div className="flex justify-center pt-4">
                                                <Pagination
                                                    current={currentPage}
                                                    total={data.pagination.totalItems}
                                                    pageSize={PAGE_SIZE}
                                                    onChange={(page) => setCurrentPage(page)}
                                                    showSizeChanger={false}
                                                    showTotal={(total) => `Tổng ${total} đơn hàng`}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-16">
                                        <Empty description="Chưa có đơn hàng nào" />
                                    </div>
                                )}
                            </div>

                        }
                    </div>
                </div>
            </div>
        </>
    );
}

function OrderCard({
    order,
    formatCurrency,
    formatDate,
    onConfirmReceived,
    onCancelOrder,
    isUpdating,
}: {
    order: IOrder;
    formatCurrency: (amount: number) => string;
    formatDate: (date: string) => string;
    onConfirmReceived: (orderId: string) => void;
    onCancelOrder: (orderId: string) => void;
    isUpdating: boolean;
}) {
    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

    return (
        <Card
            className="shadow-sm !my-5 hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
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

            {/* Order Items */}
            <div className="py-3 space-y-3">
                {order.orderDetail.map((item, idx) => {
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
                                <p className="text-xs text-gray-500 mt-0.5">x{item.quantity}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-red-500 font-semibold text-sm">
                                    {formatCurrency(item.price)}
                                </p>
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
                    {order.status === 'SHIPPING' && (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => onConfirmReceived(order._id)}
                            loading={isUpdating}
                        >
                            Đã nhận được hàng
                        </Button>
                    )}
                    {order.status === 'COMPLETED' && order.payment?.type === 'COD' && (
                        <Button
                            danger
                            size="small"
                            onClick={() => onCancelOrder(order._id)}
                            loading={isUpdating}
                        >
                            Hủy đơn hàng
                        </Button>
                    )}
                    <Link href={`/chat?sellerId=${order._id}&sellerName=Người bán`}>
                        <Button
                            size="small"
                            icon={<MessageOutlined />}
                        >
                            Chat
                        </Button>
                    </Link>
                    {order.reason && (order.status === 'CANCELLED' || order.status === 'REFUNDED') && (
                        <span className="text-xs text-gray-400 italic">Lý do: {order.reason}</span>
                    )}
                </div>
            </div>
        </Card>
    );
}