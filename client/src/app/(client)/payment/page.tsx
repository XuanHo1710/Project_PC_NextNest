"use client";

import React from 'react';
import { Card, Divider } from 'antd';
import PaymentMethods from '@/components/client/PaymentMethods';
import Link from 'next/link';

const PaymentPage = () => {
    // Dữ liệu đơn hàng mẫu
    const orderInfo = {
        products: [
            { name: 'Laptop Gaming ASUS ROG', quantity: 1, price: 25000000 },
            { name: 'Chuột Gaming Logitech G502', quantity: 2, price: 1500000 }
        ],
        shipping: 200000,
        discount: 50
    };

    const subtotal = orderInfo.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const total = subtotal + orderInfo.shipping - orderInfo.discount;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Dữ liệu đơn hàng để truyền cho PaymentMethods
    const orderData = {
        orderId: `DH${Date.now().toString().slice(-6)}`,
        amount: total,
        orderDescription: `Thanh toan don hang ${orderInfo.products.map(p => p.name).join(', ')}`
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 dark:text-white pt-3">
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
                                {orderInfo.products.map((product, index) => (
                                    <div key={index} className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{product.name}</p>
                                            <p className="text-sm text-gray-600">Số lượng: {product.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-gray-800 ml-4">
                                            {formatCurrency(product.price * product.quantity)}
                                        </p>
                                    </div>
                                ))}

                                <Divider className="my-4" />

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính:</span>
                                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí vận chuyển:</span>
                                        <span className="font-medium">{formatCurrency(orderInfo.shipping)}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá:</span>
                                        <span className="font-medium">-{formatCurrency(orderInfo.discount)}</span>
                                    </div>

                                    <Divider className="my-3" />

                                    <div className="flex justify-between text-xl font-bold text-gray-900">
                                        <span>Tổng cộng:</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-800 text-center">
                                    🔒 Giao dịch được bảo mật với công nghệ mã hóa SSL
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;