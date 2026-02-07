'use client';

import React from 'react';
import { Form, Input, Select, Card, Button, Upload, message } from 'antd';
import {
    ShoppingOutlined,
    PictureOutlined,
    CloudUploadOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd';

interface ProductInfoStepProps {
    form: any;
    categories: { _id: string; name: string }[];
    brands: { _id: string; name: string }[];
    onNext: () => void;
}

export default function ProductInfoStep({
    form,
    categories,
    brands,
    onNext
}: ProductInfoStepProps) {

    const handleNext = async () => {
        try {
            await form.validateFields(['name', 'category']);
            onNext();
        } catch (error) {
            message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card
                className="shadow-lg border-0 overflow-hidden"
                styles={{ body: { padding: 0 } }}
            >
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                            <ShoppingOutlined className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold m-0">Thông tin sản phẩm</h2>
                            <p className="text-white/80 m-0 text-sm mt-1">
                                Nhập thông tin cơ bản về sản phẩm của bạn
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <Form form={form} layout="vertical" requiredMark="optional">
                        {/* Tên sản phẩm */}
                        <Form.Item
                            name="name"
                            label={
                                <span className="text-gray-700 font-medium">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên sản phẩm' },
                                { min: 5, message: 'Tên sản phẩm phải có ít nhất 5 ký tự' },
                                { max: 200, message: 'Tên sản phẩm không được quá 200 ký tự' }
                            ]}
                        >
                            <Input
                                placeholder="Ví dụ: Laptop ASUS ROG Strix G16 RTX 4090"
                                size="large"
                                className="rounded-lg"
                                maxLength={200}
                                showCount
                            />
                        </Form.Item>

                        {/* Mô tả */}
                        <Form.Item
                            name="description"
                            label={<span className="text-gray-700 font-medium">Mô tả chi tiết</span>}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Mô tả chi tiết về sản phẩm, tính năng nổi bật, thông số kỹ thuật..."
                                className="rounded-lg"
                                maxLength={2000}
                                showCount
                            />
                        </Form.Item>

                        {/* Danh mục và Thương hiệu */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                name="category"
                                label={
                                    <span className="text-gray-700 font-medium">
                                        Danh mục <span className="text-red-500">*</span>
                                    </span>
                                }
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                            >
                                <Select
                                    placeholder="Chọn danh mục sản phẩm"
                                    showSearch
                                    optionFilterProp="label"
                                    size="large"
                                    className="rounded-lg"
                                    options={categories.map(c => ({
                                        label: c.name,
                                        value: c._id,
                                    }))}
                                />
                            </Form.Item>

                            <Form.Item
                                name="brand"
                                label={<span className="text-gray-700 font-medium">Thương hiệu</span>}
                            >
                                <Select
                                    placeholder="Chọn thương hiệu (tùy chọn)"
                                    showSearch
                                    optionFilterProp="label"
                                    size="large"
                                    allowClear
                                    className="rounded-lg"
                                    options={brands.map(b => ({
                                        label: b.name,
                                        value: b._id,
                                    }))}
                                />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </Card>

            {/* Navigation */}
            <div className="flex justify-end">
                <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    onClick={handleNext}
                    className="h-12 px-8 rounded-lg font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                >
                    Tiếp theo: Chọn thuộc tính
                </Button>
            </div>
        </div>
    );
}
