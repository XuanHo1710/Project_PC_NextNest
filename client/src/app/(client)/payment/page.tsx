"use client";

import React from 'react';
import { Card, Divider, Tag } from 'antd';
import PaymentMethods from '@/components/client/PaymentMethods';
import Link from 'next/link';
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import { IOrderData } from '@/types';

const PaymentPage = () => {
    // Dữ liệu đơn hàng
    const orderData: IOrderData = sessionStorage.getItem("orderData") ? JSON.parse(sessionStorage.getItem("orderData") || "") : {}
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <>
            <DynamicMetadata
                title="Thanh toán đơn hàng - PC Store"
                description="Hoàn tất thanh toán đơn hàng tại PC Store. Hỗ trợ nhiều phương thức thanh toán: COD, chuyển khoản, VNPAY. Bảo mật tuyệt đối."
                keywords="thanh toán, payment, vnpay, cod, chuyển khoản, đơn hàng"
                ogTitle="Thanh toán đơn hàng - An toàn & Nhanh chóng"
                ogDescription="Hỗ trợ đa dạng phương thức thanh toán, bảo mật thông tin tuyệt đối"
            />
            <div className="min-h-screen my-5 bg-slate-50 dark:bg-gray-900 dark:text-white pt-3">
                {/* Breadcrumb */}
                <div className='rounded-lg mx-5 xl:mx-32 content-header flex items-center flex-wrap mb-6'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <Link href="/cart" className="font-medium text-lg text-stone-500 dark:text-white mr-3 header-nav active">Giỏ hàng</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 dark:text-gray-400 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-500 dark:text-white mr-3">Thanh toán</h3>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Thanh Toán Đơn Hàng</h1>
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
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Thông Tin Đơn Hàng</h3>

                                <div className="space-y-4">
                                    <div style={{ scrollbarWidth: 'none' }} className='max-h-72 min-h-72 overflow-y-scroll'>
                                        {orderData.orderDetail.map((item, index) => (
                                            <div className='flex border-[1px] border-blue-300 p-3 rounded-md my-3 justify-between' key={index}>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800 line-clamp-2">{item.product.name}</p>
                                                    <Tag color="blue" className="!text-xs !m-0 !rounded-md mt-1">
                                                        {Object.entries(item.productVariant.combination).map(([key, val]) => (`${key}: ${val} `))}
                                                    </Tag>
                                                    <p className="text-sm mt-2 text-gray-600">Số lượng: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-blue-500 ml-4">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <Divider className="my-4" />

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tạm tính:</span>
                                            <span className="font-medium">{formatCurrency(orderData.totalAmount || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phí vận chuyển:</span>
                                            <span className="font-medium">Free shipping</span>
                                        </div>
                                        {/* <div className="flex justify-between text-green-600">
                                            <span>Giảm giá:</span>
                                            <span className="font-medium">-{formatCurrency(orderData.orderDetail.reduce((acc, item) => acc + item.productVariant.discount, 0))}</span>
                                        </div> */}

                                        <Divider className="my-3" />

                                        <div className="flex justify-between text-xl font-bold text-gray-900">
                                            <span>Tổng cộng:</span>
                                            <span>{formatCurrency(orderData.totalAmount || 0)}</span>
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