'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Result, Button, Spin, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { paymentClientService } from '@/services/client/payment.client.service';
import Link from 'next/link';

const { Text } = Typography;

export default function VnpayReturnPage() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<{
        isValid: boolean;
        message: string;
        transactionData?: Record<string, string>;
    } | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const urlParams = new URLSearchParams(searchParams.toString());
                const response = await paymentClientService.verifyVnpayReturn(urlParams);
                console.log(response);

                setResult({
                    isValid: response.isValid,
                    message: response.message,
                    transactionData: response.transactionData
                });
            } catch (error) {
                console.error('Lỗi xác thực thanh toán:', error);
                setResult({
                    isValid: false,
                    message: 'Có lỗi xảy ra khi xác thực thanh toán'
                });
            } finally {
                setLoading(false);
            }
        };

        if (searchParams.toString()) {
            verifyPayment();
        } else {
            setLoading(false);
            setResult({
                isValid: false,
                message: 'Không tìm thấy thông tin giao dịch'
            });
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="text-center p-8">
                    <Spin size="large" />
                    <div className="mt-4">
                        <Text>Đang xác thực giao dịch...</Text>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Card className="shadow-lg">
                    <Result
                        icon={result?.isValid ?
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} /> :
                            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '72px' }} />
                        }
                        status={result?.isValid ? 'success' : 'error'}
                        title={<span className="text-2xl font-bold">{result?.isValid ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}</span>}
                        subTitle={<span className="text-lg">{result?.message}</span>}
                        extra={
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    type="primary"
                                    key="home"
                                    size="large"
                                    className="w-full sm:w-auto min-w-[200px] h-12 hover:border-blue-500"
                                >
                                    <Link href="/home">
                                        Về trang chủ
                                    </Link>
                                </Button>
                                {result?.isValid && (
                                    <Button
                                        key="orders"
                                        size="large"
                                        className="w-full sm:w-auto min-w-[200px] h-12 hover:border-blue-500"
                                    >
                                        <Link href="/orders">
                                            Xem đơn hàng
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        }
                    />

                    {result?.transactionData && (
                        <div className="mt-8 p-6 bg-gray-50 rounded-xl border">
                            <Text strong className="block mb-6 text-lg">Thông tin giao dịch:</Text>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.transactionData.orderId && (
                                    <div className="flex flex-col space-y-1">
                                        <Text type="secondary" className="text-sm">Mã đơn hàng:</Text>
                                        <Text className="font-medium">{result.transactionData.orderId}</Text>
                                    </div>
                                )}
                                {result.transactionData.amount && (
                                    <div className="flex flex-col space-y-1">
                                        <Text type="secondary" className="text-sm">Số tiền:</Text>
                                        <Text className="font-medium text-green-600 text-lg">
                                            {(parseInt(result.transactionData.amount) / 100).toLocaleString('vi-VN')} VNĐ
                                        </Text>
                                    </div>
                                )}
                                {result.transactionData.payDate && (
                                    <div className="flex flex-col space-y-1">
                                        <Text type="secondary" className="text-sm">Thời gian thanh toán:</Text>
                                        <Text className="font-medium">{new Date(
                                            result.transactionData.payDate.replace(
                                                /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
                                                '$1-$2-$3T$4:$5:$6'
                                            )
                                        ).toLocaleString('vi-VN')}</Text>
                                    </div>
                                )}
                                {result.transactionData.transactionNo && (
                                    <div className="flex flex-col space-y-1">
                                        <Text type="secondary" className="text-sm">Mã giao dịch:</Text>
                                        <Text className="font-medium">{result.transactionData.transactionNo}</Text>
                                    </div>
                                )}
                                {result.transactionData.bankCode && (
                                    <div className="flex flex-col space-y-1">
                                        <Text type="secondary" className="text-sm">Ngân hàng:</Text>
                                        <Text className="font-medium">{result.transactionData.bankCode}</Text>
                                    </div>
                                )}
                                {result.transactionData.orderInfo && (
                                    <div className="flex flex-col space-y-1 md:col-span-2">
                                        <Text type="secondary" className="text-sm">Thông tin đơn hàng:</Text>
                                        <Text className="font-medium break-words">{decodeURIComponent(result.transactionData.orderInfo)}</Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}