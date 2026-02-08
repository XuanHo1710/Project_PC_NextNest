'use client';

import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, Card, Tooltip, ColorPicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BgColorsOutlined } from '@ant-design/icons';
import {
    useProductAttributes,
    useProductAttributeValues,
    useCreateProductAttributeValue,
    useUpdateProductAttributeValue,
    useDeleteProductAttributeValue,
} from '@/hooks/admin';
import type { IProductAttribute, IProductAttributeValue } from '@/types';
import type { ColumnsType } from 'antd/es/table';

export default function ContentProductAttributeValue() {
    const [searchText, setSearchText] = useState('');
    const [filterAttributeId, setFilterAttributeId] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<IProductAttributeValue | null>(null);
    const [form] = Form.useForm();

    const { data: attributesResponse } = useProductAttributes();
    const attributes = attributesResponse?.data ?? [];
    const { data: allValuesResponse, isLoading } = useProductAttributeValues();
    const allValues = allValuesResponse?.data ?? [];
    const createMutation = useCreateProductAttributeValue();
    const updateMutation = useUpdateProductAttributeValue();
    const deleteMutation = useDeleteProductAttributeValue();

    const selectedAttributeId = Form.useWatch('attribute', form);
    const selectedAttribute = attributes.find(a => a._id === selectedAttributeId);

    // Filter
    const filteredData = allValues.filter((item) => {
        const matchSearch =
            item.label?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.value?.toLowerCase().includes(searchText.toLowerCase());

        const attrId = typeof item.attribute === 'string' ? item.attribute : item.attribute?._id;
        const matchAttribute = filterAttributeId ? attrId === filterAttributeId : true;

        return matchSearch && matchAttribute;
    });

    const getAttributeName = (attr: string | IProductAttribute) => {
        if (typeof attr === 'object' && attr?.name) return attr.name;
        const found = attributes.find(a => a._id === attr);
        return found?.name || String(attr);
    };

    const getAttributeDisplayType = (attr: string | IProductAttribute) => {
        if (typeof attr === 'object' && attr?.displayType) return attr.displayType;
        const found = attributes.find(a => a._id === attr);
        return found?.displayType;
    };

    const handleOpenCreate = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (record: IProductAttributeValue) => {
        setEditingRecord(record);
        const attrId = typeof record.attribute === 'string' ? record.attribute : record.attribute?._id;
        form.setFieldsValue({
            value: record.value,
            label: record.label,
            attribute: attrId,
            colorHex: record.colorHex,
            imageUrl: record.imageUrl,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Clean up colorHex if it's a Color object
            if (values.colorHex && typeof values.colorHex === 'object') {
                values.colorHex = values.colorHex.toHexString();
            }

            if (editingRecord) {
                await updateMutation.mutateAsync({ id: editingRecord._id, data: values });
            } else {
                await createMutation.mutateAsync(values);
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingRecord(null);
        } catch {
            // validation errors handled by form
        }
    };

    const columns: ColumnsType<IProductAttributeValue> = [
        {
            title: 'Giá trị (Value)',
            dataIndex: 'value',
            key: 'value',
            render: (value: string, record) => {
                const displayType = getAttributeDisplayType(record.attribute);
                if (displayType === 'COLOR' && record.colorHex) {
                    return (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: record.colorHex }}
                            />
                            <span>{value}</span>
                        </div>
                    );
                }
                return <span className="font-medium">{value}</span>;
            },
        },
        {
            title: 'Nhãn hiển thị (Label)',
            dataIndex: 'label',
            key: 'label',
        },
        {
            title: 'Thuộc tính',
            dataIndex: 'attribute',
            key: 'attribute',
            render: (attr: string | IProductAttribute) => (
                <Tag color="blue">{getAttributeName(attr)}</Tag>
            ),
        },
        {
            title: 'Mã màu',
            dataIndex: 'colorHex',
            key: 'colorHex',
            render: (hex: string) =>
                hex ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border" style={{ backgroundColor: hex }} />
                        <span className="text-xs text-gray-500">{hex}</span>
                    </div>
                ) : (
                    <span className="text-gray-400">—</span>
                ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenEdit(record)}
                            className="text-blue-500"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa giá trị này?"
                        description="Hành động này không thể hoàn tác"
                        onConfirm={() => deleteMutation.mutate(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" icon={<DeleteOutlined />} danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Card className="shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold m-0">Quản lý giá trị thuộc tính</h2>
                        <p className="text-gray-500 text-sm m-0 mt-1">
                            Ví dụ: Đỏ, Xanh (cho Màu sắc) / 8GB, 16GB (cho RAM)...
                        </p>
                    </div>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
                        Thêm mới
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <Input
                        placeholder="Tìm kiếm giá trị..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full sm:w-64"
                        allowClear
                    />
                    <Select
                        placeholder="Lọc theo thuộc tính"
                        value={filterAttributeId || undefined}
                        onChange={(val) => setFilterAttributeId(val || '')}
                        className="w-full sm:w-64"
                        allowClear
                        options={[
                            ...attributes.map((attr) => ({
                                label: attr.name,
                                value: attr._id,
                            })),
                        ]}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} giá trị`,
                    }}
                    bordered
                    size="middle"
                />
            </Card>

            <Modal
                title={editingRecord ? 'Cập nhật giá trị thuộc tính' : 'Tạo giá trị thuộc tính mới'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingRecord(null);
                }}
                okText={editingRecord ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                destroyOnClose
                width={520}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="attribute"
                        label="Thuộc tính"
                        rules={[{ required: true, message: 'Vui lòng chọn thuộc tính' }]}
                    >
                        <Select
                            placeholder="Chọn thuộc tính"
                            showSearch
                            optionFilterProp="label"
                            options={attributes.map((attr) => ({
                                label: `${attr.name} (${attr.code})`,
                                value: attr._id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="value"
                        label="Giá trị (value)"
                        rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                        tooltip="Giá trị lưu trong hệ thống, ví dụ: red, 8gb"
                    >
                        <Input placeholder="Ví dụ: red, 8gb, i7-13700h..." />
                    </Form.Item>

                    <Form.Item
                        name="label"
                        label="Nhãn hiển thị (label)"
                        rules={[{ required: true, message: 'Vui lòng nhập nhãn hiển thị' }]}
                        tooltip="Hiển thị cho người dùng, ví dụ: Màu đỏ, RAM 8GB"
                    >
                        <Input placeholder="Ví dụ: Màu đỏ, RAM 8GB, Intel Core i7-13700H..." />
                    </Form.Item>

                    {selectedAttribute?.displayType === 'COLOR' && (
                        <Form.Item
                            name="colorHex"
                            label={
                                <span>
                                    <BgColorsOutlined className="mr-1" />
                                    Chọn màu sắc
                                </span>
                            }
                            rules={[{ required: true, message: 'Vui lòng chọn màu' }]}
                        >
                            <ColorPicker
                                format="hex"
                                showText
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

                    {selectedAttribute?.displayType === 'IMAGE' && (
                        <Form.Item
                            name="imageUrl"
                            label="URL hình ảnh"
                            rules={[
                                { required: true, message: 'Vui lòng nhập URL hình ảnh' },
                                { type: 'url', message: 'URL không hợp lệ' },
                            ]}
                        >
                            <Input placeholder="https://example.com/image.png" />
                        </Form.Item>
                    )}

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

                    {(selectedAttribute?.displayType === 'BUTTON' || selectedAttribute?.displayType === 'RADIO') && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
                            Kiểu hiển thị: <strong>{selectedAttribute.displayType === 'BUTTON' ? 'Nút bấm' : 'Radio'}</strong> — Chỉ cần nhập giá trị và nhãn hiển thị.
                        </div>
                    )}
                </Form>
            </Modal>
        </div>
    );
}
