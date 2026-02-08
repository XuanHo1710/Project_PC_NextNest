'use client';

import React, { useCallback } from 'react';
import { Form, Input, Card, Button, message } from 'antd';
import {
    ShoppingOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import InfiniteSelect from '@/components/common/InfiniteSelect';
import RichTextEditor from '@/components/common/RichTextEditor';
import { productManageClientService } from '@/services/client/product-manage.client.service';

interface ProductInfoStepProps {
    form: any;
    onNext: () => void;
    onCategoryNameChange?: (name: string) => void;
    onBrandNameChange?: (name: string) => void;
}

export default function ProductInfoStep({
    form,
    onNext,
    onCategoryNameChange,
    onBrandNameChange,
}: ProductInfoStepProps) {

    const handleNext = async () => {
        try {
            await form.validateFields(['name', 'category']);
            onNext();
        } catch (error) {
            message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
    };

    // Fetch functions for InfiniteSelect
    const fetchCategories = useCallback(
        (params: { page: number; limit: number; keyword?: string }) =>
            productManageClientService.getCategories(params),
        [],
    );

    const fetchBrands = useCallback(
        (params: { page: number; limit: number; keyword?: string }) =>
            productManageClientService.getBrands(params),
        [],
    );

    const mapCategory = useCallback(
        (item: any) => ({ label: item.name, value: item._id, raw: item }),
        [],
    );

    const mapBrand = useCallback(
        (item: any) => ({ label: item.name, value: item._id, raw: item }),
        [],
    );

    return (
        <div className="space-y-6">
            <Card className="border shadow-sm">
                <h2 className="text-lg font-bold m-0 mb-1">Thông tin sản phẩm</h2>
                <p className="text-gray-500 text-sm m-0 mb-6">Nhập thông tin cơ bản về sản phẩm của bạn</p>

                <div>
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

                        {/* Mô tả — Rich Text Editor */}
                        <Form.Item
                            name="description"
                            label={
                                <span className="text-gray-700 font-medium">
                                    Mô tả chi tiết
                                    <span className="text-gray-400 font-normal ml-2 text-xs">
                                        (Hỗ trợ copy &amp; paste từ trang web khác giữ nguyên định dạng)
                                    </span>
                                </span>
                            }
                        >
                            <RichTextEditor
                                placeholder="Mô tả chi tiết về sản phẩm, tính năng nổi bật, thông số kỹ thuật... Bạn có thể copy nội dung từ web khác và dán vào đây."
                                minHeight={180}
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
                                <InfiniteSelect
                                    fetchFn={fetchCategories}
                                    mapOption={mapCategory}
                                    queryKeyPrefix="category-select"
                                    placeholder="Tìm kiếm danh mục sản phẩm..."
                                    size="large"
                                    className="rounded-lg"
                                    pageSize={20}
                                    emptyText="Không tìm thấy danh mục"
                                    onSelect={(_value: string, option: any) => {
                                        onCategoryNameChange?.(option?.raw?.name || option?.label || '');
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="brand"
                                label={<span className="text-gray-700 font-medium">Thương hiệu</span>}
                            >
                                <InfiniteSelect
                                    fetchFn={fetchBrands}
                                    mapOption={mapBrand}
                                    queryKeyPrefix="brand-select"
                                    placeholder="Tìm kiếm thương hiệu..."
                                    size="large"
                                    allowClear
                                    className="rounded-lg"
                                    pageSize={20}
                                    emptyText="Không tìm thấy thương hiệu"
                                    onSelect={(_value: string, option: any) => {
                                        onBrandNameChange?.(option?.raw?.name || option?.label || '');
                                    }}
                                    onClear={() => {
                                        onBrandNameChange?.('');
                                    }}
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
                >
                    Tiếp theo: Chọn thuộc tính
                </Button>
            </div>
        </div>
    );
}
