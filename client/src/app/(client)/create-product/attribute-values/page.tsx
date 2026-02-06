'use client';

import React, { useState, useMemo } from 'react';
import {
    Card, Table, Button, Modal, Form, Input, Select, Tag,
    Space, Popconfirm, Empty, ColorPicker,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import {
    useClientProductAttributes,
    useClientProductAttributeValues,
} from '@/hooks/client/useProductManage';
import { productManageClientService } from '@/services/client/product-manage.client.service';
import type { IProductAttribute, IProductAttributeValue } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { clientProductKeys } from '@/hooks/client/useProductManage';

export default function AttributeValuesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<IProductAttributeValue | null>(null);
    const [filterAttribute, setFilterAttribute] = useState<string | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: attributes = [] } = useClientProductAttributes();
    const { data: allValues = [], isLoading } = useClientProductAttributeValues();

    const attributeList = attributes as IProductAttribute[];
    const valueList = allValues as IProductAttributeValue[];

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

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: { value: string; label: string; attribute: string; colorHex?: string; imageUrl?: string }) =>
            productManageClientService.createAttributeValue(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientProductKeys.attributeValues });
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
            title: 'Giá trị (value)',
            dataIndex: 'value',
            key: 'value',
            render: (value: string) => <span className="font-medium">{value}</span>,
        },
        {
            title: 'Nhãn hiển thị (label)',
            dataIndex: 'label',
            key: 'label',
        },
        {
            title: 'Màu',
            dataIndex: 'colorHex',
            key: 'colorHex',
            width: 80,
            render: (color: string) => color ? (
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-gray-400">{color}</span>
                </div>
            ) : <span className="text-gray-300">—</span>,
        },
    ];

    const handleCreate = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                value: values.value,
                label: values.label,
                attribute: values.attribute,
                colorHex: values.colorHex || '',
                imageUrl: values.imageUrl || '',
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
                                ...attributeList.map(a => ({ label: a.name, value: a._id })),
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
                            options={attributeList.map(a => ({
                                label: `${a.name} (${a.code})`,
                                value: a._id,
                            }))}
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

                    <Form.Item name="colorHex" label="Mã màu (nếu là thuộc tính màu)">
                        <Input placeholder="#FF0000" />
                    </Form.Item>

                    <Form.Item name="imageUrl" label="URL hình ảnh (nếu có)">
                        <Input placeholder="https://..." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
