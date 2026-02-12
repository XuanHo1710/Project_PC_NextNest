'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Spin, Divider } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    HomeOutlined,
    ShoppingOutlined,
    LoadingOutlined,
    ExclamationCircleOutlined,
    CreditCardOutlined,
    ClockCircleOutlined,
    MailOutlined,
} from '@ant-design/icons';
import { paymentClientService, VerifyPaymentResponse } from '@/services/client/payment.client.service';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useCartStore from '@/hooks/useCart';

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

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function PaymentInfoPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<VerifyStatus>('loading');
    const [verifyResult, setVerifyResult] = useState<VerifyPaymentResponse | null>(null);
    const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
    const hasVerified = useRef(false);

    useEffect(() => {
        if (hasVerified.current) return;
        hasVerified.current = true;

        const verify = async () => {
            const code = searchParams.get('code');
            const payosStatus = searchParams.get('status');
            const orderCode = searchParams.get('orderCode');
            const cancel = searchParams.get('cancel');

            const savedOrder = sessionStorage.getItem('pendingOrder');
            let orderInfo: PendingOrder | null = null;
            if (savedOrder) {
                try {
                    orderInfo = JSON.parse(savedOrder);
                    setPendingOrder(orderInfo);
                } catch { /* ignore */ }
            }

            if (cancel === 'true' || payosStatus === 'CANCELLED') {
                setStatus('cancelled');
                return;
            }

            if (code !== '00' || !orderCode) {
                setStatus('failed');
                return;
            }

            try {
                const result = await paymentClientService.verifyPayment({
                    orderCode: parseInt(orderCode),
                    status: payosStatus || 'PAID',
                });

                setVerifyResult(result);
                if (result.success) {
                    setStatus('success');
                    sessionStorage.removeItem('pendingOrder');
                    sessionStorage.removeItem('orderData');
                    // Clear cart in Zustand + localStorage
                    useCartStore.getState().clearCart();
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('failed');
            }
        };

        verify();
    }, [searchParams]);

    // ==================== LOADING ====================
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full mx-4 border border-gray-100"
                >
                    <div className="relative inline-block mb-6">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 52, color: '#3b82f6' }} spin />} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Đang xác thực thanh toán</h2>
                    <p className="text-gray-400 text-sm">Vui lòng không đóng trang này trong quá trình xác thực...</p>
                    <div className="mt-6 flex justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-blue-400"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==================== SUCCESS ====================
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-8 md:py-16">
                <div className="max-w-2xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                        {/* Success Header */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-6 py-10 text-center relative overflow-hidden">
                                {/* Decorative circles */}
                                <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                                    className="relative z-10"
                                >
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 border-2 border-white/30">
                                        <CheckCircleOutlined className="!text-5xl !text-white" />
                                    </div>
                                </motion.div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 relative z-10">
                                    Thanh toán thành công!
                                </h1>
                                <p className="text-green-100 text-base relative z-10">
                                    Đơn hàng của bạn đã được xác nhận và đang được xử lý
                                </p>
                            </div>

                            {/* Transaction Info */}
                            <div className="p-6">
                                {verifyResult?.data && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <CreditCardOutlined /> Thông tin giao dịch
                                        </h3>
                                        <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                                            <div className="flex justify-between items-center px-4 py-3">
                                                <span className="text-gray-500 text-sm">Mã thanh toán</span>
                                                <span className="font-bold text-blue-600 font-mono">
                                                    #{verifyResult.data.paymentCode}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-3">
                                                <span className="text-gray-500 text-sm">Số tiền</span>
                                                <span className="font-bold text-emerald-600 text-lg">
                                                    {formatCurrency(verifyResult.data.amount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-3">
                                                <span className="text-gray-500 text-sm">Trạng thái</span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                    {verifyResult.data.status === 'COMPLETED' ? 'Đã thanh toán' : verifyResult.data.status}
                                                </span>
                                            </div>
                                            {verifyResult.data.transactionId && (
                                                <div className="flex justify-between items-center px-4 py-3">
                                                    <span className="text-gray-500 text-sm">Mã giao dịch</span>
                                                    <span className="font-mono text-sm text-gray-700">
                                                        {verifyResult.data.transactionId}
                                                    </span>
                                                </div>
                                            )}
                                            {verifyResult.data.paidAt && (
                                                <div className="flex justify-between items-center px-4 py-3">
                                                    <span className="text-gray-500 text-sm flex items-center gap-1">
                                                        <ClockCircleOutlined className="text-xs" /> Thời gian
                                                    </span>
                                                    <span className="text-sm text-gray-700">
                                                        {new Date(verifyResult.data.paidAt).toLocaleString('vi-VN')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Order Items Summary */}
                                {pendingOrder && (
                                    <>
                                        <Divider className="!my-4" />
                                        <div className="mb-6">
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <ShoppingOutlined /> Chi tiết đơn hàng
                                            </h3>
                                            <div className="space-y-2">
                                                {pendingOrder.orderData.orderDetail.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-start py-2.5 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                        <div className="flex-1 min-w-0 mr-3">
                                                            <p className="font-medium text-gray-800 line-clamp-1 text-sm">
                                                                {item.product.name}
                                                            </p>
                                                            {item.productVariant?.combination && Object.keys(item.productVariant.combination).length > 0 && (
                                                                <p className="text-gray-400 text-xs mt-0.5">
                                                                    {Object.entries(item.productVariant.combination).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                                                                </p>
                                                            )}
                                                            <p className="text-gray-400 text-xs mt-0.5">
                                                                x{item.quantity} × {formatCurrency(item.price)}
                                                            </p>
                                                        </div>
                                                        <span className="font-semibold text-blue-600 text-sm whitespace-nowrap">
                                                            {formatCurrency(item.subtotal)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                                                <span className="text-base font-semibold text-gray-700">Tổng cộng</span>
                                                <span className="text-xl font-bold text-red-500">
                                                    {formatCurrency(pendingOrder.orderData.totalAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Email notification */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3">
                                    <MailOutlined className="text-blue-500 text-lg flex-shrink-0" />
                                    <p className="text-blue-700 text-sm">
                                        Email xác nhận đã được gửi đến{' '}
                                        <strong>{pendingOrder?.orderData.customerInfo.email}</strong>
                                    </p>
                                </div>

                                {/* Delivery timeline */}
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                                    <p className="text-amber-800 text-sm font-medium mb-1">
                                        📦 Đơn hàng sẽ được giao trong 1-3 ngày làm việc
                                    </p>
                                    <p className="text-amber-600 text-xs">
                                        Bạn sẽ nhận được thông báo khi đơn hàng được vận chuyển
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link href="/home" className="flex-1">
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<HomeOutlined />}
                                            className="w-full h-12 text-base font-semibold rounded-xl !bg-emerald-500 hover:!bg-emerald-600 border-emerald-500"
                                        >
                                            Về trang chủ
                                        </Button>
                                    </Link>
                                    <Link href="/profile/order" className="flex-1">
                                        <Button
                                            size="large"
                                            icon={<ShoppingOutlined />}
                                            className="w-full h-12 text-base font-semibold rounded-xl"
                                        >
                                            Xem đơn hàng
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ==================== CANCELLED ====================
    if (status === 'cancelled') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 md:py-16">
                <div className="max-w-lg mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 px-6 py-10 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3" />
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                                >
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 border-2 border-white/30">
                                        <ExclamationCircleOutlined className="!text-5xl !text-white" />
                                    </div>
                                </motion.div>
                                <h1 className="text-2xl font-bold text-white mb-1">Thanh toán đã bị hủy</h1>
                                <p className="text-orange-100">Giao dịch chưa được xử lý</p>
                            </div>

                            <div className="p-6 text-center">
                                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                                    <p className="text-orange-700 text-sm">
                                        Bạn đã hủy giao dịch thanh toán. Đơn hàng vẫn được giữ lại và bạn có thể thanh toán lại bất cứ lúc nào.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link href="/profile/pending-payment" className="flex-1">
                                        <Button
                                            type="primary"
                                            size="large"
                                            className="w-full h-12 text-base font-semibold rounded-xl !bg-orange-500 hover:!bg-orange-600 border-orange-500"
                                        >
                                            Thanh toán lại
                                        </Button>
                                    </Link>
                                    <Link href="/home" className="flex-1">
                                        <Button
                                            size="large"
                                            icon={<HomeOutlined />}
                                            className="w-full h-12 text-base font-semibold rounded-xl"
                                        >
                                            Về trang chủ
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ==================== FAILED ====================
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 py-8 md:py-16">
            <div className="max-w-lg mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 px-6 py-10 text-center relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 border-2 border-white/30">
                                    <CloseCircleOutlined className="!text-5xl !text-white" />
                                </div>
                            </motion.div>
                            <h1 className="text-2xl font-bold text-white mb-1">Thanh toán thất bại</h1>
                            <p className="text-red-100">Giao dịch không thể hoàn tất</p>
                        </div>

                        <div className="p-6 text-center">
                            {verifyResult?.message && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                                    <p className="text-red-600 text-sm">{verifyResult.message}</p>
                                </div>
                            )}

                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
                                <p className="text-gray-600 text-sm mb-2">Có thể do một số nguyên nhân:</p>
                                <ul className="text-gray-500 text-xs text-left space-y-1.5 pl-4">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>Số dư tài khoản không đủ</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>Giao dịch bị từ chối bởi ngân hàng</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>Lỗi kết nối trong quá trình thanh toán</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/profile/pending-payment" className="flex-1">
                                    <Button
                                        type="primary"
                                        danger
                                        size="large"
                                        className="w-full h-12 text-base font-semibold rounded-xl"
                                    >
                                        Thử lại
                                    </Button>
                                </Link>
                                <Link href="/home" className="flex-1">
                                    <Button
                                        size="large"
                                        icon={<HomeOutlined />}
                                        className="w-full h-12 text-base font-semibold rounded-xl"
                                    >
                                        Về trang chủ
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
