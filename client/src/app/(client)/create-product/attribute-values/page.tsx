'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    Button, Modal, Form, Input, Tag, Table, Select, ColorPicker,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import InfiniteSelect from '@/components/common/InfiniteSelect';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';
import {
    useClientAllAttributeValues,
    useClientAttributeValuesMap,
    useClientProductAttributes,
} from '@/hooks/client/useProductManage';
import { productManageClientService } from '@/services/client/product-manage.client.service';
import type { IProductAttribute, IProductAttributeValue } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { clientProductKeys } from '@/hooks/client/useProductManage';

export default function AttributeValuesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterAttribute, setFilterAttribute] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: attributes } = useClientProductAttributes();
    const attributeList = attributes?.data ?? [];

    // Fetch ALL values when no filter, or values for specific attribute when filtered
    const {
        data: allData,
        isLoading: isLoadingAll,
    } = useClientAllAttributeValues(currentPage, pageSize, searchText || undefined);

    const {
        allValues: filteredByAttrValues = [],
        isLoading: isLoadingFiltered,
    } = useClientAttributeValuesMap(filterAttribute ? [filterAttribute] : []);

    // Determine data source: if filtering by attribute, use per-attribute hook; otherwise use all-values hook
    const isFiltering = !!filterAttribute;
    const isLoading = isFiltering ? isLoadingFiltered : isLoadingAll;

    const valueList = useMemo(() => {
        if (isFiltering) {
            let result = filteredByAttrValues as IProductAttributeValue[];
            if (searchText) {
                const lower = searchText.toLowerCase();
                result = result.filter(
                    v => v.value.toLowerCase().includes(lower) || v.label.toLowerCase().includes(lower),
                );
            }
            return result;
        }
        return (allData?.data ?? []) as IProductAttributeValue[];
    }, [isFiltering, filteredByAttrValues, allData, searchText]);

    const totalItems = isFiltering
        ? valueList.length
        : (allData?.pagination?.totalItems ?? 0);

    const selectedAttributeId = Form.useWatch('attribute', form);
    const selectedAttribute = attributeList.find(a => a._id === selectedAttributeId);

    // Determine which displayTypes are present in the current data
    const displayTypesInData = useMemo(() => {
        if (isFiltering && filterAttribute) {
            const attr = attributeList.find(a => a._id === filterAttribute);
            return attr ? new Set([attr.displayType]) : new Set<string>();
        }
        const types = new Set<string>();
        for (const v of valueList) {
            const dt = typeof v.attribute === 'object' ? v.attribute?.displayType : attributeList.find(a => a._id === v.attribute)?.displayType;
            if (dt) types.add(dt);
        }
        return types;
    }, [valueList, isFiltering, filterAttribute, attributeList]);

    const getAttributeName = (attr: string | IProductAttribute) => {
        if (typeof attr === 'string') return attributeList.find(a => a._id === attr)?.name || attr;
        return attr?.name || '';
    };

    const getAttributeDisplayType = (attr: string | IProductAttribute): string | undefined => {
        if (typeof attr === 'object' && attr?.displayType) return attr.displayType;
        if (typeof attr === 'string') return attributeList.find(a => a._id === attr)?.displayType;
        return undefined;
    };

    const fetchAttributes = useCallback(
        (params: { page: number; limit: number; keyword?: string }) =>
            productManageClientService.getAttributes(params),
        [],
    );

    const mapAttribute = useCallback(
        (item: IProductAttribute) => ({
            label: `${item.name} (${item.code}) — ${item.displayType}`,
            value: item._id,
            raw: item,
        }),
        [],
    );

    const createMutation = useMutation({
        mutationFn: (data: { value: string; label: string; attribute: string; colorHex?: string; imageUrl?: string }) =>
            productManageClientService.createAttributeValue(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-all-attribute-values'] });
            queryClient.invalidateQueries({ queryKey: clientProductKeys.attributeValues('') });
            if (filterAttribute) {
                queryClient.invalidateQueries({ queryKey: clientProductKeys.attributeValues(filterAttribute) });
            }
            toast.success('Tạo giá trị thuộc tính thành công!');
        },
        onError: (error: Error) => {
            toast.error(`Tạo thất bại: ${error.message}`);
        },
    });

    const handleCreate = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            let colorHex = '';
            if (selectedAttribute?.displayType === 'COLOR' && values.colorHex) {
                colorHex = typeof values.colorHex === 'object'
                    ? values.colorHex.toHexString()
                    : values.colorHex;
            }
            const payload = {
                value: values.value,
                label: values.label,
                attribute: values.attribute,
                colorHex,
                imageUrl: selectedAttribute?.displayType === 'IMAGE' ? (values.imageUrl || '') : '',
            };
            await createMutation.mutateAsync(payload);
            setIsModalOpen(false);
            form.resetFields();
        } catch { /* validation */ }
    };

    const attributeFilterOptions = attributeList.map(a => ({
        label: `${a.name} (${a.code})`,
        value: a._id,
    }));

    // Build columns dynamically
    const columns = useMemo(() => {
        const cols: ColumnsType<IProductAttributeValue> = [
            {
                title: '#',
                key: 'index',
                width: 50,
                render: (_, __, idx) => {
                    const base = isFiltering ? 0 : (currentPage - 1) * pageSize;
                    return <span className="text-gray-500">{base + idx + 1}</span>;
                },
            },
            {
                title: 'Nhãn (label)',
                dataIndex: 'label',
                key: 'label',
                render: (label: string) => <span className="font-medium">{label}</span>,
            },
            {
                title: 'Giá trị (value)',
                dataIndex: 'value',
                key: 'value',
                render: (value: string) => <Tag>{value}</Tag>,
            },
            {
                title: 'Thuộc tính',
                key: 'attribute',
                width: 150,
                render: (_, record) => (
                    <Tag color="blue">{getAttributeName(record.attribute)}</Tag>
                ),
            },
        ];

        // Show colorHex column only if COLOR type values are present
        if (displayTypesInData.has('COLOR')) {
            cols.push({
                title: 'Mã màu',
                key: 'colorHex',
                width: 120,
                render: (_, record) => {
                    if (!record.colorHex) return <span className="text-gray-300">—</span>;
                    return (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-5 h-5 rounded border border-gray-300"
                                style={{ backgroundColor: record.colorHex }}
                            />
                            <span className="text-xs text-gray-500">{record.colorHex}</span>
                        </div>
                    );
                },
            });
        }

        // Show image column only if IMAGE type values are present
        if (displayTypesInData.has('IMAGE')) {
            cols.push({
                title: 'Hình ảnh',
                key: 'imageUrl',
                width: 100,
                render: (_, record) => {
                    if (!record.imageUrl) return <span className="text-gray-300">—</span>;
                    return (
                        <img
                            src={record.imageUrl}
                            alt={record.label}
                            className="w-8 h-8 rounded object-cover border border-gray-200"
                        />
                    );
                },
            });
        }

        return cols;
    }, [displayTypesInData, currentPage, pageSize, isFiltering, attributeList]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold m-0">Giá trị thuộc tính</h1>
                    <p className="text-gray-500 text-sm m-0 mt-1">
                        Quản lý giá trị cho từng thuộc tính ({totalItems} giá trị)
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Thêm giá trị
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Input
                    placeholder="Tìm kiếm giá trị theo tên..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setCurrentPage(1);
                    }}
                    allowClear
                    style={{ maxWidth: 300 }}
                />
                <Select
                    placeholder="Lọc theo thuộc tính..."
                    options={attributeFilterOptions}
                    allowClear
                    value={filterAttribute}
                    onChange={(val) => {
                        setFilterAttribute(val || null);
                        setCurrentPage(1);
                    }}
                    style={{ minWidth: 250 }}
                />
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={valueList}
                rowKey="_id"
                loading={isLoading}
                pagination={
                    isFiltering
                        ? {
                            current: currentPage,
                            pageSize,
                            total: totalItems,
                            showTotal: (total) => `Tổng ${total} giá trị`,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                            onChange: (p, s) => {
                                setCurrentPage(p);
                                setPageSize(s);
                            },
                        }
                        : {
                            current: currentPage,
                            pageSize,
                            total: totalItems,
                            showTotal: (total) => `Tổng ${total} giá trị`,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                            onChange: (p, s) => {
                                setCurrentPage(p);
                                setPageSize(s);
                            },
                        }
                }
                bordered
                size="middle"
            />

            {/* Modal */}
            <Modal
                title="Thêm giá trị thuộc tính mới"
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
                onOk={handleSubmit}
                confirmLoading={createMutation.isPending}
                okText="Tạo mới"
                cancelText="Hủy"
                destroyOnHidden
                width={520}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="attribute"
                        label="Thuộc tính"
                        rules={[{ required: true, message: 'Vui lòng chọn thuộc tính' }]}
                    >
                        <InfiniteSelect
                            fetchFn={fetchAttributes}
                            mapOption={mapAttribute}
                            queryKeyPrefix="attrModalSelect"
                            pageSize={15}
                            placeholder="Tìm kiếm thuộc tính..."
                        />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="value"
                            label="Giá trị (value)"
                            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                        >
                            <Input placeholder="Ví dụ: red, 8gb, s..." />
                        </Form.Item>
                        <Form.Item
                            name="label"
                            label="Nhãn hiển thị (label)"
                            rules={[{ required: true, message: 'Vui lòng nhập nhãn' }]}
                        >
                            <Input placeholder="Ví dụ: Đỏ, 8GB, Size S..." />
                        </Form.Item>
                    </div>

                    {/* COLOR: Color picker */}
                    {selectedAttribute?.displayType === 'COLOR' && (
                        <Form.Item
                            name="colorHex"
                            label="Chọn màu sắc"
                            rules={[{ required: true, message: 'Vui lòng chọn màu' }]}
                        >
                            <ColorPicker
                                showText
                                format="hex"
                                presets={[{
                                    label: 'Phổ biến',
                                    colors: [
                                        '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
                                        '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
                                        '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0', '#FFD700',
                                    ],
                                }]}
                            />
                        </Form.Item>
                    )}

                    {/* IMAGE: Cloudinary upload */}
                    {selectedAttribute?.displayType === 'IMAGE' && (
                        <Form.Item
                            name="imageUrl"
                            label="Hình ảnh"
                            rules={[{ required: true, message: 'Vui lòng tải ảnh lên' }]}
                            getValueFromEvent={(urls: string[]) => urls?.[0] || ''}
                            getValueProps={(value: string) => ({ value: value ? [value] : [] })}
                        >
                            <CloudinaryUpload single maxCount={1} placeholder="Tải ảnh" />
                        </Form.Item>
                    )}

                    {/* BUTTON/RADIO: Info */}
                    {(selectedAttribute?.displayType === 'BUTTON' || selectedAttribute?.displayType === 'RADIO') && (
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600 mb-4">
                            Kiểu hiển thị: <strong>{selectedAttribute.displayType === 'BUTTON' ? 'Nút bấm' : 'Radio'}</strong> — Chỉ cần nhập giá trị và nhãn hiển thị.
                        </div>
                    )}
                </Form>
            </Modal>
        </div>
    );
}
