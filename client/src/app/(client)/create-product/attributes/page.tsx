'use client';

import { useState } from 'react';
import {
    Button, Modal, Form, Input, Select, Tag, Table, Popconfirm, Space,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
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
    { label: 'Màu sắc (Color)', value: 'COLOR' },
    { label: 'Hình ảnh (Image)', value: 'IMAGE' },
    { label: 'Nút bấm (Button)', value: 'BUTTON' },
    { label: 'Radio', value: 'RADIO' },
];

const DISPLAY_TYPE_CONFIG: Record<string, { color: string; label: string }> = {
    BUTTON: { color: 'blue', label: 'Nút bấm' },
    COLOR: { color: 'magenta', label: 'Màu sắc' },
    IMAGE: { color: 'green', label: 'Hình ảnh' },
    RADIO: { color: 'orange', label: 'Radio' },
};

export default function AttributesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<IProductAttribute | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const { data: attributes, isLoading } = useClientProductAttributes();
    const createMutation = useClientCreateProductAttribute();
    const updateMutation = useClientUpdateProductAttribute();
    const deleteMutation = useClientDeleteProductAttribute();

    const dataList = attributes?.data ?? [];

    const filteredList = searchText
        ? dataList.filter(
            (a) =>
                a.name.toLowerCase().includes(searchText.toLowerCase()) ||
                (a.code || '').toLowerCase().includes(searchText.toLowerCase()),
        )
        : dataList;

    const handleEdit = (item: IProductAttribute) => {
        setEditingItem(item);
        form.setFieldsValue({ name: item.name, displayType: item.displayType });
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
        } catch { /* validation failed */ }
    };

    const columns: ColumnsType<IProductAttribute> = [
        {
            title: '#',
            key: 'index',
            width: 60,
            render: (_, __, idx) => <span className="text-gray-500">{idx + 1}</span>,
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
            render: (code: string) => code ? <Tag>{code}</Tag> : '—',
        },
        {
            title: 'Kiểu hiển thị',
            dataIndex: 'displayType',
            key: 'displayType',
            width: 150,
            render: (type: string) => {
                const config = DISPLAY_TYPE_CONFIG[type] || DISPLAY_TYPE_CONFIG.BUTTON;
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa thuộc tính này?"
                        description="Các giá trị liên quan sẽ không còn sử dụng được."
                        onConfirm={() => deleteMutation.mutate(record._id)}
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold m-0">Thuộc tính sản phẩm</h1>
                    <p className="text-gray-500 text-sm m-0 mt-1">
                        Quản lý các thuộc tính riêng của bạn ({dataList.length} thuộc tính)
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Thêm thuộc tính
                </Button>
            </div>

            {/* Search */}
            <Input
                placeholder="Tìm kiếm theo tên hoặc mã..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ maxWidth: 400 }}
            />

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredList}
                rowKey="_id"
                loading={isLoading}
                pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} thuộc tính`,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                bordered
                size="middle"
            />

            {/* Modal */}
            <Modal
                title={editingItem ? 'Sửa thuộc tính' : 'Thêm thuộc tính mới'}
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); }}
                onOk={handleSubmit}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                okText={editingItem ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                destroyOnHidden
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
                        <Select placeholder="Chọn kiểu hiển thị" options={DISPLAY_TYPE_OPTIONS} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
