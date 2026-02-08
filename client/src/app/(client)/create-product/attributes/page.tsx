'use client';

import { useState } from 'react';
import {
    Card, Table, Button, Modal, Form, Input, Select, Tag,
    Space, Popconfirm, Empty,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined,
} from '@ant-design/icons';

import type { IProductAttribute } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import {
    useClientProductAttributes,
    useClientCreateProductAttribute,
    useClientUpdateProductAttribute,
    useClientDeleteProductAttribute,
} from '@/hooks/client/useProductManage';

const DISPLAY_TYPE_OPTIONS = [
    { label: 'Nút bấm (Button)', value: 'BUTTON' },
    { label: 'Màu sắc (Color)', value: 'COLOR' },
    { label: 'Hình ảnh (Image)', value: 'IMAGE' },
    { label: 'Radio', value: 'RADIO' },
];

const DISPLAY_TYPE_COLORS: Record<string, string> = {
    BUTTON: 'blue',
    COLOR: 'magenta',
    IMAGE: 'green',
    RADIO: 'orange',
};

export default function AttributesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<IProductAttribute | null>(null);
    const [form] = Form.useForm();

    const { data: attributes, isLoading } = useClientProductAttributes();
    const createMutation = useClientCreateProductAttribute();
    const updateMutation = useClientUpdateProductAttribute();
    const deleteMutation = useClientDeleteProductAttribute();

    const columns: ColumnsType<IProductAttribute> = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_, __, idx) => idx + 1,
        },
        {
            title: 'Tên thuộc tính',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <span className="font-medium">{name}</span>,
        },
        {
            title: 'Mã (code)',
            dataIndex: 'code',
            key: 'code',
            render: (code: string) => <Tag>{code || '—'}</Tag>,
        },
        {
            title: 'Kiểu hiển thị',
            dataIndex: 'displayType',
            key: 'displayType',
            render: (type: string) => (
                <Tag color={DISPLAY_TYPE_COLORS[type] || 'default'}>{type}</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="small"
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa thuộc tính này?"
                        onConfirm={() => deleteMutation.mutate(record._id)}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} size="small">
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleEdit = (item: IProductAttribute) => {
        setEditingItem(item);
        form.setFieldsValue({
            name: item.name,
            displayType: item.displayType,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                await updateMutation.mutateAsync({ id: editingItem._id, data: values });
            } else {
                await createMutation.mutateAsync(values);
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingItem(null);
        } catch {
            // validation failed
        }
    };

    const dataList = attributes?.data ?? [];

    return (
        <>
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <TagsOutlined />
                        <span>Thuộc tính sản phẩm</span>
                        <Tag color="blue">{dataList.length}</Tag>
                    </div>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Thêm thuộc tính
                    </Button>
                }
                className="shadow-sm"
            >
                {dataList.length === 0 && !isLoading ? (
                    <Empty description="Chưa có thuộc tính nào" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={dataList}
                        rowKey="_id"
                        loading={isLoading}
                        pagination={dataList.length > 10 ? { pageSize: 10 } : false}
                        size="middle"
                    />
                )}
            </Card>

            <Modal
                title={editingItem ? 'Sửa thuộc tính' : 'Thêm thuộc tính mới'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    form.resetFields();
                }}
                okText={editingItem ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="name"
                        label="Tên thuộc tính"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input placeholder="Ví dụ: Màu sắc, RAM, Dung lượng..." />
                    </Form.Item>

                    <Form.Item
                        name="displayType"
                        label="Kiểu hiển thị"
                        rules={[{ required: true, message: 'Vui lòng chọn kiểu hiển thị' }]}
                    >
                        <Select placeholder="Chọn kiểu" options={DISPLAY_TYPE_OPTIONS} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
