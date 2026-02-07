'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, Button, Steps, Result, Form, message, Spin } from 'antd';
import {
    ShoppingOutlined, TagsOutlined, AppstoreOutlined,
    ArrowLeftOutlined, CheckCircleOutlined, HomeOutlined,
    PlusCircleOutlined,
} from '@ant-design/icons';
import {
    useClientProductAttributes,
    useClientProductAttributeValues,
    useClientCreateProduct,
    useClientCategories,
    useClientBrands,
} from '@/hooks/client/useProductManage';
import { productManageClientService } from '@/services/client/product-manage.client.service';
import type { IProductAttribute, IProductAttributeValue } from '@/types';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProviderClient';

// Step components
import { ProductInfoStep, SelectAttributesStep, ConfigureVariantsStep, ReviewStep } from './steps';
import type { VariantRow } from './steps';

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

    // Submit state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdProductName, setCreatedProductName] = useState('');

    // Queries
    const { data: attributes = [], isLoading: loadingAttrs } = useClientProductAttributes();
    const { data: attributeValues = [], isLoading: loadingValues } = useClientProductAttributeValues();
    const { data: categories = [], isLoading: loadingCats } = useClientCategories();
    const { data: brands = [], isLoading: loadingBrands } = useClientBrands();
    const createProductMutation = useClientCreateProduct();

    // Cast data
    const attributeList = attributes as IProductAttribute[];
    const valueList = attributeValues as IProductAttributeValue[];
    const categoryList = categories as { _id: string; name: string; slug: string }[];
    const brandList = brands as { _id: string; name: string }[];

    const isLoadingData = loadingAttrs || loadingValues || loadingCats || loadingBrands;

    // ============= HANDLERS =============
    const handleAttributeChange = useCallback((attrIds: string[]) => {
        setSelectedAttributes(attrIds);
        setSelectedValues(prev => {
            const cleaned = { ...prev };
            Object.keys(cleaned).forEach(key => {
                if (!attrIds.includes(key)) {
                    delete cleaned[key];
                }
            });
            return cleaned;
        });
        setVariantsGenerated(false);
        setVariants([]);
    }, []);

    const handleValueChange = useCallback((attributeId: string, valueIds: string[]) => {
        setSelectedValues(prev => ({ ...prev, [attributeId]: valueIds }));
        setVariantsGenerated(false);
        setVariants([]);
    }, []);

    // Step navigation
    const handleStepNext = useCallback(() => {
        setCurrentStep(prev => Math.min(prev + 1, 3));
    }, []);

    const handleStepBack = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }, []);

    // ============= SUBMIT =============
    const handleSubmit = useCallback(async () => {
        try {
            const productValues = form.getFieldsValue();
            const enabledVariants = variants.filter(v => v.enabled);

            if (enabledVariants.length === 0) {
                message.error('Cần có ít nhất 1 biến thể được bật');
                return;
            }

            setIsSubmitting(true);

            // 1. Create product
            const prices = enabledVariants.map(v => v.price * (1 - v.discount / 100));
            const productData = {
                name: productValues.name,
                description: productValues.description || undefined,
                category: productValues.category,
                brand: productValues.brand || undefined,
                status: 'ACTIVE' as const,
                minPrice: Math.min(...prices),
                maxPrice: Math.max(...prices),
            };

            const productResult = await createProductMutation.mutateAsync(productData);
            // Handle both possible response shapes
            const productId = (productResult as any)?._id || (productResult as any)?.data?._id;

            if (!productId) {
                throw new Error('Không thể tạo sản phẩm');
            }

            // 2. Create product attribute allow values
            const allValueIds = Object.values(selectedValues).flat();
            if (allValueIds.length > 0) {
                await productManageClientService.bulkCreateAllowValues(productId, allValueIds);
            }

            // 3. Create variants sequentially
            let firstVariantId: string | null = null;
            for (let i = 0; i < enabledVariants.length; i++) {
                const variant = enabledVariants[i];
                const result = await productManageClientService.createVariant({
                    sku: variant.sku,
                    product: productId,
                    price: variant.price,
                    discount: variant.discount,
                    stock: variant.stock,
                    combination: variant.combinationIds,
                    images: variant.images,
                });
                if (i === 0 && result?._id) {
                    firstVariantId = result._id;
                }
            }

            // 4. Set default variant
            if (firstVariantId) {
                await productManageClientService.updateProduct(productId, {
                    defaultProductVariantId: firstVariantId,
                });
            }

            setCreatedProductName(productValues.name);
            setIsSuccess(true);
            toast.success(
                `Tạo sản phẩm "${productValues.name}" thành công với ${enabledVariants.length} biến thể!`
            );
        } catch (err: any) {
            console.error('Error creating product:', err);
            toast.error(err?.message || 'Tạo sản phẩm thất bại!');
        } finally {
            setIsSubmitting(false);
        }
    }, [form, variants, selectedValues, createProductMutation]);

    // Reset wizard
    const handleReset = useCallback(() => {
        setIsSuccess(false);
        setCurrentStep(0);
        setVariants([]);
        setVariantsGenerated(false);
        setSelectedAttributes([]);
        setSelectedValues({});
        setCreatedProductName('');
        form.resetFields();
    }, [form]);

    // ============= COMPUTED for review step =============
    const productInfo = useMemo(() => {
        const vals = form.getFieldsValue();
        return {
            name: vals.name || '',
            description: vals.description || '',
            category: vals.category || '',
            brand: vals.brand || '',
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, form]);

    const categoryName = useMemo(() => {
        const catId = form.getFieldValue('category');
        return categoryList.find(c => c._id === catId)?.name;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, categoryList]);

    const brandName = useMemo(() => {
        const bId = form.getFieldValue('brand');
        return brandList.find(b => b._id === bId)?.name;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, brandList]);

    // ============= AUTH CHECK =============
    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4">
                <Result
                    status="403"
                    title="Bạn cần đăng nhập"
                    subTitle="Vui lòng đăng nhập để tạo sản phẩm bán hàng."
                    extra={
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => router.push('/auth/login')}
                        >
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
            <div className="max-w-2xl mx-auto py-16 px-4">
                <Card className="shadow-2xl border-0 overflow-hidden">
                    <Result
                        status="success"
                        title={
                            <span className="text-2xl">
                                Tạo sản phẩm thành công! 🎉
                            </span>
                        }
                        subTitle={
                            <div className="space-y-2 mt-2">
                                <p className="text-gray-600 text-base">
                                    Sản phẩm{' '}
                                    <strong className="text-blue-600">
                                        &quot;{createdProductName}&quot;
                                    </strong>{' '}
                                    đã được tạo với{' '}
                                    <strong>
                                        {variants.filter(v => v.enabled).length} biến thể
                                    </strong>
                                    .
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Sản phẩm sẽ hiển thị trên cửa hàng sau khi được duyệt.
                                </p>
                            </div>
                        }
                        extra={[
                            <Button
                                type="primary"
                                key="create-more"
                                size="large"
                                icon={<PlusCircleOutlined />}
                                onClick={handleReset}
                                className="h-12 px-8 rounded-lg font-semibold shadow-lg shadow-blue-500/20"
                            >
                                Tạo sản phẩm khác
                            </Button>,
                            <Button
                                key="home"
                                size="large"
                                icon={<HomeOutlined />}
                                onClick={() => router.push('/')}
                                className="h-12 px-8 rounded-lg font-medium"
                            >
                                Về trang chủ
                            </Button>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

    // ============= LOADING STATE =============
    if (isLoadingData) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Spin size="large" />
                <p className="text-gray-400 text-sm">Đang tải dữ liệu...</p>
            </div>
        );
    }

    // ============= STEPS CONFIG =============
    const stepsConfig = [
        { title: 'Thông tin', icon: <ShoppingOutlined /> },
        { title: 'Thuộc tính', icon: <TagsOutlined /> },
        { title: 'Biến thể', icon: <AppstoreOutlined /> },
        { title: 'Xem lại', icon: <CheckCircleOutlined /> },
    ];

    // ============= RENDER =============
    return (
        <div className="pb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    className="rounded-lg"
                >
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-2xl font-bold m-0 text-gray-900">
                        Đăng bán sản phẩm
                    </h1>
                    <p className="text-gray-500 text-sm m-0 mt-0.5">
                        Xin chào{' '}
                        <strong className="text-blue-600">
                            {user?.fullname || user?.email}
                        </strong>
                        , tạo sản phẩm với nhiều biến thể tự động
                    </p>
                </div>
            </div>

            {/* Steps Progress */}
            <Card className="shadow-md border-0 mb-6 rounded-xl">
                <Steps
                    current={currentStep}
                    items={stepsConfig}
                    className="px-2"
                    responsive
                    onChange={(step) => {
                        // Allow going backwards only
                        if (step < currentStep) {
                            setCurrentStep(step);
                        }
                    }}
                />
            </Card>

            {/* Step Content */}
            <div className="step-content">
                {currentStep === 0 && (
                    <ProductInfoStep
                        form={form}
                        categories={categoryList}
                        brands={brandList}
                        onNext={handleStepNext}
                    />
                )}

                {currentStep === 1 && (
                    <SelectAttributesStep
                        attributes={attributeList}
                        attributeValues={valueList}
                        selectedAttributes={selectedAttributes}
                        selectedValues={selectedValues}
                        onAttributeChange={handleAttributeChange}
                        onValueChange={handleValueChange}
                        onBack={handleStepBack}
                        onNext={handleStepNext}
                    />
                )}

                {currentStep === 2 && (
                    <ConfigureVariantsStep
                        attributes={attributeList}
                        attributeValues={valueList}
                        selectedAttributes={selectedAttributes}
                        selectedValues={selectedValues}
                        variants={variants}
                        setVariants={setVariants}
                        variantsGenerated={variantsGenerated}
                        setVariantsGenerated={setVariantsGenerated}
                        onBack={handleStepBack}
                        onSubmit={async () => setCurrentStep(3)}
                        isSubmitting={false}
                    />
                )}

                {currentStep === 3 && (
                    <ReviewStep
                        productInfo={productInfo}
                        categoryName={categoryName}
                        brandName={brandName}
                        attributes={attributeList}
                        attributeValues={valueList}
                        selectedAttributes={selectedAttributes}
                        selectedValues={selectedValues}
                        variants={variants}
                        onBack={handleStepBack}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>
        </div>
    );
}
