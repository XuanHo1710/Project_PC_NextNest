'use client';

import React, { useState } from 'react';
import { Card, Tag, Image, Empty, Button, Tooltip, Modal } from 'antd';
import {
    CreditCardOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { OrderPageSkeleton, ProfilePageSkeleton } from '@/components/Skeletons';
import { IOrder } from '@/types/order';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthUser from '@/hooks/useAuthUser';
import { orderClientService, CreateOrderResponse } from '@/services/client/order.client.service';
import { DynamicMetadata } from '@/components/common/DynamicMetadata';
import ProfileSidebar from '@/components/client/ProfileSidebar/ProfileSidebar';
import { toast } from 'react-toastify';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Chờ thanh toán', color: 'orange' },
    EXPIRED: { label: 'Hết hạn', color: 'default' },
};

export default function PendingPaymentPage() {
    const { user } = useAuthUser();
    const queryClient = useQueryClient();
    const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

    const { data: orders = [], isLoading } = useQuery<IOrder[]>({
        queryKey: ['pending-online-orders', user?.id],
        queryFn: () => orderClientService.getPendingOnlineOrders(user?.id as string),
        enabled: !!user?.id,
        refetchInterval: 60000, // Refresh every 60s to check expired orders
    });

    const retryPaymentMutation = useMutation({
        mutationFn: (orderId: string) => orderClientService.retryPayment(orderId),
        onSuccess: (result: CreateOrderResponse) => {
            if (result.url) {
                // Save order info to sessionStorage for the return page
                sessionStorage.setItem(
                    'pendingOrder',
                    JSON.stringify({
                        orderId: result.orderId,
                        orderCode: result.orderCode,
                    })
                );
                window.location.href = result.url;
            }
        },
        onError: () => {
            toast.error('Không thể tạo lại thanh toán. Vui lòng thử lại sau.');
            setRetryingOrderId(null);
        },
    });

    const handleRetryPayment = (order: IOrder) => {
        Modal.confirm({
            title: 'Thanh toán lại',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có muốn thanh toán lại đơn hàng #${order._id.slice(-8).toUpperCase()} với số tiền ${formatCurrency(order.totalAmount)}?`,
            okText: 'Thanh toán ngay',
            cancelText: 'Hủy',
            onOk: () => {
                setRetryingOrderId(order._id);
                retryPaymentMutation.mutate(order._id);
            },
        });
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

    const getTimeRemaining = (expireAt: string) => {
        const now = new Date().getTime();
        const expire = new Date(expireAt).getTime();
        const diff = expire - now;

        if (diff <= 0) return 'Đã hết hạn';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `Còn ${hours}h ${minutes}p`;
        return `Còn ${minutes} phút`;
    };

    if (isLoading) {
        return (
            <ProfilePageSkeleton>
                <OrderPageSkeleton />
            </ProfilePageSkeleton>
        );
    }

    return (
        <>
            <DynamicMetadata
                title={`Đơn chờ thanh toán (${orders.length}) - Project PC`}
                description="Danh sách đơn hàng online đang chờ thanh toán."
                keywords="đơn chờ thanh toán, thanh toán online"
            />
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className="mx-5 xl:mx-32 content-header flex items-center flex-wrap">
                    <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white mr-3 header-nav active">
                        Trang chủ
                    </Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <Link href="/profile/detail" className="font-medium text-lg text-stone-500 dark:text-white mr-3">
                        Hồ sơ người dùng
                    </Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-400 dark:text-white mr-3">
                        Đơn chờ thanh toán
                    </h3>
                </div>

                <div className="mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9">
                    <ProfileSidebar user={user} activePage="pending-payment" />

                    <div className="col-span-12 lg:col-span-9 p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 dark:text-white">
                        <div className="flex justify-between items-center pb-3 border-solid border-b-2 border-blue-200 dark:border-slate-900 mb-4">
                            <h2 className="text-xl font-bold dark:text-white">
                                Đơn chờ thanh toán
                            </h2>
                            <Tag color="blue" className="!text-sm">
                                <CreditCardOutlined className="mr-1" />
                                {orders.length} đơn
                            </Tag>
                        </div>

                        {/* Info Banner */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                            <p className="text-blue-700 dark:text-blue-300 text-sm">
                                <ClockCircleOutlined className="mr-2" />
                                Đơn hàng thanh toán online sẽ tự động hết hạn sau 24 giờ nếu chưa thanh toán.
                                Bạn có thể nhấn &quot;Thanh toán lại&quot; để tạo link thanh toán mới.
                            </p>
                        </div>

                        {/* Orders List */}
                        <div className="space-y-4">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <PendingOrderCard
                                        key={order._id}
                                        order={order}
                                        formatCurrency={formatCurrency}
                                        formatDate={formatDate}
                                        getTimeRemaining={getTimeRemaining}
                                        onRetryPayment={handleRetryPayment}
                                        isRetrying={retryingOrderId === order._id && retryPaymentMutation.isPending}
                                    />
                                ))
                            ) : (
                                <div className="py-16">
                                    <Empty
                                        description="Không có đơn hàng nào đang chờ thanh toán"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                    <div className="text-center mt-4">
                                        <Link href="/profile/order">
                                            <Button type="link">Xem tất cả đơn hàng →</Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function PendingOrderCard({
    order,
    formatCurrency,
    formatDate,
    getTimeRemaining,
    onRetryPayment,
    isRetrying,
}: {
    order: IOrder;
    formatCurrency: (amount: number) => string;
    formatDate: (date: string) => string;
    getTimeRemaining: (expireAt: string) => string;
    onRetryPayment: (order: IOrder) => void;
    isRetrying: boolean;
}) {
    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
    const isExpired = order.status === 'EXPIRED';
    const timeRemaining = order.expireAt ? getTimeRemaining(order.expireAt) : '';

    return (
        <Card
            className={`shadow-sm hover:shadow-md transition-shadow border ${isExpired
                ? 'border-gray-300 bg-gray-50 dark:bg-gray-900'
                : 'border-orange-200 bg-orange-50/30 dark:bg-orange-900/10'
                }`}
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
                    <Tag color="blue" className="!m-0 !text-xs">
                        Trực tuyến
                    </Tag>
                </div>
                <div className="flex items-center gap-2">
                    {order.expireAt && !isExpired && (
                        <Tooltip title={`Hết hạn lúc: ${formatDate(order.expireAt)}`}>
                            <Tag
                                icon={<ClockCircleOutlined />}
                                color="warning"
                                className="!m-0 !text-xs"
                            >
                                {timeRemaining}
                            </Tag>
                        </Tooltip>
                    )}
                    <Tag color={statusConfig.color} className="!m-0 font-medium">
                        {statusConfig.label}
                    </Tag>
                </div>
            </div>

            {/* Order Items */}
            <div className="py-3 space-y-3">
                {order.orderDetail.map((item, idx) => {
                    const variantImage = item.images?.[0];
                    const combination = item.combination;
                    const combinationText = combination && Object.keys(combination).length > 0
                        ? Object.entries(combination)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' | ')
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
                                    {item.productName ||
                                        `SP #${item.variantId?.slice(-6)?.toUpperCase()}`}
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
                <Button
                    type="primary"
                    icon={<CreditCardOutlined />}
                    onClick={() => onRetryPayment(order)}
                    loading={isRetrying}
                    className={
                        isExpired
                            ? '!bg-orange-500 !border-orange-500 hover:!bg-orange-600'
                            : ''
                    }
                >
                    {isExpired ? 'Thanh toán lại' : 'Thanh toán ngay'}
                </Button>
            </div>
        </Card>
    );
}
