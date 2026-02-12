'use client';

import React, { useState, useMemo } from 'react';
import { Card, Tag, Image, Empty, Tabs } from 'antd';
import Link from 'next/link';
import {
    OrderPageSkeleton,
    ProfilePageSkeleton
} from "@/components/Skeletons";
import { IOrder } from '@/types/order';
import { useQuery } from '@tanstack/react-query';
import useAuthUser from '@/hooks/useAuthUser';
import { orderClientService } from '@/services/client/order.client.service';
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import ProfileSidebar from '@/components/client/ProfileSidebar/ProfileSidebar';

type OrderStatus = 'ALL' | 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';

const STATUS_CONFIG: Record<string, { label: string; color: string; textColor: string }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'orange', textColor: 'text-orange-500' },
    SHIPPING: { label: 'Đang vận chuyển', color: 'blue', textColor: 'text-blue-500' },
    DELIVERED: { label: 'Đã giao hàng', color: 'cyan', textColor: 'text-cyan-500' },
    COMPLETED: { label: 'Hoàn thành', color: 'green', textColor: 'text-green-600' },
    CANCELLED: { label: 'Đã hủy', color: 'red', textColor: 'text-red-500' },
    REFUNDED: { label: 'Hoàn tiền', color: 'purple', textColor: 'text-purple-500' },
    EXPIRED: { label: 'Hết hạn', color: 'default', textColor: 'text-gray-500' },
};

const PAYMENT_LABELS: Record<string, string> = {
    COD: 'COD',
    CARD: 'Trực tuyến',
};

export default function OrderPage() {
    const [activeTab, setActiveTab] = useState<OrderStatus>('ALL');
    const { user } = useAuthUser();

    const { data: orders = [], isLoading } = useQuery<IOrder[]>({
        queryKey: ['get-order-by-guest-id', user?.id],
        queryFn: () => orderClientService.getOrdersByGuestId(user?.id as string),
        enabled: !!user?.id,
    });

    const filteredOrders = useMemo(() => {
        if (activeTab === 'ALL') return orders;
        return orders.filter(order => order.status === activeTab);
    }, [orders, activeTab]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { ALL: orders.length };
        for (const order of orders) {
            counts[order.status] = (counts[order.status] || 0) + 1;
        }
        return counts;
    }, [orders]);

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
        { key: 'ALL', label: `Tất cả (${statusCounts['ALL'] || 0})` },
        ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
            key,
            label: `${config.label} (${statusCounts[key] || 0})`,
        })),
    ];

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
                title={`Quản lý đơn hàng (${orders.length} đơn) - Project PC`}
                description="Theo dõi và quản lý đơn hàng của bạn tại Project PC."
                keywords="quản lý đơn hàng, theo dõi đơn hàng, lịch sử mua hàng"
            />
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <Link href="/profile/detail" className="font-medium text-lg text-stone-500 dark:text-white mr-3">Hồ sơ người dùng</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-400 dark:text-white mr-3">Quản lý đơn hàng</h3>
                </div>

                <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                    <ProfileSidebar user={user} activePage="order" />

                    <div className='col-span-12 lg:col-span-9 p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 dark:text-white'>
                        <h2 className='text-xl font-bold pb-3 border-solid border-b-2 border-blue-200 dark:border-slate-900 dark:text-white mb-4'>
                            Quản lý đơn hàng
                        </h2>

                        {/* Status Tabs */}
                        <Tabs
                            activeKey={activeTab}
                            onChange={(key) => setActiveTab(key as OrderStatus)}
                            items={tabItems}
                            className="mb-4"
                        />

                        {/* Orders List */}
                        <div className="space-y-4">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <OrderCard
                                        key={order._id}
                                        order={order}
                                        formatCurrency={formatCurrency}
                                        formatDate={formatDate}
                                    />
                                ))
                            ) : (
                                <div className="py-16">
                                    <Empty description="Chưa có đơn hàng nào" />
                                </div>
                            )}
                        </div>
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
}: {
    order: IOrder;
    formatCurrency: (amount: number) => string;
    formatDate: (date: string) => string;
}) {
    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

    return (
        <Card
            className="shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
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
                    const variantImage = item.productVariant?.images?.[0];
                    const combination = item.combination && Object.keys(item.combination).length > 0
                        ? item.combination
                        : item.productVariant?.combination;
                    const combinationText = combination
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
                                    {item.productName || `SP #${item.productVariant?._id?.slice(-6)?.toUpperCase()}`}
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
                    {/* Future: add reorder / contact buttons */}
                </div>
            </div>
        </Card>
    );
}