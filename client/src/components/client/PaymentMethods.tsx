'use client';

import React, { useState } from 'react';
import { Radio, Button, Card, Space, Typography, RadioChangeEvent } from 'antd';
import { CreditCardOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { IOrderData } from '@/types/order';
import { useMutation } from '@tanstack/react-query';
import { orderClientService } from '@/services/client/order.client.service';
import useCartStore from '@/hooks/useCart';

const { Title, Text } = Typography;


export default function PaymentMethods({ orderData }: { orderData: IOrderData }) {
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay'>('cod');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const createOrderMutation = useMutation({
        mutationFn: async (data: IOrderData) => {
            return await orderClientService.createOrder(data);
        },
        onSuccess: (result) => {
            if (result.paymentType === 'CARD' && result.url) {
                // Save order info to sessionStorage for the return page
                sessionStorage.setItem('pendingOrder', JSON.stringify({
                    orderId: result.orderId,
                    orderCode: result.orderCode,
                    orderData: orderData,
                }));
                // Redirect to PayOS payment page
                window.location.href = result.url;
            } else {
                // COD - order created successfully
                toast.success('Đặt hàng thành công!');
                sessionStorage.removeItem('orderData');
                // Clear cart
                useCartStore.getState().clearCart();

                // Redirect to success page with order info
                const params = new URLSearchParams({
                    orderId: result.orderId || '',
                    customerName: orderData.customerInfo.fullname,
                    phone: orderData.customerInfo.phone,
                    address: orderData.customerInfo.address,
                    total: (result.totalAmount || orderData.totalAmount).toString(),
                    method: 'COD',
                });
                router.push(`/order-success?${params.toString()}`);
            }
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
        }
    });

    const handlePaymentMethodChange = (e: RadioChangeEvent) => {
        setPaymentMethod(e.target.value);
    };

    const handlePayment = async () => {
        if (!orderData) return;

        setLoading(true);
        try {
            const paymentConfig = paymentMethod === 'cod'
                ? { isCheckout: false, type: 'COD' as const }
                : { isCheckout: true, type: 'CARD' as const };

            createOrderMutation.mutate({
                ...orderData,
                payment: paymentConfig,
            });
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Phương thức thanh toán" className="!w-full shadow-xl border-0">
            <Space direction="vertical" className="!w-full" size="large">
                <Radio.Group
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                    className="!w-full space-y-4 custom-radio-group"
                >
                    {[
                        {
                            key: 'cod',
                            title: 'Thanh toán khi nhận hàng (COD)',
                            desc: 'Thanh toán bằng tiền mặt khi nhận hàng',
                            icon: <DeliveredProcedureOutlined className="!text-2xl !text-orange-500" />,
                        },
                        {
                            key: 'vnpay',
                            title: 'Thanh toán trực tuyến (PayOS)',
                            desc: 'Thanh toán qua QR Code, chuyển khoản ngân hàng',
                            icon: <CreditCardOutlined className="!text-2xl !text-blue-500" />,
                        },
                    ].map((method) => (
                        <label
                            key={method.key}
                            htmlFor={method.key}
                            className={
                                `block w-full cursor-pointer rounded-xl border transition-all duration-200 ${paymentMethod === method.key
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/30'}`
                            }
                        >
                            <Radio
                                id={method.key}
                                value={method.key}
                                className="hidden"
                            />
                            <div className="flex items-center gap-3 p-4 w-full">
                                {method.icon}
                                <div className="flex flex-col">
                                    <Title level={5} className="!mb-1 !text-base !font-semibold">
                                        {method.title}
                                    </Title>
                                    <Text type="secondary" className="!text-sm">
                                        {method.desc}
                                    </Text>
                                </div>
                            </div>
                        </label>
                    ))}
                </Radio.Group>

                <Button
                    type="primary"
                    size="large"
                    onClick={handlePayment}
                    loading={loading || createOrderMutation.isPending}
                    className="w-full h-12 text-lg font-semibold hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                    disabled={!orderData}
                >
                    {paymentMethod === 'cod' ? 'Đặt hàng (COD)' : 'Thanh toán ngay'}
                </Button>

                {!orderData && (
                    <Text type="secondary" className="text-center block">
                        Vui lòng cung cấp thông tin đơn hàng để tiếp tục
                    </Text>
                )}
            </Space>
        </Card>
    );
}