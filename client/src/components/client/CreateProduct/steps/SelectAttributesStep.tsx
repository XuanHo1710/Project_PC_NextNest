'use client';

import React, { useMemo, useCallback } from 'react';
import {
    Card, Tag, Badge, Space, Button, Alert, Empty, Divider, Tooltip
} from 'antd';
import {
    TagsOutlined,
    InfoCircleOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import InfiniteSelect from '@/components/common/InfiniteSelect';
import { productManageClientService } from '@/services/client/product-manage.client.service';
import type { IProductAttribute, IProductAttributeValue } from '@/types';

interface SelectAttributesStepProps {
    attributes: IProductAttribute[];
    attributeValues: IProductAttributeValue[];
    selectedAttributes: string[];
    selectedValues: Record<string, string[]>;
    onAttributeChange: (attrIds: string[]) => void;
    onAttributeSelect: (attrId: string, attrObject: IProductAttribute) => void;
    onValueChange: (attributeId: string, valueIds: string[]) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function SelectAttributesStep({
    attributes,
    attributeValues,
    selectedAttributes,
    selectedValues,
    onAttributeChange,
    onAttributeSelect,
    onValueChange,
    onBack,
    onNext
}: SelectAttributesStepProps) {

    // Helper functions
    const getAttributeById = (id: string) => {
        return attributes.find(a => a._id === id);
    };

    const getValuesForAttribute = (attributeId: string) => {
        return attributeValues.filter(v => {
            const attrId = typeof v.attribute === 'string' ? v.attribute : (v.attribute as any)?._id;
            return attrId === attributeId;
        });
    };

    // Calculate total variants preview
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

    // InfiniteSelect fetch and map functions
    const fetchAttributes = useCallback(
        (params: { page: number; limit: number; keyword?: string }) =>
            productManageClientService.getAttributes(params),
        [],
    );

    const mapAttribute = useCallback(
        (item: IProductAttribute) => ({
            label: `${item.name}${item.code ? ` (${item.code})` : ''}`,
            value: item._id,
            raw: item,
        }),
        [],
    );

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
                                <TagsOutlined className="text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold m-0">Chọn thuộc tính sản phẩm</h2>
                                <p className="text-blue-100 m-0 text-sm mt-1">
                                    Cấu hình các biến thể cho sản phẩm của bạn
                                </p>
                            </div>
                        </div>

                        {totalVariantsPreview > 0 && (
                            <div className="text-right">
                                <div className="text-3xl font-bold">{totalVariantsPreview}</div>
                                <div className="text-blue-200 text-sm">biến thể</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {/* Info Alert */}
                    <Alert
                        message="Hướng dẫn"
                        description={
                            <span>
                                Chọn các thuộc tính như <strong>Màu sắc</strong>, <strong>RAM</strong>, <strong>Dung lượng</strong>...
                                rồi chọn giá trị cụ thể. Hệ thống sẽ tự động sinh tổ hợp biến thể.
                            </span>
                        }
                        type="info"
                        showIcon
                        icon={<InfoCircleOutlined />}
                        className="mb-6 rounded-lg"
                    />

                    {/* Select Attributes — InfiniteSelect with mode="multiple" */}
                    <div className="mb-6">
                        <label className="text-gray-700 font-medium block mb-2">
                            Chọn thuộc tính
                        </label>
                        <InfiniteSelect
                            mode="multiple"
                            fetchFn={fetchAttributes}
                            mapOption={mapAttribute}
                            queryKeyPrefix="attr-step-select"
                            placeholder="Tìm và chọn thuộc tính sản phẩm..."
                            value={selectedAttributes}
                            onChange={onAttributeChange}
                            onSelect={(value: string, option: any) => {
                                if (option?.raw) {
                                    onAttributeSelect(value, option.raw);
                                }
                            }}
                            size="large"
                            maxTagCount={5}
                            className="w-full"
                            pageSize={20}
                            emptyText="Không tìm thấy thuộc tính"
                        />
                    </div>

                    <Divider className="my-6" />

                    {/* Selected Attributes with Values */}
                    {selectedAttributes.length === 0 ? (
                        <Empty
                            description="Chưa chọn thuộc tính nào"
                            className="py-12"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <div className="space-y-4">
                            {selectedAttributes.map(attrId => {
                                const attr = getAttributeById(attrId);
                                const availableValues = getValuesForAttribute(attrId);
                                const selectedValIds = selectedValues[attrId] || [];

                                return (
                                    <Card
                                        key={attrId}
                                        size="small"
                                        className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent"
                                        title={
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-800">{attr?.name}</span>
                                                <Tag color="blue">{attr?.displayType}</Tag>
                                                {attr?.code && (
                                                    <Tag color="geekblue">{attr.code}</Tag>
                                                )}
                                                <Badge
                                                    count={selectedValIds.length}
                                                    style={{ backgroundColor: selectedValIds.length > 0 ? '#2563eb' : '#d9d9d9' }}
                                                />
                                            </div>
                                        }
                                        extra={
                                            <Space>
                                                <Tooltip title="Chọn tất cả">
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        icon={<CheckOutlined />}
                                                        onClick={() => onValueChange(attrId, availableValues.map(v => v._id))}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="Bỏ chọn tất cả">
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        icon={<CloseOutlined />}
                                                        onClick={() => onValueChange(attrId, [])}
                                                    />
                                                </Tooltip>
                                            </Space>
                                        }
                                    >
                                        {availableValues.length === 0 ? (
                                            <Empty
                                                description={
                                                    <span className="text-gray-500">
                                                        Chưa có giá trị nào cho <strong>{attr?.name}</strong>
                                                    </span>
                                                }
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                className="py-4"
                                            />
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                {availableValues.map(val => {
                                                    const isSelected = selectedValIds.includes(val._id);
                                                    return (
                                                        <div
                                                            key={val._id}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    onValueChange(attrId, selectedValIds.filter(id => id !== val._id));
                                                                } else {
                                                                    onValueChange(attrId, [...selectedValIds, val._id]);
                                                                }
                                                            }}
                                                            className={`
                                                                p-3 rounded-lg border-2 cursor-pointer transition-all
                                                                flex items-center gap-2
                                                                ${isSelected
                                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                                                                }
                                                            `}
                                                        >
                                                            {attr?.displayType === 'COLOR' && val.colorHex ? (
                                                                <>
                                                                    <span
                                                                        className="w-6 h-6 rounded-full border-2 border-white shadow shrink-0"
                                                                        style={{ backgroundColor: val.colorHex }}
                                                                    />
                                                                    <span className="text-sm font-medium truncate">{val.label}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-sm font-medium">{val.label}</span>
                                                            )}
                                                            {isSelected && (
                                                                <CheckOutlined className="text-blue-500 ml-auto" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>

            {/* Variants Preview Summary */}
            {totalVariantsPreview > 0 && (
                <Card className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {totalVariantsPreview}
                            </div>
                            <div>
                                <div className="font-semibold text-blue-800">Tổng số biến thể sẽ được tạo</div>
                                <div className="text-sm text-blue-600">
                                    {selectedAttributes.map(id => getAttributeById(id)?.name).join(' × ')}
                                </div>
                            </div>
                        </div>
                        {totalVariantsPreview > 100 && (
                            <Alert
                                type="warning"
                                message="Số lượng biến thể lớn có thể ảnh hưởng hiệu năng"
                                className="m-0"
                            />
                        )}
                    </div>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    className="h-12 px-6 rounded-lg font-medium"
                >
                    Quay lại
                </Button>
                <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    onClick={onNext}
                    disabled={totalVariantsPreview === 0}
                    className="h-12 px-8 rounded-lg font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                >
                    Tiếp theo: Cấu hình biến thể ({totalVariantsPreview})
                </Button>
            </div>
        </div>
    );
}
