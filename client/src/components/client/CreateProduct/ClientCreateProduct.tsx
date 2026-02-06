'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    Card, Button, Form, Input, Select, InputNumber, Table, Tag,
    Space, Divider, Alert, Badge, Tooltip, Steps, Empty, Switch, message, Result,
} from 'antd';
import {
    PlusOutlined, ThunderboltOutlined, ShoppingOutlined,
    TagsOutlined, AppstoreOutlined, ArrowLeftOutlined,
    DeleteOutlined, CheckCircleOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import {
    useClientProductAttributes,
    useClientProductAttributeValues,
    useClientCreateProduct,
    useClientCategories,
} from '@/hooks/client/useProductManage';
import { productManageClientService } from '@/services/client/product-manage.client.service';
import type { IProductAttribute, IProductAttributeValue } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProviderClient';

// ============= TYPES =============
interface VariantRow {
    key: string;
    combination: Record<string, string>;
    combinationIds: Record<string, string>;
    sku: string;
    price: number;
    discount: number;
    enabled: boolean;
}

// ============= MAIN COMPONENT =============
export default function ClientCreateProduct() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);

    // State for selected attributes & values
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
    const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});

    // Generated variants
    const [variants, setVariants] = useState<VariantRow[]>([]);
    const [variantsGenerated, setVariantsGenerated] = useState(false);

    // Batch pricing
    const [batchPrice, setBatchPrice] = useState<number>(0);
    const [batchDiscount, setBatchDiscount] = useState<number>(0);

    // Queries (client-side)
    const { data: attributes = [] } = useClientProductAttributes();
    const { data: attributeValues = [] } = useClientProductAttributeValues();
    const { data: categories = [] } = useClientCategories();
    const createProductMutation = useClientCreateProduct();

    // Saving state
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // ============= COMPUTED =============
    const attributeList = attributes as IProductAttribute[];
    const valueList = attributeValues as IProductAttributeValue[];

    const getValuesForAttribute = useCallback((attributeId: string) => {
        return valueList.filter((v) => {
            const attrId = typeof v.attribute === 'string' ? v.attribute : v.attribute?._id;
            return attrId === attributeId;
        });
    }, [valueList]);

    const getAttributeById = useCallback((id: string) => {
        return attributeList.find(a => a._id === id);
    }, [attributeList]);

    const getValueById = useCallback((id: string) => {
        return valueList.find(v => v._id === id);
    }, [valueList]);

    // ============= VARIANT GENERATION =============
    const generateVariants = useCallback(() => {
        const attributeArrays: { attributeId: string; code: string; values: IProductAttributeValue[] }[] = [];

        for (const attrId of selectedAttributes) {
            const attr = getAttributeById(attrId);
            const valIds = selectedValues[attrId] || [];
            if (valIds.length === 0) continue;

            const vals = valIds.map(id => getValueById(id)).filter(Boolean) as IProductAttributeValue[];
            if (vals.length > 0 && attr) {
                attributeArrays.push({
                    attributeId: attrId,
                    code: attr.code,
                    values: vals,
                });
            }
        }

        if (attributeArrays.length === 0) {
            message.warning('Vui lòng chọn ít nhất 1 thuộc tính và giá trị');
            return;
        }

        // Cartesian product
        const cartesian = (arrays: IProductAttributeValue[][]): IProductAttributeValue[][] => {
            if (arrays.length === 0) return [[]];
            const [first, ...rest] = arrays;
            const restCombinations = cartesian(rest);
            return first.flatMap(val => restCombinations.map(combo => [val, ...combo]));
        };

        const allCombinations = cartesian(attributeArrays.map(a => a.values));

        const newVariants: VariantRow[] = allCombinations.map((combo, idx) => {
            const combination: Record<string, string> = {};
            const combinationIds: Record<string, string> = {};

            combo.forEach((val, i) => {
                const attr = attributeArrays[i];
                combination[attr.code] = val.label;
                combinationIds[attr.code] = val._id;
            });

            const skuParts = combo.map(v => v.value.toUpperCase().replace(/\s+/g, ''));
            const sku = `SKU-${skuParts.join('-')}-${String(idx + 1).padStart(3, '0')}`;

            return {
                key: `variant-${idx}`,
                combination,
                combinationIds,
                sku,
                price: batchPrice || 0,
                discount: batchDiscount || 0,
                enabled: true,
            };
        });

        setVariants(newVariants);
        setVariantsGenerated(true);
        message.success(`Đã sinh ${newVariants.length} biến thể sản phẩm!`);
    }, [selectedAttributes, selectedValues, getAttributeById, getValueById, batchPrice, batchDiscount]);

    // Total variants count preview
    const totalVariantsPreview = useMemo(() => {
        let total = 1;
        let hasAny = false;
        for (const attrId of selectedAttributes) {
            const count = (selectedValues[attrId] || []).length;
            if (count > 0) {
                total *= count;
                hasAny = true;
            }
        }
        return hasAny ? total : 0;
    }, [selectedAttributes, selectedValues]);

    // ============= VARIANT TABLE COLUMNS =============
    const variantColumns: ColumnsType<VariantRow> = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_, __, idx) => <span className="text-gray-500">{idx + 1}</span>,
        },
        ...selectedAttributes.map(attrId => {
            const attr = getAttributeById(attrId);
            return {
                title: attr?.name || attrId,
                key: attr?.code || attrId,
                render: (_: unknown, record: VariantRow) => {
                    const label = record.combination[attr?.code || ''];
                    return <Tag color="blue">{label}</Tag>;
                },
            };
        }),
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 200,
            render: (sku: string, _record: VariantRow, idx: number) => (
                <Input
                    value={sku}
                    onChange={(e) => {
                        const updated = [...variants];
                        updated[idx] = { ...updated[idx], sku: e.target.value };
                        setVariants(updated);
                    }}
                    size="small"
                />
            ),
        },
        {
            title: 'Giá (VND)',
            dataIndex: 'price',
            key: 'price',
            width: 160,
            render: (price: number, _record: VariantRow, idx: number) => (
                <InputNumber
                    value={price}
                    onChange={(val) => {
                        const updated = [...variants];
                        updated[idx] = { ...updated[idx], price: val || 0 };
                        setVariants(updated);
                    }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                    min={0}
                    className="w-full"
                    size="small"
                />
            ),
        },
        {
            title: 'Giảm giá (%)',
            dataIndex: 'discount',
            key: 'discount',
            width: 110,
            render: (discount: number, _record: VariantRow, idx: number) => (
                <InputNumber
                    value={discount}
                    onChange={(val) => {
                        const updated = [...variants];
                        updated[idx] = { ...updated[idx], discount: val || 0 };
                        setVariants(updated);
                    }}
                    min={0}
                    max={100}
                    addonAfter="%"
                    size="small"
                />
            ),
        },
        {
            title: 'Bật/Tắt',
            key: 'enabled',
            width: 80,
            render: (_: unknown, record: VariantRow, idx: number) => (
                <Switch
                    checked={record.enabled}
                    onChange={(checked) => {
                        const updated = [...variants];
                        updated[idx] = { ...updated[idx], enabled: checked };
                        setVariants(updated);
                    }}
                    size="small"
                />
            ),
        },
        {
            title: '',
            key: 'delete',
            width: 50,
            render: (_: unknown, __: VariantRow, idx: number) => (
                <Tooltip title="Xóa biến thể">
                    <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            const updated = variants.filter((_, i) => i !== idx);
                            setVariants(updated);
                        }}
                    />
                </Tooltip>
            ),
        },
    ];

    // ============= HANDLERS =============
    const handleAttributeChange = (attrIds: string[]) => {
        setSelectedAttributes(attrIds);
        const cleanedValues = { ...selectedValues };
        Object.keys(cleanedValues).forEach(key => {
            if (!attrIds.includes(key)) {
                delete cleanedValues[key];
            }
        });
        setSelectedValues(cleanedValues);
        setVariantsGenerated(false);
    };

    const handleValueChange = (attributeId: string, valueIds: string[]) => {
        setSelectedValues(prev => ({ ...prev, [attributeId]: valueIds }));
        setVariantsGenerated(false);
    };

    const applyBatchPrice = () => {
        if (batchPrice <= 0) return;
        setVariants(prev => prev.map(v => ({ ...v, price: batchPrice })));
        message.success(`Đã áp dụng giá ${batchPrice.toLocaleString()} VND cho tất cả biến thể`);
    };

    const applyBatchDiscount = () => {
        setVariants(prev => prev.map(v => ({ ...v, discount: batchDiscount })));
        message.success(`Đã áp dụng giảm giá ${batchDiscount}% cho tất cả biến thể`);
    };

    // ============= SUBMIT =============
    const handleSubmit = async () => {
        try {
            const productValues = await form.validateFields();
            const enabledVariants = variants.filter(v => v.enabled);

            if (enabledVariants.length === 0) {
                message.error('Cần có ít nhất 1 biến thể được bật');
                return;
            }

            setIsSaving(true);

            // 1. Create product
            const prices = enabledVariants.map(v => v.price * (1 - v.discount / 100));
            const productData = {
                name: productValues.name,
                description: productValues.description,
                category: productValues.category,
                status: 'ACTIVE' as const,
                minPrice: Math.min(...prices),
                maxPrice: Math.max(...prices),
            };

            const productResult = await createProductMutation.mutateAsync(productData);
            const productId = (productResult as { data: { _id: string } }).data?._id;

            if (!productId) {
                throw new Error('Không thể tạo sản phẩm');
            }

            // 2. Create product attribute allow values
            const allValueIds = Object.values(selectedValues).flat();
            if (allValueIds.length > 0) {
                await productManageClientService.bulkCreateAllowValues(productId, allValueIds);
            }

            // 3. Create variants
            for (const variant of enabledVariants) {
                await productManageClientService.createVariant({
                    sku: variant.sku,
                    product: productId,
                    price: variant.price,
                    discount: variant.discount,
                    combination: variant.combinationIds,
                    images: [],
                });
            }

            setIsSuccess(true);
            toast.success(`Tạo sản phẩm thành công với ${enabledVariants.length} biến thể!`);
        } catch (err) {
            console.error('Error creating product:', err);
            toast.error('Tạo sản phẩm thất bại!');
        } finally {
            setIsSaving(false);
        }
    };

    // ============= AUTH CHECK =============
    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4">
                <Result
                    status="403"
                    title="Bạn cần đăng nhập"
                    subTitle="Vui lòng đăng nhập để tạo sản phẩm bán hàng."
                    extra={
                        <Button type="primary" onClick={() => router.push('/auth/login')}>
                            Đăng nhập ngay
                        </Button>
                    }
                />
            </div>
        );
    }

    // ============= SUCCESS STATE =============
    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4">
                <Result
                    status="success"
                    title="Tạo sản phẩm thành công!"
                    subTitle="Sản phẩm của bạn đã được tạo và đang chờ duyệt."
                    extra={[
                        <Button
                            type="primary"
                            key="create-more"
                            onClick={() => {
                                setIsSuccess(false);
                                setCurrentStep(0);
                                setVariants([]);
                                setVariantsGenerated(false);
                                setSelectedAttributes([]);
                                setSelectedValues({});
                                form.resetFields();
                            }}
                        >
                            Tạo sản phẩm khác
                        </Button>,
                        <Button key="home" onClick={() => router.push('/')}>
                            Về trang chủ
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    // ============= STEPS =============
    const steps = [
        { title: 'Thông tin SP', icon: <ShoppingOutlined /> },
        { title: 'Chọn thuộc tính', icon: <TagsOutlined /> },
        { title: 'Sinh biến thể', icon: <AppstoreOutlined /> },
    ];

    // ============= RENDER =============
    return (
        <div className="p-4 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                >
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-2xl font-bold m-0">Đăng bán sản phẩm</h1>
                    <p className="text-gray-500 text-sm m-0">
                        Xin chào <strong>{user?.fullname || user?.email}</strong>, hãy tạo sản phẩm với nhiều biến thể tự động
                    </p>
                </div>
            </div>

            {/* Steps */}
            <Card className="shadow-sm mb-6">
                <Steps
                    current={currentStep}
                    items={steps}
                    className="mb-0"
                    onChange={(step) => {
                        if (step === 0 || (step === 1 && currentStep >= 0) || (step === 2 && totalVariantsPreview > 0)) {
                            setCurrentStep(step);
                        }
                    }}
                />
            </Card>

            {/* Step 1: Product Info */}
            {currentStep === 0 && (
                <Card title="Thông tin sản phẩm" className="shadow-sm mb-6">
                    <Form form={form} layout="vertical" className="max-w-2xl">
                        <Form.Item
                            name="name"
                            label="Tên sản phẩm"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                        >
                            <Input placeholder="Ví dụ: Laptop ASUS ROG Strix G16" size="large" />
                        </Form.Item>

                        <Form.Item name="description" label="Mô tả">
                            <Input.TextArea rows={4} placeholder="Mô tả chi tiết sản phẩm..." />
                        </Form.Item>

                        <Form.Item
                            name="category"
                            label="Danh mục"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                showSearch
                                optionFilterProp="label"
                                size="large"
                                options={categories.map((c: { _id: string; name: string }) => ({
                                    label: c.name,
                                    value: c._id,
                                }))}
                            />
                        </Form.Item>

                        <div className="flex justify-end mt-4">
                            <Button type="primary" size="large" onClick={() => {
                                form.validateFields(['name', 'category']).then(() => {
                                    setCurrentStep(1);
                                });
                            }}>
                                Tiếp theo: Chọn thuộc tính
                            </Button>
                        </div>
                    </Form>
                </Card>
            )}

            {/* Step 2: Select Attributes & Values */}
            {currentStep === 1 && (
                <Card className="shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold m-0">Chọn thuộc tính & giá trị</h3>
                        {totalVariantsPreview > 0 && (
                            <Badge count={totalVariantsPreview} overflowCount={9999}>
                                <Tag color="blue" className="text-sm py-1 px-3">
                                    Dự kiến: {totalVariantsPreview} biến thể
                                </Tag>
                            </Badge>
                        )}
                    </div>

                    <Alert
                        message="Hướng dẫn"
                        description="Chọn các thuộc tính (ví dụ: Màu sắc, RAM) rồi chọn các giá trị cụ thể. Hệ thống sẽ tự động sinh tổ hợp biến thể cho sản phẩm."
                        type="info"
                        showIcon
                        icon={<InfoCircleOutlined />}
                        className="mb-6"
                    />

                    {/* Select Attributes */}
                    <Form.Item label="Chọn thuộc tính sản phẩm">
                        <Select
                            mode="multiple"
                            placeholder="Tìm và chọn thuộc tính..."
                            value={selectedAttributes}
                            onChange={handleAttributeChange}
                            showSearch
                            optionFilterProp="label"
                            className="w-full"
                            size="large"
                            options={attributeList.map(attr => ({
                                label: `${attr.name} (${attr.code})`,
                                value: attr._id,
                            }))}
                        />
                    </Form.Item>

                    <Divider />

                    {selectedAttributes.length === 0 ? (
                        <Empty description="Chưa chọn thuộc tính nào" className="py-8" />
                    ) : (
                        <div className="space-y-6">
                            {selectedAttributes.map(attrId => {
                                const attr = getAttributeById(attrId);
                                const availableValues = getValuesForAttribute(attrId);
                                const selectedValIds = selectedValues[attrId] || [];

                                return (
                                    <Card
                                        key={attrId}
                                        size="small"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <TagsOutlined />
                                                <span className="font-medium">{attr?.name}</span>
                                                <Tag color="blue">{attr?.code}</Tag>
                                                <Tag>{selectedValIds.length} / {availableValues.length} đã chọn</Tag>
                                            </div>
                                        }
                                        extra={
                                            <Space>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleValueChange(attrId, availableValues.map(v => v._id))}
                                                >
                                                    Chọn tất cả
                                                </Button>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleValueChange(attrId, [])}
                                                >
                                                    Bỏ chọn
                                                </Button>
                                            </Space>
                                        }
                                        className="bg-gray-50"
                                    >
                                        {availableValues.length === 0 ? (
                                            <Empty
                                                description={`Chưa có giá trị nào cho thuộc tính "${attr?.name}"`}
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            />
                                        ) : (
                                            <Select
                                                mode="multiple"
                                                placeholder={`Chọn giá trị cho ${attr?.name}...`}
                                                value={selectedValIds}
                                                onChange={(ids) => handleValueChange(attrId, ids)}
                                                showSearch
                                                optionFilterProp="label"
                                                className="w-full"
                                                options={availableValues.map(val => ({
                                                    label: val.label,
                                                    value: val._id,
                                                }))}
                                                tagRender={({ label, closable, onClose }) => (
                                                    <Tag
                                                        color="blue"
                                                        closable={closable}
                                                        onClose={onClose}
                                                        className="mr-1"
                                                    >
                                                        {label}
                                                    </Tag>
                                                )}
                                            />
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    <Divider />

                    <div className="flex justify-between">
                        <Button size="large" onClick={() => setCurrentStep(0)}>
                            Quay lại
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            disabled={totalVariantsPreview === 0}
                            onClick={() => setCurrentStep(2)}
                        >
                            Tiếp theo: Sinh biến thể ({totalVariantsPreview})
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 3: Generate & Edit Variants */}
            {currentStep === 2 && (
                <div className="space-y-6">
                    {/* Generate Button */}
                    <Card className="shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-semibold m-0 flex items-center gap-2">
                                    <ThunderboltOutlined className="text-yellow-500" />
                                    Sinh tổ hợp biến thể
                                </h3>
                                <p className="text-gray-500 text-sm m-0 mt-1">
                                    Dựa trên {selectedAttributes.length} thuộc tính đã chọn, sẽ sinh ra{' '}
                                    <strong className="text-blue-600">{totalVariantsPreview}</strong> biến thể
                                </p>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ThunderboltOutlined />}
                                onClick={generateVariants}
                            >
                                {variantsGenerated ? 'Sinh lại biến thể' : 'Sinh tổ hợp biến thể'}
                            </Button>
                        </div>

                        {/* Batch Pricing */}
                        {variantsGenerated && variants.length > 0 && (
                            <>
                                <Divider />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-600 mb-1 block">Giá đồng loạt (VND)</label>
                                            <InputNumber
                                                value={batchPrice}
                                                onChange={(val) => setBatchPrice(val || 0)}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                                                min={0}
                                                className="w-full"
                                            />
                                        </div>
                                        <Button onClick={applyBatchPrice} type="dashed">
                                            Áp dụng
                                        </Button>
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-600 mb-1 block">Giảm giá đồng loạt (%)</label>
                                            <InputNumber
                                                value={batchDiscount}
                                                onChange={(val) => setBatchDiscount(val || 0)}
                                                min={0}
                                                max={100}
                                                addonAfter="%"
                                                className="w-full"
                                            />
                                        </div>
                                        <Button onClick={applyBatchDiscount} type="dashed">
                                            Áp dụng
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </Card>

                    {/* Variants Table */}
                    {variantsGenerated && variants.length > 0 && (
                        <Card
                            className="shadow-sm"
                            title={
                                <div className="flex items-center gap-3">
                                    <AppstoreOutlined />
                                    <span>Danh sách biến thể</span>
                                    <Badge
                                        count={variants.filter(v => v.enabled).length}
                                        style={{ backgroundColor: '#52c41a' }}
                                    />
                                    <span className="text-gray-400 text-sm font-normal">
                                        / {variants.length} biến thể
                                    </span>
                                </div>
                            }
                        >
                            <Table
                                columns={variantColumns}
                                dataSource={variants}
                                rowKey="key"
                                pagination={variants.length > 20 ? { pageSize: 20, showTotal: (t) => `Tổng ${t}` } : false}
                                bordered
                                size="small"
                                scroll={{ x: 'max-content' }}
                                rowClassName={(record) => record.enabled ? '' : 'opacity-40'}
                            />
                        </Card>
                    )}

                    {/* Actions */}
                    <Card className="shadow-sm">
                        <div className="flex justify-between">
                            <Button size="large" onClick={() => setCurrentStep(1)}>
                                Quay lại
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                icon={<CheckCircleOutlined />}
                                onClick={handleSubmit}
                                loading={isSaving}
                                disabled={!variantsGenerated || variants.filter(v => v.enabled).length === 0}
                            >
                                Đăng bán sản phẩm ({variants.filter(v => v.enabled).length} biến thể)
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
