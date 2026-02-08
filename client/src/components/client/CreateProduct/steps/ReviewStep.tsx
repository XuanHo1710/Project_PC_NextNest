'use client';

import React, { useMemo } from 'react';
import {
    Card, Button, Tag, Alert, Descriptions, Table,
    Statistic, Tooltip,
} from 'antd';
import {
    ArrowLeftOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import type { IProductAttribute, IProductAttributeValue } from '@/types';
import type { VariantRow } from './ConfigureVariantsStep';

interface ReviewStepProps {
    productInfo: {
        name: string;
        description?: string;
        category?: string;
        brand?: string;
    };
    categoryName?: string;
    brandName?: string;
    attributes: IProductAttribute[];
    attributeValues: IProductAttributeValue[];
    selectedAttributes: string[];
    selectedValues: Record<string, string[]>;
    variants: VariantRow[];
    onBack: () => void;
    onSubmit: () => Promise<void>;
    isSubmitting: boolean;
}

export default function ReviewStep({
    productInfo,
    categoryName,
    brandName,
    attributes,
    attributeValues,
    selectedAttributes,
    selectedValues,
    variants,
    onBack,
    onSubmit,
    isSubmitting,
}: ReviewStepProps) {
    const getAttributeById = (id: string) => attributes.find(a => a._id === id);
    const getValueById = (id: string) => attributeValues.find(v => v._id === id);

    const enabledVariants = variants.filter(v => v.enabled);

    const stats = useMemo(() => {
        const prices = enabledVariants.map(v => v.price * (1 - v.discount / 100));
        const allPricesOriginal = enabledVariants.map(v => v.price);
        const totalStock = enabledVariants.reduce((s, v) => s + v.stock, 0);
        const totalRevenue = enabledVariants.reduce(
            (s, v) => s + v.price * (1 - v.discount / 100) * v.stock, 0
        );
        const avgDiscount = enabledVariants.length > 0
            ? enabledVariants.reduce((s, v) => s + v.discount, 0) / enabledVariants.length
            : 0;

        return {
            minPrice: prices.length > 0 ? Math.min(...prices) : 0,
            maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
            minOriginal: allPricesOriginal.length > 0 ? Math.min(...allPricesOriginal) : 0,
            maxOriginal: allPricesOriginal.length > 0 ? Math.max(...allPricesOriginal) : 0,
            totalStock,
            totalRevenue,
            avgDiscount: Math.round(avgDiscount),
            enabledCount: enabledVariants.length,
            totalCount: variants.length,
        };
    }, [enabledVariants, variants]);

    // Completeness check
    const issues: string[] = [];
    if (!productInfo.name) issues.push('Chưa nhập tên sản phẩm');
    if (!productInfo.category) issues.push('Chưa chọn danh mục');
    if (enabledVariants.length === 0) issues.push('Không có biến thể nào được bật');
    if (enabledVariants.some(v => v.price <= 0)) issues.push('Có biến thể chưa nhập giá');
    if (enabledVariants.some(v => v.stock <= 0)) issues.push('Có biến thể chưa nhập tồn kho');

    const isReady = issues.length === 0;
    const completeness = Math.round(
        ((productInfo.name ? 20 : 0) +
            (productInfo.category ? 15 : 0) +
            (enabledVariants.length > 0 ? 25 : 0) +
            (enabledVariants.every(v => v.price > 0) ? 20 : 0) +
            (enabledVariants.every(v => v.stock > 0) ? 20 : 0))
    );

    // Preview variant table (compact)
    const previewColumns = [
        {
            title: '#',
            key: 'idx',
            width: 45,
            render: (_: unknown, __: VariantRow, idx: number) => (
                <span className="text-gray-400 text-xs">{idx + 1}</span>
            ),
        },
        ...selectedAttributes.map(attrId => {
            const attr = getAttributeById(attrId);
            return {
                title: <span className="text-xs font-semibold">{attr?.name}</span>,
                key: attr?.code || attrId,
                render: (_: unknown, record: VariantRow) => {
                    const label = record.combination[attr?.code || ''];
                    const valueId = record.combinationIds[attr?.code || ''];
                    const val = getValueById(valueId);

                    if (attr?.displayType === 'COLOR' && val?.colorHex) {
                        return (
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-4 h-4 rounded-full border border-gray-200 shadow-sm shrink-0"
                                    style={{ backgroundColor: val.colorHex }}
                                />
                                <span className="text-xs">{label}</span>
                            </div>
                        );
                    }
                    return <Tag color="blue" className="text-xs">{label}</Tag>;
                },
            };
        }),
        {
            title: <span className="text-xs font-semibold">SKU</span>,
            dataIndex: 'sku',
            key: 'sku',
            width: 140,
            render: (sku: string) => (
                <span className="text-xs font-mono text-gray-600">{sku}</span>
            ),
        },
        {
            title: <span className="text-xs font-semibold">Giá gốc</span>,
            key: 'price',
            width: 110,
            render: (_: unknown, record: VariantRow) => (
                <span className="text-xs font-medium">
                    {record.price.toLocaleString()}đ
                </span>
            ),
        },
        {
            title: <span className="text-xs font-semibold">Giảm</span>,
            key: 'discount',
            width: 60,
            render: (_: unknown, record: VariantRow) => (
                record.discount > 0
                    ? <Tag color="red" className="text-xs">-{record.discount}%</Tag>
                    : <span className="text-xs text-gray-400">—</span>
            ),
        },
        {
            title: <span className="text-xs font-semibold">Giá bán</span>,
            key: 'finalPrice',
            width: 110,
            render: (_: unknown, record: VariantRow) => {
                const final = record.price * (1 - record.discount / 100);
                return (
                    <span className="text-xs font-bold text-green-600">
                        {final.toLocaleString()}đ
                    </span>
                );
            },
        },
        {
            title: <span className="text-xs font-semibold">Kho</span>,
            dataIndex: 'stock',
            key: 'stock',
            width: 60,
            render: (stock: number) => (
                <span className={`text-xs font-medium ${stock > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                    {stock}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="border shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold m-0">Xem lại & Đăng bán</h2>
                        <p className="text-gray-500 text-sm m-0 mt-1">
                            Kiểm tra toàn bộ thông tin trước khi đăng sản phẩm
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-gray-500">Hoàn thiện: </span>
                        <span className={`font-bold ${completeness === 100 ? 'text-green-600' : 'text-yellow-600'}`}>{completeness}%</span>
                    </div>
                </div>

                {!isReady && (
                    <Alert
                        type="warning"
                        showIcon
                        message="Cần bổ sung thêm"
                        description={
                            <ul className="m-0 pl-4 space-y-1">
                                {issues.map((issue, i) => (
                                    <li key={i} className="text-sm">{issue}</li>
                                ))}
                            </ul>
                        }
                        className="mt-4"
                    />
                )}
            </Card>

            {/* Product Info Summary */}
            <Card
                className="border shadow-sm"
                title="Thông tin sản phẩm"
            >
                <Descriptions
                    column={{ xs: 1, sm: 2 }}
                    labelStyle={{ fontWeight: 600, color: '#6b7280' }}
                    contentStyle={{ color: '#111827' }}
                >
                    <Descriptions.Item label="Tên sản phẩm" span={2}>
                        <span className="text-lg font-semibold text-gray-900">
                            {productInfo.name || '—'}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Danh mục">
                        {categoryName ? (
                            <Tag color="blue">{categoryName}</Tag>
                        ) : (
                            <span className="text-gray-400">Chưa chọn</span>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thương hiệu">
                        {brandName ? (
                            <Tag color="purple">{brandName}</Tag>
                        ) : (
                            <span className="text-gray-400">Không có</span>
                        )}
                    </Descriptions.Item>
                    {productInfo.description && (
                        <Descriptions.Item label="Mô tả" span={2}>
                            <div
                                className="text-sm text-gray-600 m-0 max-h-40 overflow-y-auto prose prose-sm"
                                dangerouslySetInnerHTML={{ __html: productInfo.description }}
                            />
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Card>

            {/* Attributes Summary */}
            <Card
                className="border shadow-sm"
                title={`Thuộc tính đã chọn (${selectedAttributes.length})`}
            >
                <div className="space-y-3">
                    {selectedAttributes.map(attrId => {
                        const attr = getAttributeById(attrId);
                        const vals = (selectedValues[attrId] || []).map(vId => getValueById(vId)).filter(Boolean);

                        return (
                            <div key={attrId} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="min-w-[100px]">
                                    <span className="font-semibold text-gray-800 text-sm">{attr?.name}</span>
                                    <div>
                                        <Tag color="geekblue" className="text-xs mt-1">{attr?.code}</Tag>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {vals.map(val => (
                                        <div
                                            key={val!._id}
                                            className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm"
                                        >
                                            {attr?.displayType === 'COLOR' && val!.colorHex && (
                                                <span
                                                    className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                                                    style={{ backgroundColor: val!.colorHex }}
                                                />
                                            )}
                                            <span className="text-xs font-medium text-gray-700">
                                                {val!.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border shadow-sm">
                    <Statistic
                        title={<span className="text-gray-500 text-xs">Biến thể hoạt động</span>}
                        value={stats.enabledCount}
                        suffix={<span className="text-sm text-gray-400">/ {stats.totalCount}</span>}
                        valueStyle={{ fontWeight: 700, fontSize: 28 }}
                    />
                </Card>
                <Card className="border shadow-sm">
                    <Statistic
                        title={<span className="text-gray-500 text-xs">Khoảng giá bán</span>}
                        value={stats.minPrice.toLocaleString()}
                        suffix={
                            stats.minPrice !== stats.maxPrice
                                ? <span className="text-sm"> — {stats.maxPrice.toLocaleString()}đ</span>
                                : <span className="text-sm">đ</span>
                        }
                        valueStyle={{ fontWeight: 700, fontSize: 20 }}
                    />
                </Card>
                <Card className="border shadow-sm">
                    <Statistic
                        title={<span className="text-gray-500 text-xs">Tổng tồn kho</span>}
                        value={stats.totalStock}
                        suffix="sản phẩm"
                        valueStyle={{ fontWeight: 700, fontSize: 28 }}
                    />
                </Card>
                <Card className="border shadow-sm">
                    <Statistic
                        title={<span className="text-gray-500 text-xs">Tổng giá trị kho</span>}
                        value={stats.totalRevenue.toLocaleString()}
                        suffix="đ"
                        valueStyle={{ fontWeight: 700, fontSize: 20 }}
                    />
                </Card>
            </div>

            {/* Variants Preview Table */}
            <Card
                className="border shadow-sm"
                title={`Danh sách biến thể (${stats.enabledCount})`}
            >
                <Table
                    columns={previewColumns}
                    dataSource={enabledVariants}
                    rowKey="key"
                    pagination={enabledVariants.length > 5 ? {
                        pageSize: 5,
                        size: 'small',
                        showTotal: (t) => <span className="text-xs text-gray-500">Tổng {t} biến thể</span>,
                    } : false}
                    bordered
                    size="small"
                    scroll={{ x: 'max-content' }}
                    className="review-table"
                />
            </Card>

            {/* Submit Section */}
            <Card className="border shadow-sm">
                {isReady ? (
                    <Alert
                        type="success"
                        showIcon
                        message="Sẵn sàng đăng bán!"
                        description="Tất cả thông tin đã hoàn thiện. Nhấn nút bên dưới để đăng sản phẩm."
                        className="mb-4"
                    />
                ) : (
                    <Alert
                        type="warning"
                        showIcon
                        message="Chưa hoàn thiện"
                        description="Vui lòng quay lại và bổ sung các thông tin thiếu."
                        className="mb-4"
                    />
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                    <Button
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                    >
                        Quay lại chỉnh sửa
                    </Button>

                    <Tooltip title={!isReady ? 'Vui lòng bổ sung đầy đủ thông tin' : ''}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<RocketOutlined />}
                            onClick={onSubmit}
                            loading={isSubmitting}
                            disabled={!isReady}
                        >
                            Đăng bán sản phẩm ({stats.enabledCount} biến thể)
                        </Button>
                    </Tooltip>
                </div>
            </Card>
        </div>
    );
}
