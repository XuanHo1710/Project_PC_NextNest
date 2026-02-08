'use client';

import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, Card, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import {
    useProductAttributes,
    useCreateProductAttribute,
    useUpdateProductAttribute,
    useDeleteProductAttribute,
} from '@/hooks/admin';
import type { IProductAttribute } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const displayTypeOptions = [
    { label: 'Nút bấm (Button)', value: 'BUTTON' },
    { label: 'Màu sắc (Color)', value: 'COLOR' },
    { label: 'Hình ảnh (Image)', value: 'IMAGE' },
    { label: 'Radio', value: 'RADIO' },
];

const displayTypeColors: Record<string, string> = {
    BUTTON: 'blue',
    COLOR: 'magenta',
    IMAGE: 'green',
    RADIO: 'orange',
};

export default function ContentProductAttribute() {
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<IProductAttribute | null>(null);
    const [form] = Form.useForm();

    const { data: attributesResponse, isLoading } = useProductAttributes();
    const attributes = attributesResponse?.data ?? [];
    const createMutation = useCreateProductAttribute();
    const updateMutation = useUpdateProductAttribute();
    const deleteMutation = useDeleteProductAttribute();

    // Filter by search
    const filteredData = attributes.filter((item) =>
        item.name?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleOpenCreate = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (record: IProductAttribute) => {
        setEditingRecord(record);
        form.setFieldsValue({
            name: record.name,
            displayType: record.displayType,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
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

    const columns: ColumnsType<IProductAttribute> = [
        {
            title: 'Tên thuộc tính',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <span className="font-medium">{name}</span>,
        },
        {
            title: 'Mã thuộc tính',
            dataIndex: 'code',
            key: 'code',
            render: (code: string) => <Tag>{code}</Tag>,
        },
        {
            title: 'Kiểu hiển thị',
            dataIndex: 'displayType',
            key: 'displayType',
            render: (type: string) => (
                <Tag color={displayTypeColors[type] || 'default'}>
                    {displayTypeOptions.find(o => o.value === type)?.label || type}
                </Tag>
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
                            className="text-blue-500 hover:text-blue-700"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa thuộc tính này?"
                        description="Hành động này không thể hoàn tác"
                        onConfirm={() => deleteMutation.mutate(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                            />
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
                        <h2 className="text-xl font-bold m-0">Quản lý thuộc tính sản phẩm</h2>
                        <p className="text-gray-500 text-sm m-0 mt-1">
                            Ví dụ: Màu sắc, RAM, CPU, Kích thước màn hình...
                        </p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Input
                            placeholder="Tìm kiếm thuộc tính..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full sm:w-64"
                            allowClear
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleOpenCreate}
                        >
                            Thêm mới
                        </Button>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} thuộc tính`,
                    }}
                    bordered
                    size="middle"
                />
            </Card>

            <Modal
                title={editingRecord ? 'Cập nhật thuộc tính' : 'Tạo thuộc tính mới'}
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
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="name"
                        label="Tên thuộc tính"
                        rules={[{ required: true, message: 'Vui lòng nhập tên thuộc tính' }]}
                    >
                        <Input placeholder="Ví dụ: Màu sắc, RAM, CPU..." />
                    </Form.Item>

                    <Form.Item
                        name="displayType"
                        label="Kiểu hiển thị"
                        rules={[{ required: true, message: 'Vui lòng chọn kiểu hiển thị' }]}
                    >
                        <Select
                            placeholder="Chọn kiểu hiển thị"
                            options={displayTypeOptions}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
