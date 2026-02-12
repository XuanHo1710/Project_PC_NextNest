'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Button, Spin, Typography, Divider } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    HomeOutlined,
    ShoppingOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { paymentClientService, VerifyPaymentResponse } from '@/services/client/payment.client.service';
import Link from 'next/link';
import useCartStore from '@/hooks/useCart';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

interface PendingOrder {
    orderId: string;
    orderCode: number;
    orderData: {
        customerInfo: {
            guestId: string;
            fullname: string;
            phone: string;
            email: string;
            address: string;
            note: string;
        };
        orderDetail: Array<{
            productVariant: { _id: string; combination: Record<string, string> };
            product: { name: string };
            quantity: number;
            price: number;
            subtotal: number;
        }>;
        totalAmount: number;
    };
}

type VerifyStatus = 'loading' | 'success' | 'failed' | 'cancelled';

export default function PaymentInfoPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCartStore();
    const [status, setStatus] = useState<VerifyStatus>('loading');
    const [verifyResult, setVerifyResult] = useState<VerifyPaymentResponse | null>(null);
    const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
    const hasVerified = useRef(false);

    useEffect(() => {
        if (hasVerified.current) return;
        hasVerified.current = true;

        const verify = async () => {
            // Read PayOS return params
            const code = searchParams.get('code');
            const payosStatus = searchParams.get('status');
            const orderCode = searchParams.get('orderCode');
            const cancel = searchParams.get('cancel');

            // Retrieved saved order data
            const savedOrder = sessionStorage.getItem('pendingOrder');
            let orderInfo: PendingOrder | null = null;
            if (savedOrder) {
                try {
                    orderInfo = JSON.parse(savedOrder);
                    setPendingOrder(orderInfo);
                } catch {
                    // ignore parse error
                }
            }

            // Cancelled by user
            if (cancel === 'true' || payosStatus === 'CANCELLED') {
                setStatus('cancelled');
                return;
            }

            // Payment failed 
            if (code !== '00' || !orderCode) {
                setStatus('failed');
                return;
            }

            // If status is PAID, verify with backend
            if (!orderInfo) {
                setStatus('failed');
                return;
            }

            try {
                const result = await paymentClientService.verifyPayment({
                    orderCode: parseInt(orderCode),
                    status: payosStatus || 'PAID',
                    customerEmail: orderInfo.orderData.customerInfo.email,
                    orderItems: orderInfo.orderData.orderDetail.map((item) => ({
                        productVariant: item.productVariant._id,
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: item.subtotal,
                    })),
                });

                setVerifyResult(result);

                if (result.success) {
                    setStatus('success');
                    clearCart();
                    sessionStorage.removeItem('pendingOrder');
                    sessionStorage.removeItem('orderData');
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('failed');
            }
        };

        verify();
    }, [searchParams, clearCart]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <Card className="text-center p-12 shadow-2xl border-0 rounded-2xl max-w-md w-full mx-4">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                    <Title level={3} className="!mt-6 !mb-2 text-gray-800">
                        Đang xác thực thanh toán...
                    </Title>
                    <Paragraph className="text-gray-500 !mb-0">
                        Vui lòng không đóng trang này
                    </Paragraph>
                </Card>
            </div>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
                            {/* Green header bar */}
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 -mx-6 -mt-6 px-6 py-8 mb-6">
                                <div className="text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                                        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4"
                                    >
                                        <CheckCircleOutlined className="!text-5xl text-white" />
                                    </motion.div>
                                    <Title level={2} className="!text-white !mb-1">
                                        Thanh toán thành công!
                                    </Title>
                                    <Text className="text-green-100 text-lg">
                                        Đơn hàng đã được xác nhận
                                    </Text>
                                </div>
                            </div>

                            {/* Transaction details */}
                            {verifyResult?.data && (
                                <div className="space-y-4 mb-6">
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Text className="text-gray-500">Mã thanh toán:</Text>
                                            <Text strong className="text-blue-600">
                                                #{verifyResult.data.paymentCode}
                                            </Text>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <Text className="text-gray-500">Số tiền:</Text>
                                            <Text strong className="text-green-600 text-lg">
                                                {formatCurrency(verifyResult.data.amount)}
                                            </Text>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <Text className="text-gray-500">Trạng thái:</Text>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                {verifyResult.data.status === 'COMPLETED' ? 'Đã thanh toán' : verifyResult.data.status}
                                            </span>
                                        </div>
                                        {verifyResult.data.transactionId && (
                                            <div className="flex justify-between items-center">
                                                <Text className="text-gray-500">Mã giao dịch:</Text>
                                                <Text className="font-mono text-sm">
                                                    {verifyResult.data.transactionId}
                                                </Text>
                                            </div>
                                        )}
                                        {verifyResult.data.paidAt && (
                                            <div className="flex justify-between items-center">
                                                <Text className="text-gray-500">Thời gian:</Text>
                                                <Text>
                                                    {new Date(verifyResult.data.paidAt).toLocaleString('vi-VN')}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Order items summary */}
                            {pendingOrder && (
                                <>
                                    <Divider />
                                    <div className="mb-6">
                                        <Title level={5} className="!mb-3 text-gray-700">
                                            Chi tiết đơn hàng
                                        </Title>
                                        <div className="space-y-2">
                                            {pendingOrder.orderData.orderDetail.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <Text className="font-medium line-clamp-1">
                                                            {item.product.name}
                                                        </Text>
                                                        <Text className="text-gray-400 text-xs block">
                                                            x{item.quantity}
                                                        </Text>
                                                    </div>
                                                    <Text strong className="text-blue-600 ml-4">
                                                        {formatCurrency(item.subtotal)}
                                                    </Text>
                                                </div>
                                            ))}
                                        </div>
                                        <Divider className="!my-3" />
                                        <div className="flex justify-between items-center px-3">
                                            <Text strong className="text-lg">Tổng cộng:</Text>
                                            <Text strong className="text-xl text-red-500">
                                                {formatCurrency(pendingOrder.orderData.totalAmount)}
                                            </Text>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Notification */}
                            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
                                <Text className="text-blue-700 text-sm">
                                    📧 Email xác nhận đơn hàng đã được gửi đến{' '}
                                    <strong>{pendingOrder?.orderData.customerInfo.email}</strong>
                                </Text>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/home" className="flex-1">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<HomeOutlined />}
                                        className="w-full h-12 text-base font-semibold"
                                    >
                                        Về trang chủ
                                    </Button>
                                </Link>
                                <Link href="/profile/order" className="flex-1">
                                    <Button
                                        size="large"
                                        icon={<ShoppingOutlined />}
                                        className="w-full h-12 text-base font-semibold"
                                    >
                                        Xem đơn hàng
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Cancelled state
    if (status === 'cancelled') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-12">
                <div className="max-w-lg mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="shadow-2xl border-0 rounded-2xl text-center py-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                                <CloseCircleOutlined className="!text-5xl text-orange-500" />
                            </div>
                            <Title level={2} className="!mb-2 text-gray-800">
                                Thanh toán đã bị hủy
                            </Title>
                            <Paragraph className="text-gray-500 text-lg mb-8">
                                Bạn đã hủy giao dịch thanh toán. Đơn hàng chưa được xử lý.
                            </Paragraph>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                                <Link href="/cart" className="flex-1">
                                    <Button
                                        type="primary"
                                        size="large"
                                        className="w-full h-12 text-base font-semibold bg-orange-500 hover:bg-orange-600 border-orange-500"
                                    >
                                        Quay lại giỏ hàng
                                    </Button>
                                </Link>
                                <Link href="/home" className="flex-1">
                                    <Button
                                        size="large"
                                        icon={<HomeOutlined />}
                                        className="w-full h-12 text-base font-semibold"
                                    >
                                        Về trang chủ
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Failed state
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 py-12">
            <div className="max-w-lg mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Card className="shadow-2xl border-0 rounded-2xl text-center py-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                            <CloseCircleOutlined className="!text-5xl text-red-500" />
                        </div>
                        <Title level={2} className="!mb-2 text-gray-800">
                            Thanh toán thất bại
                        </Title>
                        <Paragraph className="text-gray-500 text-lg mb-2">
                            Giao dịch không thành công. Vui lòng thử lại.
                        </Paragraph>
                        {verifyResult?.message && (
                            <Text type="secondary" className="block mb-8">
                                {verifyResult.message}
                            </Text>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                            <Link href="/payment" className="flex-1">
                                <Button
                                    type="primary"
                                    danger
                                    size="large"
                                    className="w-full h-12 text-base font-semibold"
                                >
                                    Thử lại
                                </Button>
                            </Link>
                            <Link href="/home" className="flex-1">
                                <Button
                                    size="large"
                                    icon={<HomeOutlined />}
                                    className="w-full h-12 text-base font-semibold"
                                >
                                    Về trang chủ
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
