'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    Card, Button, Modal, Form, Input, Tag, Empty,
    ColorPicker, Spin, List, Badge,
} from 'antd';
import {
    PlusOutlined, AppstoreOutlined, SearchOutlined,
} from '@ant-design/icons';
import InfiniteSelect from '@/components/common/InfiniteSelect';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';
import {
    useClientAttributeValuesMap,
    useClientProductAttributes,
} from '@/hooks/client/useProductManage';
import { productManageClientService } from '@/services/client/product-manage.client.service';
import type { IProductAttribute, IProductAttributeValue } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { clientProductKeys } from '@/hooks/client/useProductManage';

export default function AttributeValuesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterAttribute, setFilterAttribute] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: attributes } = useClientProductAttributes();
    const { allValues = [], isLoading } = useClientAttributeValuesMap(filterAttribute ? [filterAttribute] : []);

    const attributeList = attributes?.data ?? [];
    const valueList = allValues as IProductAttributeValue[];

    const selectedAttributeId = Form.useWatch('attribute', form);
    const selectedAttribute = attributeList.find(a => a._id === selectedAttributeId);

    // Filter + search
    const filteredValues = useMemo(() => {
        let result = valueList;
        if (filterAttribute) {
            result = result.filter((v) => {
                const attrId = typeof v.attribute === 'string' ? v.attribute : v.attribute?._id;
                return attrId === filterAttribute;
            });
        }
        if (searchText) {
            const lower = searchText.toLowerCase();
            result = result.filter(
                (v) =>
                    v.value.toLowerCase().includes(lower) ||
                    v.label.toLowerCase().includes(lower),
            );
        }
        return result;
    }, [valueList, filterAttribute, searchText]);

    const getAttributeName = (attr: string | IProductAttribute) => {
        if (typeof attr === 'string') {
            return attributeList.find(a => a._id === attr)?.name || attr;
        }
        return attr?.name || '';
    };

    const getAttributeDisplayType = (attr: string | IProductAttribute) => {
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
            label: (
                <div className="flex items-center justify-between w-full">
                    <span>{item.name} ({item.code})</span>
                    <Tag color={
                        item.displayType === 'COLOR' ? 'magenta' :
                            item.displayType === 'IMAGE' ? 'green' :
                                item.displayType === 'BUTTON' ? 'blue' : 'orange'
                    } className="text-xs !rounded-md">
                        {item.displayType}
                    </Tag>
                </div>
            ),
            value: item._id,
            raw: item,
        }),
        [],
    );

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

    const renderValuePreview = (record: IProductAttributeValue) => {
        const displayType = getAttributeDisplayType(record.attribute);
        if (displayType === 'COLOR' && record.colorHex) {
            return (
                <div
                    className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm shrink-0"
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
                    className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                />
            );
        }
        if (displayType === 'BUTTON') {
            return (
                <div className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium border border-blue-200 shrink-0">
                    {record.label}
                </div>
            );
        }
        return <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />;
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
                            <AppstoreOutlined className="text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold m-0">Giá trị thuộc tính</h1>
                            <p className="text-purple-100 text-sm m-0 mt-0.5">
                                Quản lý giá trị cho từng thuộc tính
                                <Badge count={filteredValues.length} className="ml-2" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />
                            </p>
                        </div>
                    </div>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        size="large"
                        className="!bg-white !text-purple-600 !border-0 !font-medium !rounded-xl hover:!bg-purple-50 !shadow-sm"
                    >
                        Thêm giá trị
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Input
                    placeholder="Tìm kiếm giá trị theo tên..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    size="large"
                    className="!rounded-xl !border-blue-200 flex-1"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />
                <InfiniteSelect
                    fetchFn={fetchAttributes}
                    mapOption={mapAttribute}
                    queryKeyPrefix="filterAttrSelect"
                    pageSize={15}
                    placeholder="Lọc theo thuộc tính..."
                    size="large"
                    allowClear
                    className="!rounded-xl sm:!w-[280px]"
                    value={filterAttribute}
                    onChange={(val: any) => setFilterAttribute(val || null)}
                />
            </div>

            {/* List */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12"><Spin size="large" /></div>
                ) : filteredValues.length === 0 ? (
                    <Empty
                        description={searchText || filterAttribute ? 'Không tìm thấy giá trị phù hợp' : 'Chưa có giá trị nào. Hãy thêm giá trị đầu tiên!'}
                        className="py-12"
                    />
                ) : (
                    <List
                        dataSource={filteredValues}
                        renderItem={(item, index) => (
                            <List.Item className="!px-5 hover:bg-purple-50/20 transition-colors">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="w-8 h-8 flex items-center justify-center bg-purple-50 rounded-lg text-purple-500 font-bold text-xs shrink-0">
                                        {index + 1}
                                    </div>
                                    {renderValuePreview(item)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-gray-800">{item.label}</span>
                                            <Tag className="!m-0 !bg-gray-100 !text-gray-500 !border-0 !rounded-md text-xs">{item.value}</Tag>
                                        </div>
                                        <Tag color="blue" className="!mt-1 !rounded-md text-xs">{getAttributeName(item.attribute)}</Tag>
                                    </div>
                                    {item.colorHex && (
                                        <Tag className="!m-0 !rounded-md text-xs !bg-gray-50">{item.colorHex}</Tag>
                                    )}
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </Card>

            {/* Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-gray-800">
                        <AppstoreOutlined className="text-purple-500" />
                        Thêm giá trị thuộc tính mới
                    </div>
                }
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
                footer={null}
                destroyOnClose
                className="[&_.ant-modal-content]:!rounded-xl"
                width={520}
            >
                <Form form={form} layout="vertical" className="mt-4" onFinish={handleSubmit}>
                    <Form.Item
                        name="attribute"
                        label={<span className="font-medium text-gray-700">Thuộc tính <span className="text-red-500">*</span></span>}
                        rules={[{ required: true, message: 'Vui lòng chọn thuộc tính' }]}
                    >
                        <InfiniteSelect
                            fetchFn={fetchAttributes}
                            mapOption={mapAttribute}
                            queryKeyPrefix="attrModalSelect"
                            pageSize={15}
                            placeholder="Tìm kiếm thuộc tính..."
                            size="large"
                            className="!rounded-lg"
                        />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="value"
                            label={<span className="font-medium text-gray-700">Giá trị (value) <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                        >
                            <Input placeholder="Ví dụ: red, 8gb, s..." size="large" className="!rounded-lg" />
                        </Form.Item>

                        <Form.Item
                            name="label"
                            label={<span className="font-medium text-gray-700">Nhãn hiển thị (label) <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, message: 'Vui lòng nhập nhãn' }]}
                        >
                            <Input placeholder="Ví dụ: Đỏ, Xanh dương, Size S..." size="large" className="!rounded-lg" />
                        </Form.Item>
                    </div>

                    {/* COLOR: Color picker */}
                    {selectedAttribute?.displayType === 'COLOR' && (
                        <Form.Item
                            name="colorHex"
                            label={<span className="font-medium text-gray-700">Chọn màu sắc <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, message: 'Vui lòng chọn màu' }]}
                        >
                            <ColorPicker
                                showText
                                format="hex"
                                size="large"
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
                            label={<span className="font-medium text-gray-700">Hình ảnh <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, message: 'Vui lòng tải ảnh lên' }]}
                            getValueFromEvent={(urls: string[]) => urls?.[0] || ''}
                            getValueProps={(value: string) => ({ value: value ? [value] : [] })}
                        >
                            <CloudinaryUpload single maxCount={1} placeholder="Tải ảnh" />
                        </Form.Item>
                    )}

                    {/* BUTTON/RADIO: Info */}
                    {(selectedAttribute?.displayType === 'BUTTON' || selectedAttribute?.displayType === 'RADIO') && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700 mb-4">
                            Kiểu hiển thị: <strong>{selectedAttribute.displayType === 'BUTTON' ? 'Nút bấm' : 'Radio'}</strong> — Chỉ cần nhập giá trị và nhãn hiển thị.
                        </div>
                    )}

                    {/* Submit inside form */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }} size="large" className="!rounded-lg">
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" size="large" loading={createMutation.isPending}
                            className="!rounded-lg !bg-purple-500 hover:!bg-purple-600 !shadow-sm">
                            Tạo mới
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
