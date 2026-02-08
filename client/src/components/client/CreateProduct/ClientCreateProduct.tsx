'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, Button, Steps, Result, Form, message, Spin } from 'antd';
import {
    ShoppingOutlined, TagsOutlined, AppstoreOutlined,
    ArrowLeftOutlined, CheckCircleOutlined, HomeOutlined,
    PlusCircleOutlined,
} from '@ant-design/icons';
import {
    useClientCreateProduct,
    useClientAttributeValuesMap,
} from '@/hooks/client/useProductManage';
import { productManageClientService } from '@/services/client/product-manage.client.service';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProviderClient';
import type { IProductAttribute } from '@/types';

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

    // Attribute object cache — populated when user selects attributes via InfiniteSelect
    const [attributeObjectCache, setAttributeObjectCache] = useState<Record<string, IProductAttribute>>({});

    // Category & brand names — set by ProductInfoStep via onSelect callbacks
    const [resolvedCategoryName, setResolvedCategoryName] = useState<string>('');
    const [resolvedBrandName, setResolvedBrandName] = useState<string>('');

    // Generated variants
    const [variants, setVariants] = useState<VariantRow[]>([]);
    const [variantsGenerated, setVariantsGenerated] = useState(false);

    // Submit state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdProductName, setCreatedProductName] = useState('');

    // Queries — only attribute values need coordinated loading
    const { allValues: attributeValues = [], isLoading: loadingValues } = useClientAttributeValuesMap(selectedAttributes);
    const createProductMutation = useClientCreateProduct();

    // Derive selected attribute objects from cache
    const selectedAttributeObjects = useMemo(() =>
        selectedAttributes.map(id => attributeObjectCache[id]).filter(Boolean) as IProductAttribute[],
        [selectedAttributes, attributeObjectCache]
    );
    const valueList = attributeValues;

    // ============= HANDLERS =============
    const handleAttributeChange = useCallback((attrIds: string[]) => {
        setSelectedAttributes(attrIds);
        // Clean up values for deselected attributes
        setSelectedValues(prev => {
            const cleaned = { ...prev };
            Object.keys(cleaned).forEach(key => {
                if (!attrIds.includes(key)) {
                    delete cleaned[key];
                }
            });
            return cleaned;
        });
        // Clean up cache for deselected attributes
        setAttributeObjectCache(prev => {
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

    const handleAttributeSelect = useCallback((attrId: string, attrObject: IProductAttribute) => {
        setAttributeObjectCache(prev => ({ ...prev, [attrId]: attrObject }));
    }, []);

    const handleValueChange = useCallback((attributeId: string, valueIds: string[]) => {
        setSelectedValues(prev => ({ ...prev, [attributeId]: valueIds }));
        setVariantsGenerated(false);
        setVariants([]);
    }, []);

    // Step navigation
    const handleStepNext = useCallback(() => {
        setCurrentStep(prev => Math.min(prev + 1, 3));
        window.scrollTo(0, 0);
    }, []);

    const handleStepBack = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
        window.scrollTo(0, 0);
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
                categoryId: productValues.category,
                brandId: productValues.brand || undefined,
                status: 'ACTIVE' as const,
                minPrice: Math.min(...prices),
                maxPrice: Math.max(...prices),
            };

            const productResult = await createProductMutation.mutateAsync(productData);
            const productId = productResult?._id;

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
                    subDescription: variant.subDescription || undefined,
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
        setAttributeObjectCache({});
        setResolvedCategoryName('');
        setResolvedBrandName('');
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
    }, [currentStep, form]);

    const categoryName = resolvedCategoryName;
    const brandName = resolvedBrandName;

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
                <Card className="border shadow-sm">
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
                                className="h-12 px-8 rounded-lg font-semibold"
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
            <Card className="border shadow-sm mb-6">
                <Steps
                    current={currentStep}
                    items={stepsConfig}
                    className="px-2"
                    responsive
                    onChange={(step) => {
                        // Allow going backwards only
                        if (step < currentStep) {
                            setCurrentStep(step);
                            window.scrollTo(0, 0);
                        }
                    }}
                />
            </Card>

            {/* Step Content — ProductInfoStep always rendered to keep <Form form={form}> connected */}
            <div className="step-content">
                <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                    <ProductInfoStep
                        form={form}
                        onNext={handleStepNext}
                        onCategoryNameChange={setResolvedCategoryName}
                        onBrandNameChange={setResolvedBrandName}
                    />
                </div>

                {currentStep === 1 && (
                    <SelectAttributesStep
                        attributes={selectedAttributeObjects}
                        attributeValues={valueList}
                        selectedAttributes={selectedAttributes}
                        selectedValues={selectedValues}
                        onAttributeChange={handleAttributeChange}
                        onAttributeSelect={handleAttributeSelect}
                        onValueChange={handleValueChange}
                        onBack={handleStepBack}
                        onNext={handleStepNext}
                    />
                )}

                {currentStep === 2 && (
                    <ConfigureVariantsStep
                        attributes={selectedAttributeObjects}
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
                        attributes={selectedAttributeObjects}
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
