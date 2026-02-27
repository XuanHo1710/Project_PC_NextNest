"use client";

import React, { useEffect, useState } from 'react';
import { Card, Divider, Tag, Empty } from 'antd';
import PaymentMethods from '@/components/client/PaymentMethods';
import Link from 'next/link';
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import Breadcrumb from '@/components/client/Breadcrumb/Breadcrumb';
import { IOrderData } from '@/types';
import { useRouter } from 'next/navigation';

const PaymentPage = () => {
    const router = useRouter();
    const [orderData, setOrderData] = useState<IOrderData | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const raw = sessionStorage.getItem("orderData");
        if (raw) {
            try {
                setOrderData(JSON.parse(raw));
            } catch {
                // ignore
            }
        }
        setIsReady(true);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (!isReady) return null;

    if (!orderData || !orderData.orderDetail?.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="max-w-md w-full mx-4 text-center shadow-lg border-0 rounded-xl">
                    <Empty description="Không có thông tin đơn hàng" className="mb-4" />
                    <p className="text-gray-500 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                    <Link href="/cart">
                        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            Quay lại giỏ hàng
                        </button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <>
            <DynamicMetadata
                title="Thanh toán đơn hàng - Project PC"
                description="Hoàn tất thanh toán đơn hàng tại Project PC."
                keywords="thanh toán, payment, payos, cod"
            />
            <div className="min-h-screen my-5 bg-slate-50 dark:bg-gray-900 dark:text-white pt-3">
                {/* Breadcrumb */}
                <div className='mx-5 xl:mx-32 mb-6'>
                    <Breadcrumb items={[
                        { label: 'Giỏ hàng', href: '/cart' },
                        { label: 'Thanh toán' },
                    ]} />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Thanh toán đơn hàng</h1>
                        <p className="text-gray-600 dark:text-gray-300">Vui lòng chọn phương thức thanh toán phù hợp</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Payment Methods */}
                        <div className="lg:col-span-2">
                            <PaymentMethods orderData={orderData} />
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="shadow-xl border-0 sticky h-fit">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Thông tin đơn hàng</h3>

                                <div className="space-y-4">
                                    <div style={{ scrollbarWidth: 'none' }} className='max-h-72 min-h-52 overflow-y-scroll'>
                                        {orderData.orderDetail.map((item, index) => (
                                            <div className='flex border border-gray-200 p-3 rounded-lg my-2 justify-between' key={index}>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 line-clamp-2 text-sm">{item.product.name}</p>
                                                    {item.productVariant?.combination && Object.keys(item.productVariant.combination).length > 0 && (
                                                        <Tag color="blue" className="!text-xs !m-0 !rounded-md mt-1">
                                                            {Object.entries(item.productVariant.combination).map(([key, val]) => (`${key}: ${val}`)).join(' | ')}
                                                        </Tag>
                                                    )}
                                                    <p className="text-xs mt-1 text-gray-500">SL: {item.quantity} x {formatCurrency(item.price)}</p>
                                                </div>
                                                <p className="font-semibold text-blue-600 ml-4 whitespace-nowrap text-sm">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <Divider className="my-4" />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Tạm tính:</span>
                                            <span className="font-medium">{formatCurrency(orderData.totalAmount || 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Phí vận chuyển:</span>
                                            <span className="font-medium text-green-600">Miễn phí</span>
                                        </div>

                                        <Divider className="my-3" />

                                        <div className="flex justify-between text-lg font-bold text-gray-900">
                                            <span>Tổng cộng:</span>
                                            <span className="text-red-500">{formatCurrency(orderData.totalAmount || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-800 text-center">
                                        Giao dịch được bảo mật với công nghệ mã hóa SSL
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentPage;