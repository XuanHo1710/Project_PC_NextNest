'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    Card, Table, Button, Modal, Form, Input, Select, Tag,
    Space, Empty, ColorPicker, Upload,
} from 'antd';
import {
    PlusOutlined, AppstoreOutlined, UploadOutlined,
} from '@ant-design/icons';
import InfiniteSelect from '@/components/common/InfiniteSelect';
import {
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
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: attributes } = useClientProductAttributes();
    const { allValues = [], isLoading } = useClientAttributeValuesMap(filterAttribute ? [filterAttribute] : []);

    const attributeList = attributes?.data ?? [];
    const valueList = allValues as IProductAttributeValue[];

    // Watch selected attribute in form to show/hide conditional fields
    const selectedAttributeId = Form.useWatch('attribute', form);
    const selectedAttribute = attributeList.find(a => a._id === selectedAttributeId);

    // Filter values by selected attribute
    const filteredValues = useMemo(() => {
        if (!filterAttribute) return valueList;
        return valueList.filter((v) => {
            const attrId = typeof v.attribute === 'string' ? v.attribute : v.attribute?._id;
            return attrId === filterAttribute;
        });
    }, [valueList, filterAttribute]);

    const getAttributeName = (attr: string | IProductAttribute) => {
        if (typeof attr === 'string') {
            const found = attributeList.find(a => a._id === attr);
            return found?.name || attr;
        }
        return attr?.name || '';
    };

    const getAttributeDisplayType = (attr: string | IProductAttribute) => {
        if (typeof attr === 'object' && attr?.displayType) return attr.displayType;
        if (typeof attr === 'string') {
            const found = attributeList.find(a => a._id === attr);
            return found?.displayType;
        }
        return undefined;
    };

    // Fetch function for InfiniteSelect
    const fetchAttributes = useCallback(
        (params: { page: number; limit: number; keyword?: string }) =>
            productManageClientService.getAttributes(params),
        [],
    );

    const mapAttribute = useCallback(
        (item: IProductAttribute) => ({
            label: (
                <div className="flex items-center justify-between w-full">
                    <span>{item.name} ({item.code})</span>
                    <Tag color={
                        item.displayType === 'COLOR' ? 'magenta' :
                            item.displayType === 'IMAGE' ? 'green' :
                                item.displayType === 'BUTTON' ? 'blue' : 'orange'
                    } className="text-xs">
                        {item.displayType}
                    </Tag>
                </div>
            ),
            value: item._id,
            raw: item,
        }),
        [],
    );

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: { value: string; label: string; attribute: string; colorHex?: string; imageUrl?: string }) =>
            productManageClientService.createAttributeValue(data),
        onSuccess: () => {
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

    const columns: ColumnsType<IProductAttributeValue> = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_, __, idx) => idx + 1,
        },
        {
            title: 'Thuộc tính',
            key: 'attribute',
            render: (_, record) => (
                <Tag color="blue">{getAttributeName(record.attribute)}</Tag>
            ),
        },
        {
            title: 'Giá trị',
            dataIndex: 'value',
            key: 'value',
            render: (value: string, record) => {
                const displayType = getAttributeDisplayType(record.attribute);
                if (displayType === 'COLOR' && record.colorHex) {
                    return (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-7 h-7 rounded-md border-2 border-gray-200 shadow-sm"
                                style={{ backgroundColor: record.colorHex }}
                            />
                            <span className="font-medium">{value}</span>
                        </div>
                    );
                }
                if (displayType === 'IMAGE' && record.imageUrl) {
                    return (
                        <div className="flex items-center gap-2">
                            <img
                                src={record.imageUrl}
                                alt={value}
                                className="w-8 h-8 rounded-md object-cover border border-gray-200"
                            />
                            <span className="font-medium">{value}</span>
                        </div>
                    );
                }
                return <span className="font-medium">{value}</span>;
            },
        },
        {
            title: 'Nhãn hiển thị',
            dataIndex: 'label',
            key: 'label',
        },
        {
            title: 'Preview',
            key: 'preview',
            width: 120,
            render: (_, record) => {
                const displayType = getAttributeDisplayType(record.attribute);
                if (displayType === 'COLOR' && record.colorHex) {
                    return (
                        <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-inner cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: record.colorHex }}
                            title={record.colorHex}
                        />
                    );
                }
                if (displayType === 'IMAGE' && record.imageUrl) {
                    return (
                        <img
                            src={record.imageUrl}
                            alt={record.label}
                            className="w-10 h-10 rounded-md object-cover border border-gray-200 hover:scale-110 transition-transform cursor-pointer"
                        />
                    );
                }
                if (displayType === 'BUTTON') {
                    return (
                        <Button size="small" className="pointer-events-none">
                            {record.label}
                        </Button>
                    );
                }
                return <span className="text-gray-400">—</span>;
            },
        },
    ];

    const handleCreate = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Extract colorHex from ColorPicker object
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
        } catch {
            // validation failed
        }
    };

    return (
        <>
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <AppstoreOutlined />
                        <span>Giá trị thuộc tính</span>
                        <Tag color="green">{filteredValues.length}</Tag>
                    </div>
                }
                extra={
                    <Space>
                        <Select
                            placeholder="Lọc theo thuộc tính"
                            allowClear
                            style={{ width: 200 }}
                            value={filterAttribute}
                            onChange={setFilterAttribute}
                            options={[
                                ...attributeList.map(a => ({ label: `${a.name} (${a.code})`, value: a._id })),
                            ]}
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                            Thêm giá trị
                        </Button>
                    </Space>
                }
                className="shadow-sm"
            >
                {filteredValues.length === 0 && !isLoading ? (
                    <Empty description="Chưa có giá trị nào" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredValues}
                        rowKey="_id"
                        loading={isLoading}
                        pagination={filteredValues.length > 15 ? { pageSize: 15 } : false}
                        size="middle"
                    />
                )}
            </Card>

            <Modal
                title="Thêm giá trị thuộc tính mới"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                okText="Tạo mới"
                cancelText="Hủy"
                confirmLoading={createMutation.isPending}
                destroyOnClose
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
                            queryKeyPrefix="attributeSelect"
                            pageSize={15}
                            placeholder="Tìm kiếm thuộc tính..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="value"
                        label="Giá trị (value)"
                        rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                    >
                        <Input placeholder="Ví dụ: S, M, L, Red, Blue..." />
                    </Form.Item>

                    <Form.Item
                        name="label"
                        label="Nhãn hiển thị (label)"
                        rules={[{ required: true, message: 'Vui lòng nhập nhãn' }]}
                    >
                        <Input placeholder="Ví dụ: Đỏ, Xanh dương, Size S..." />
                    </Form.Item>

                    {/* COLOR: Show color picker */}
                    {selectedAttribute?.displayType === 'COLOR' && (
                        <Form.Item
                            name="colorHex"
                            label="Chọn màu sắc"
                            rules={[{ required: true, message: 'Vui lòng chọn màu' }]}
                        >
                            <ColorPicker
                                showText
                                format="hex"
                                size="large"
                                presets={[
                                    {
                                        label: 'Phổ biến',
                                        colors: [
                                            '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
                                            '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
                                            '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0', '#FFD700',
                                        ],
                                    },
                                ]}
                            />
                        </Form.Item>
                    )}

                    {/* IMAGE: Show image URL input + preview */}
                    {selectedAttribute?.displayType === 'IMAGE' && (
                        <Form.Item
                            name="imageUrl"
                            label="URL hình ảnh"
                            rules={[
                                { required: true, message: 'Vui lòng nhập URL hình ảnh' },
                                { type: 'url', message: 'URL không hợp lệ' },
                            ]}
                        >
                            <Input
                                placeholder="https://example.com/image.png"
                                suffix={<UploadOutlined className="text-gray-400" />}
                            />
                        </Form.Item>
                    )}

                    {/* IMAGE: Preview */}
                    {selectedAttribute?.displayType === 'IMAGE' && (
                        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.imageUrl !== cur.imageUrl}>
                            {() => {
                                const url = form.getFieldValue('imageUrl');
                                if (!url) return null;
                                return (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2">Xem trước:</p>
                                        <img
                                            src={url}
                                            alt="Preview"
                                            className="max-w-[120px] max-h-[120px] rounded-md border border-gray-200 object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                );
                            }}
                        </Form.Item>
                    )}

                    {/* BUTTON/RADIO: No extra fields needed — just value + label */}
                    {(selectedAttribute?.displayType === 'BUTTON' || selectedAttribute?.displayType === 'RADIO') && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
                            Kiểu hiển thị: <strong>{selectedAttribute.displayType === 'BUTTON' ? 'Nút bấm' : 'Radio'}</strong> — Chỉ cần nhập giá trị và nhãn hiển thị.
                        </div>
                    )}
                </Form>
            </Modal>
        </>
    );
}
