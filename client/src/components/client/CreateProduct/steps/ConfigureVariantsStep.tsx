'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    Card, Button, Table, Tag, InputNumber, Input, Switch, Divider,
    message, Badge, Tooltip, Popconfirm, Space
} from 'antd';
import {
    ThunderboltOutlined,
    AppstoreOutlined,
    ArrowLeftOutlined,
    DeleteOutlined,
    PictureOutlined,
    CopyOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import type { IProductAttribute, IProductAttributeValue } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';

// Types
export interface VariantRow {
    key: string;
    combination: Record<string, string>;
    combinationIds: Record<string, string>;
    sku: string;
    price: number;
    discount: number;
    stock: number;
    images: string[];
    subDescription: string;
    enabled: boolean;
}

interface ConfigureVariantsStepProps {
    attributes: IProductAttribute[];
    attributeValues: IProductAttributeValue[];
    selectedAttributes: string[];
    selectedValues: Record<string, string[]>;
    variants: VariantRow[];
    setVariants: React.Dispatch<React.SetStateAction<VariantRow[]>>;
    variantsGenerated: boolean;
    setVariantsGenerated: React.Dispatch<React.SetStateAction<boolean>>;
    onBack: () => void;
    onSubmit: () => Promise<void>;
    isSubmitting: boolean;
}

export default function ConfigureVariantsStep({
    attributes,
    attributeValues,
    selectedAttributes,
    selectedValues,
    variants,
    setVariants,
    variantsGenerated,
    setVariantsGenerated,
    onBack,
    onSubmit,
    isSubmitting
}: ConfigureVariantsStepProps) {

    // Batch pricing state
    const [batchPrice, setBatchPrice] = useState<number>(0);
    const [batchDiscount, setBatchDiscount] = useState<number>(0);
    const [batchStock, setBatchStock] = useState<number>(0);

    // Helper functions
    const getAttributeById = useCallback((id: string) => {
        return attributes.find(a => a._id === id);
    }, [attributes]);

    const getValueById = useCallback((id: string) => {
        return attributeValues.find(v => v._id === id);
    }, [attributeValues]);

    // Total variants preview
    const totalVariantsPreview = useMemo(() => {
        let total = 1;
        let hasAny = false;
        for (const attrId of selectedAttributes) {
            const count = (selectedValues[attrId] || []).length;
            if (count > 0) {
                total *= count;
                hasAny = true;
            }
        }
        return hasAny ? total : 0;
    }, [selectedAttributes, selectedValues]);

    // Generate variants function
    const generateVariants = useCallback(() => {
        const attributeArrays: { attributeId: string; name: string; code: string; values: IProductAttributeValue[] }[] = [];

        for (const attrId of selectedAttributes) {
            const attr = getAttributeById(attrId);
            const valIds = selectedValues[attrId] || [];
            if (valIds.length === 0) continue;

            const vals = valIds.map(id => getValueById(id)).filter(Boolean) as IProductAttributeValue[];
            if (vals.length > 0 && attr) {
                attributeArrays.push({
                    attributeId: attrId,
                    name: attr.name,
                    code: attr.code || attr.name,
                    values: vals,
                });
            }
        }

        if (attributeArrays.length === 0) {
            message.warning('Vui lòng chọn ít nhất 1 thuộc tính và giá trị');
            return;
        }

        // Cartesian product
        const cartesian = (arrays: IProductAttributeValue[][]): IProductAttributeValue[][] => {
            if (arrays.length === 0) return [[]];
            const [first, ...rest] = arrays;
            const restCombinations = cartesian(rest);
            return first.flatMap(val => restCombinations.map(combo => [val, ...combo]));
        };

        const allCombinations = cartesian(attributeArrays.map(a => a.values));

        const newVariants: VariantRow[] = allCombinations.map((combo, idx) => {
            const combination: Record<string, string> = {};
            const combinationIds: Record<string, string> = {};

            combo.forEach((val, i) => {
                const attr = attributeArrays[i];
                combination[attr.code] = val.label;
                combinationIds[attr.code] = val.label;
            });

            const skuParts = combo.map(v => v.value.toUpperCase().replace(/\s+/g, ''));
            const sku = `SKU-${skuParts.join('-')}-${String(idx + 1).padStart(3, '0')}-${new Date().getTime().toString()}`;

            return {
                key: `variant-${idx}`,
                combination,
                combinationIds,
                sku,
                price: batchPrice || 0,
                discount: batchDiscount || 0,
                stock: batchStock || 0,
                images: [],
                subDescription: '',
                enabled: true,
            };
        });

        setVariants(newVariants);
        setVariantsGenerated(true);
        message.success(`Đã sinh ${newVariants.length} biến thể sản phẩm!`);
    }, [selectedAttributes, selectedValues, getAttributeById, getValueById, batchPrice, batchDiscount, batchStock, setVariants, setVariantsGenerated]);

    // Batch apply functions
    const applyBatchPrice = () => {
        if (batchPrice <= 0) {
            message.warning('Vui lòng nhập giá hợp lệ');
            return;
        }
        setVariants(prev => prev.map(v => ({ ...v, price: batchPrice })));
        message.success(`Đã áp dụng giá ${batchPrice.toLocaleString()}đ cho tất cả biến thể`);
    };

    const applyBatchDiscount = () => {
        setVariants(prev => prev.map(v => ({ ...v, discount: batchDiscount })));
        message.success(`Đã áp dụng giảm giá ${batchDiscount}% cho tất cả biến thể`);
    };

    const applyBatchStock = () => {
        setVariants(prev => prev.map(v => ({ ...v, stock: batchStock })));
        message.success(`Đã áp dụng tồn kho ${batchStock} cho tất cả biến thể`);
    };

    // Update single variant
    const updateVariant = (idx: number, field: keyof VariantRow, value: any) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };

    // Table columns
    const variantColumns: ColumnsType<VariantRow> = [
        {
            title: '#',
            key: 'index',
            width: 50,
            fixed: 'left',
            render: (_, __, idx) => (
                <span className="text-gray-500 font-medium">{idx + 1}</span>
            ),
        },
        ...selectedAttributes.map(attrId => {
            const attr = getAttributeById(attrId);
            return {
                title: <span className="font-semibold">{attr?.name}</span>,
                key: attr?.code || attrId,
                width: 120,
                render: (_: unknown, record: VariantRow) => {
                    const label = record.combination[attr?.code || ''];
                    const valueId = record.combinationIds[attr?.code || ''];
                    const val = getValueById(valueId);

                    if (attr?.displayType === 'COLOR' && val?.colorHex) {
                        return (
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-5 h-5 rounded-full border-2 border-white shadow"
                                    style={{ backgroundColor: val.colorHex }}
                                />
                                <span className="text-sm">{label}</span>
                            </div>
                        );
                    }
                    return <Tag color="blue">{label}</Tag>;
                },
            };
        }),
        {
            title: <span className="font-semibold">SKU</span>,
            dataIndex: 'sku',
            key: 'sku',
            width: 180,
            render: (sku: string, _record: VariantRow, idx: number) => (
                <Input
                    value={sku}
                    onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                    size="small"
                    className="rounded"
                />
            ),
        },
        {
            title: <span className="font-semibold">Giá (VND)</span>,
            dataIndex: 'price',
            key: 'price',
            width: 140,
            render: (price: number, _record: VariantRow, idx: number) => (
                <InputNumber
                    value={price}
                    onChange={(val) => updateVariant(idx, 'price', val || 0)}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                    min={0}
                    className="w-full"
                    size="small"
                />
            ),
        },
        {
            title: <span className="font-semibold">Giảm (%)</span>,
            dataIndex: 'discount',
            key: 'discount',
            width: 100,
            render: (discount: number, _record: VariantRow, idx: number) => (
                <InputNumber
                    value={discount}
                    onChange={(val) => updateVariant(idx, 'discount', val || 0)}
                    min={0}
                    max={100}
                    className="w-full"
                    size="small"
                    suffix="%"
                />
            ),
        },
        {
            title: <span className="font-semibold">Tồn kho</span>,
            dataIndex: 'stock',
            key: 'stock',
            width: 100,
            render: (stock: number, _record: VariantRow, idx: number) => (
                <InputNumber
                    value={stock}
                    onChange={(val) => updateVariant(idx, 'stock', val || 0)}
                    min={0}
                    className="w-full"
                    size="small"
                />
            ),
        },
        {
            title: <span className="font-semibold">Giá cuối</span>,
            key: 'finalPrice',
            width: 120,
            render: (_: unknown, record: VariantRow) => {
                const final = record.price * (1 - record.discount / 100);
                return (
                    <span className="font-semibold text-green-600">
                        {final.toLocaleString()}đ
                    </span>
                );
            },
        },
        {
            title: 'Bật',
            key: 'enabled',
            width: 60,
            render: (_: unknown, record: VariantRow, idx: number) => (
                <Switch
                    checked={record.enabled}
                    onChange={(checked) => updateVariant(idx, 'enabled', checked)}
                    size="small"
                />
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 50,
            fixed: 'right',
            render: (_: unknown, __: VariantRow, idx: number) => (
                <Popconfirm
                    title="Xóa biến thể này?"
                    onConfirm={() => {
                        setVariants(prev => prev.filter((_, i) => i !== idx));
                    }}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                    />
                </Popconfirm>
            ),
        },
    ];

    // Stats
    const enabledCount = variants.filter(v => v.enabled).length;
    const totalRevenue = variants
        .filter(v => v.enabled)
        .reduce((sum, v) => sum + v.price * (1 - v.discount / 100) * v.stock, 0);

    // Expandable row render — images + subdescription per variant
    const expandedRowRender = (record: VariantRow, idx: number) => {
        const variantIdx = variants.findIndex(v => v.key === record.key);
        if (variantIdx === -1) return null;

        return (
            <div className="p-4 bg-gray-50 space-y-4">
                {/* Images section — Cloudinary Upload */}
                <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <PictureOutlined className="text-gray-500" />
                        Ảnh biến thể
                    </label>
                    <CloudinaryUpload
                        value={record.images}
                        onChange={(urls) => updateVariant(variantIdx, 'images', urls)}
                        maxCount={8}
                        placeholder="Tải ảnh"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Tải ảnh từ máy tính lên Cloudinary. Ảnh đầu tiên sẽ là ảnh đại diện.
                    </p>
                </div>

                {/* Sub-description section */}
                <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <FileTextOutlined className="text-gray-500" />
                        Mô tả phụ biến thể
                    </label>
                    <Input.TextArea
                        value={record.subDescription}
                        onChange={e => updateVariant(variantIdx, 'subDescription', e.target.value)}
                        placeholder="Mô tả thêm cho biến thể này (tuỳ chọn)..."
                        rows={2}
                        maxLength={500}
                        showCount
                        className="max-w-lg"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Generate Card */}
            <Card className="border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold m-0">Sinh biến thể sản phẩm</h2>
                        <p className="text-gray-500 text-sm m-0 mt-1">
                            {totalVariantsPreview} tổ hợp từ {selectedAttributes.length} thuộc tính
                        </p>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<ThunderboltOutlined />}
                        onClick={generateVariants}
                    >
                        {variantsGenerated ? 'Sinh lại' : 'Sinh biến thể'}
                    </Button>
                </div>

                {/* Batch Settings */}
                {variantsGenerated && variants.length > 0 && (
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
                            Cài đặt hàng loạt
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Batch Price */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Giá đồng loạt (VND)</label>
                                    <InputNumber
                                        value={batchPrice}
                                        onChange={(val) => setBatchPrice(val || 0)}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                                        min={0}
                                        className="w-full"
                                        placeholder="0"
                                    />
                                </div>
                                <Button
                                    onClick={applyBatchPrice}
                                    className="self-end"
                                    icon={<CopyOutlined />}
                                >
                                    Áp dụng
                                </Button>
                            </div>

                            {/* Batch Discount */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Giảm giá đồng loạt (%)</label>
                                    <InputNumber
                                        value={batchDiscount}
                                        onChange={(val) => setBatchDiscount(val || 0)}
                                        min={0}
                                        max={100}
                                        className="w-full"
                                        placeholder="0"
                                        suffix="%"
                                    />
                                </div>
                                <Button
                                    onClick={applyBatchDiscount}
                                    className="self-end"
                                    icon={<CopyOutlined />}
                                >
                                    Áp dụng
                                </Button>
                            </div>

                            {/* Batch Stock */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Tồn kho đồng loạt</label>
                                    <InputNumber
                                        value={batchStock}
                                        onChange={(val) => setBatchStock(val || 0)}
                                        min={0}
                                        className="w-full"
                                        placeholder="0"
                                    />
                                </div>
                                <Button
                                    onClick={applyBatchStock}
                                    className="self-end"
                                    icon={<CopyOutlined />}
                                >
                                    Áp dụng
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Variants Table */}
            {variantsGenerated && variants.length > 0 && (
                <Card
                    className="border shadow-sm"
                    title={
                        <div className="flex items-center gap-3">
                            <AppstoreOutlined className="text-gray-500" />
                            <span className="font-semibold">Danh sách biến thể</span>
                            <Badge
                                count={enabledCount}
                                style={{ backgroundColor: '#52c41a' }}
                            />
                            <span className="text-gray-400 text-sm font-normal">
                                / {variants.length} biến thể
                            </span>
                        </div>
                    }
                    extra={
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Tổng giá trị kho</div>
                            <div className="text-lg font-bold text-green-600">
                                {totalRevenue.toLocaleString()}đ
                            </div>
                        </div>
                    }
                >
                    <Table
                        columns={variantColumns}
                        dataSource={variants}
                        rowKey="key"
                        pagination={variants.length > 10 ? {
                            pageSize: 10,
                            showTotal: (t) => `Tổng ${t} biến thể`,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50']
                        } : false}
                        bordered
                        size="small"
                        scroll={{ x: 'max-content' }}
                        expandable={{
                            expandedRowRender,
                            expandRowByClick: false,
                            columnTitle: <Tooltip title="Ảnh & mô tả"><PictureOutlined /></Tooltip>,
                            columnWidth: 50,
                        }}
                        rowClassName={(record) =>
                            record.enabled
                                ? 'hover:bg-blue-50 transition-colors'
                                : 'opacity-40 bg-gray-50'
                        }
                    />
                </Card>
            )}

            {/* Navigation */}
            <Card className="border shadow-sm">
                <div className="flex justify-between items-center">
                    <Button
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                    >
                        Quay lại
                    </Button>

                    <div className="flex items-center gap-4">
                        {enabledCount > 0 && (
                            <div className="text-right hidden md:block">
                                <div className="text-sm text-gray-500">Sẵn sàng</div>
                                <div className="text-lg font-bold text-blue-600">
                                    {enabledCount} biến thể
                                </div>
                            </div>
                        )}
                        <Button
                            type="primary"
                            size="large"
                            onClick={onSubmit}
                            loading={isSubmitting}
                            disabled={!variantsGenerated || enabledCount === 0}
                        >
                            Tiếp theo: Xem lại & Đăng bán
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
