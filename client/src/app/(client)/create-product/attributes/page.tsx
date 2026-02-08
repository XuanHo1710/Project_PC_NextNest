'use client';

import { useState } from 'react';
import {
    Card, Button, Modal, Form, Input, Select, Tag,
    Empty, Popconfirm, Spin, List, Badge,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import type { IProductAttribute } from '@/types';
import {
    useClientProductAttributes,
    useClientCreateProductAttribute,
    useClientUpdateProductAttribute,
    useClientDeleteProductAttribute,
} from '@/hooks/client/useProductManage';

const DISPLAY_TYPE_OPTIONS = [
    { label: '🎨 Màu sắc (Color)', value: 'COLOR' },
    { label: '🖼️ Hình ảnh (Image)', value: 'IMAGE' },
    { label: '🔘 Nút bấm (Button)', value: 'BUTTON' },
    { label: '⭕ Radio', value: 'RADIO' },
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

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
                            <TagsOutlined className="text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold m-0">Thuộc tính sản phẩm</h1>
                            <p className="text-blue-100 text-sm m-0 mt-0.5">
                                Quản lý các thuộc tính riêng của bạn
                                <Badge count={dataList.length} className="ml-2" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />
                            </p>
                        </div>
                    </div>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        size="large"
                        className="!bg-white !text-blue-600 !border-0 !font-medium !rounded-xl hover:!bg-blue-50 !shadow-sm"
                    >
                        Thêm thuộc tính
                    </Button>
                </div>
            </div>

            {/* Search */}
            <Input
                placeholder="Tìm kiếm thuộc tính theo tên hoặc mã..."
                prefix={<SearchOutlined className="text-gray-400" />}
                size="large"
                className="!rounded-xl !border-blue-200 focus:!border-blue-400"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
            />

            {/* List */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12"><Spin size="large" /></div>
                ) : filteredList.length === 0 ? (
                    <Empty
                        description={searchText ? 'Không tìm thấy thuộc tính phù hợp' : 'Chưa có thuộc tính nào. Hãy tạo thuộc tính đầu tiên!'}
                        className="py-12"
                    />
                ) : (
                    <List
                        dataSource={filteredList}
                        renderItem={(item, index) => {
                            const config = DISPLAY_TYPE_CONFIG[item.displayType] || DISPLAY_TYPE_CONFIG.BUTTON;
                            return (
                                <List.Item
                                    className="!px-5 hover:bg-blue-50/30 transition-colors"
                                    actions={[
                                        <Button
                                            key="edit"
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEdit(item)}
                                            className="!text-blue-500 hover:!text-blue-600 hover:!bg-blue-50"
                                        >
                                            Sửa
                                        </Button>,
                                        <Popconfirm
                                            key="delete"
                                            title="Xác nhận xóa thuộc tính này?"
                                            description="Các giá trị liên quan sẽ không còn sử dụng được."
                                            onConfirm={() => deleteMutation.mutate(item._id)}
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button type="text" danger icon={<DeleteOutlined />} className="hover:!bg-red-50">Xóa</Button>
                                        </Popconfirm>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg text-blue-500 font-bold text-sm">
                                                {index + 1}
                                            </div>
                                        }
                                        title={
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800">{item.name}</span>
                                                {item.code && (
                                                    <Tag className="!m-0 !bg-gray-100 !text-gray-500 !border-0 !rounded-md text-xs">{item.code}</Tag>
                                                )}
                                            </div>
                                        }
                                        description={
                                            <Tag color={config.color} className="!rounded-md !text-xs !mt-1">
                                                {config.label} ({item.displayType})
                                            </Tag>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                )}
            </Card>

            {/* Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-gray-800">
                        <TagsOutlined className="text-blue-500" />
                        {editingItem ? 'Sửa thuộc tính' : 'Thêm thuộc tính mới'}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); }}
                footer={null}
                destroyOnClose
                className="[&_.ant-modal-content]:!rounded-xl"
            >
                <Form form={form} layout="vertical" className="mt-4" onFinish={handleSubmit}>
                    <Form.Item
                        name="name"
                        label={<span className="font-medium text-gray-700">Tên thuộc tính</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input placeholder="Ví dụ: Màu sắc, RAM, Dung lượng..." size="large" className="!rounded-lg" />
                    </Form.Item>

                    <Form.Item
                        name="displayType"
                        label={<span className="font-medium text-gray-700">Kiểu hiển thị</span>}
                        rules={[{ required: true, message: 'Vui lòng chọn kiểu hiển thị' }]}
                    >
                        <Select placeholder="Chọn kiểu hiển thị" options={DISPLAY_TYPE_OPTIONS} size="large" className="!rounded-lg" />
                    </Form.Item>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button onClick={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); }} size="large" className="!rounded-lg">
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" size="large" loading={createMutation.isPending || updateMutation.isPending}
                            className="!rounded-lg !bg-blue-500 hover:!bg-blue-600 !shadow-sm">
                            {editingItem ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
