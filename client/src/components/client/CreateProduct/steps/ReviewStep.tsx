'use client';

import React, { useMemo } from 'react';
import {
    Card, Button, Tag, Divider, Alert, Space, Badge, Descriptions, Table,
    Statistic, Tooltip, Progress,
} from 'antd';
import {
    CheckCircleOutlined,
    ArrowLeftOutlined,
    RocketOutlined,
    ShoppingOutlined,
    TagsOutlined,
    AppstoreOutlined,
    DollarOutlined,
    InboxOutlined,
    InfoCircleOutlined,
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
            <Card
                className="shadow-lg border-0 overflow-hidden"
                styles={{ body: { padding: 0 } }}
            >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center">
                                <CheckCircleOutlined className="text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold m-0">Xem lại & Đăng bán</h2>
                                <p className="text-blue-100 m-0 text-sm mt-1">
                                    Kiểm tra toàn bộ thông tin trước khi đăng sản phẩm
                                </p>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-sm text-white/70 mb-1">Hoàn thiện</div>
                            <Progress
                                type="circle"
                                percent={completeness}
                                size={56}
                                strokeColor={completeness === 100 ? '#52c41a' : '#faad14'}
                                trailColor="rgba(255,255,255,0.2)"
                                format={(pct) => (
                                    <span className="text-white text-sm font-bold">{pct}%</span>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Issues Alert */}
                {!isReady && (
                    <div className="px-6 pt-4">
                        <Alert
                            type="warning"
                            showIcon
                            icon={<InfoCircleOutlined />}
                            message="Cần bổ sung thêm"
                            description={
                                <ul className="m-0 pl-4 space-y-1">
                                    {issues.map((issue, i) => (
                                        <li key={i} className="text-sm">{issue}</li>
                                    ))}
                                </ul>
                            }
                            className="rounded-lg"
                        />
                    </div>
                )}
            </Card>

            {/* Product Info Summary */}
            <Card
                className="shadow-lg border-0"
                title={
                    <div className="flex items-center gap-2">
                        <ShoppingOutlined className="text-blue-500" />
                        <span className="font-semibold">Thông tin sản phẩm</span>
                    </div>
                }
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
                className="shadow-lg border-0"
                title={
                    <div className="flex items-center gap-2">
                        <TagsOutlined className="text-blue-500" />
                        <span className="font-semibold">Thuộc tính đã chọn</span>
                        <Badge count={selectedAttributes.length} style={{ backgroundColor: '#2563eb' }} />
                    </div>
                }
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
                <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                    <Statistic
                        title={<span className="text-blue-600 text-xs font-medium">Biến thể hoạt động</span>}
                        value={stats.enabledCount}
                        suffix={<span className="text-sm text-gray-400">/ {stats.totalCount}</span>}
                        valueStyle={{ color: '#2563eb', fontWeight: 700, fontSize: 28 }}
                        prefix={<AppstoreOutlined />}
                    />
                </Card>
                <Card className="shadow-md border-0 bg-gradient-to-br from-sky-50 to-blue-100">
                    <Statistic
                        title={<span className="text-blue-600 text-xs font-medium">Khoảng giá bán</span>}
                        value={stats.minPrice.toLocaleString()}
                        suffix={
                            stats.minPrice !== stats.maxPrice
                                ? <span className="text-sm"> — {stats.maxPrice.toLocaleString()}đ</span>
                                : <span className="text-sm">đ</span>
                        }
                        valueStyle={{ color: '#1d4ed8', fontWeight: 700, fontSize: 20 }}
                        prefix={<DollarOutlined />}
                    />
                </Card>
                <Card className="shadow-md border-0 bg-gradient-to-br from-indigo-50 to-blue-100">
                    <Statistic
                        title={<span className="text-indigo-600 text-xs font-medium">Tổng tồn kho</span>}
                        value={stats.totalStock}
                        suffix="sản phẩm"
                        valueStyle={{ color: '#4338ca', fontWeight: 700, fontSize: 28 }}
                        prefix={<InboxOutlined />}
                    />
                </Card>
                <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Statistic
                        title={<span className="text-blue-700 text-xs font-medium">Tổng giá trị kho</span>}
                        value={stats.totalRevenue.toLocaleString()}
                        suffix="đ"
                        valueStyle={{ color: '#1e40af', fontWeight: 700, fontSize: 20 }}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </div>

            {/* Variants Preview Table */}
            <Card
                className="shadow-lg border-0"
                title={
                    <div className="flex items-center gap-2">
                        <AppstoreOutlined className="text-blue-500" />
                        <span className="font-semibold">Danh sách biến thể</span>
                        <Badge count={stats.enabledCount} style={{ backgroundColor: '#52c41a' }} />
                    </div>
                }
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
            <Card className="shadow-lg border-0 overflow-hidden" styles={{ body: { padding: 0 } }}>
                {isReady ? (
                    <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircleOutlined className="text-blue-600 text-xl" />
                            <div>
                                <h4 className="font-semibold text-blue-800 m-0">Sẵn sàng đăng bán!</h4>
                                <p className="text-sm text-blue-600 m-0">
                                    Tất cả thông tin đã hoàn thiện. Nhấn nút bên dưới để đăng sản phẩm.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <InfoCircleOutlined className="text-amber-500 text-xl" />
                            <div>
                                <h4 className="font-semibold text-amber-800 m-0">Chưa hoàn thiện</h4>
                                <p className="text-sm text-amber-600 m-0">
                                    Vui lòng quay lại và bổ sung các thông tin thiếu.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6 flex justify-between items-center border-t border-gray-100">
                    <Button
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        className="h-12 px-6 rounded-lg font-medium"
                    >
                        Quay lại chỉnh sửa
                    </Button>

                    <Space>
                        <div className="text-right hidden md:block mr-4">
                            <div className="text-xs text-gray-500">Đăng bán</div>
                            <div className="text-lg font-bold text-blue-600">
                                {stats.enabledCount} biến thể
                            </div>
                        </div>
                        <Tooltip title={!isReady ? 'Vui lòng bổ sung đầy đủ thông tin' : ''}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<RocketOutlined />}
                                onClick={onSubmit}
                                loading={isSubmitting}
                                disabled={!isReady}
                                className="h-14 px-10 rounded-xl font-bold text-base bg-gradient-to-r from-blue-600 to-blue-700 border-0 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                Đăng bán sản phẩm
                            </Button>
                        </Tooltip>
                    </Space>
                </div>
            </Card>
        </div>
    );
}
