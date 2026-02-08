'use client';
import { useEffect, useState, useMemo } from 'react';
import CardProduct from "@/components/client/CardProduct/CardProduct";
import { productClientService } from "@/services/client";
import { IProductCard, IProductWithPagination, IProductVariant } from "@/types/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Carousel, Rate, Tag, Tabs, message, Breadcrumb, Divider, Badge } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProductDetailSkeleton } from "@/components/Skeletons";
import {
    ShoppingCartOutlined,
    HeartOutlined,
    CheckCircleFilled,
    FireFilled,
    CommentOutlined,
    SafetyCertificateFilled,
    ThunderboltFilled,
    RocketFilled,
    QuestionCircleOutlined,
    HomeOutlined,
    TruckOutlined,
    PhoneOutlined,
    CreditCardOutlined,
    SwapOutlined,
} from '@ant-design/icons';
import CommentProduct from '@/components/client/ProductDetail/Comment';
import DescriptionProduct from '@/components/client/ProductDetail/Description';
import ProductImageGallery from '@/components/client/ProductDetail/ProductImageGallery';
import useCartStore from '@/hooks/useCart';
import {
    getProductDisplayPrice,
    getProductOriginalPrice,
    getProductDiscount,
    getProductImage,
    getProductImages,
    getProductSoldCount,
} from '@/utils/productHelpers';
import Swal from "sweetalert2";
import useAuthUser from '@/hooks/useAuthUser';
import { DynamicMetadata } from "@/components/common/DynamicMetadata";

// Extended product type from findBySlug (includes variants + allowValues)
interface ProductDetail extends IProductCard {
    variants?: IProductVariant[];
    allowValues?: Array<{
        _id: string;
        attributeValue: {
            _id: string;
            value: string;
            label: string;
            colorHex?: string;
            imageUrl?: string;
            attribute: {
                _id: string;
                name: string;
                code: string;
                displayType: string;
            };
        };
    }>;
}

export default function ProductDetailClient() {
    const { slug } = useParams();
    const router = useRouter();
    const { addToCart } = useCartStore();
    const { user } = useAuthUser();
    const queryClient = useQueryClient();

    // Selected variant state
    const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(null);
    const [selectedCombination, setSelectedCombination] = useState<Record<string, string>>({});

    const { data: product, isLoading: isLoadingProduct } = useQuery<ProductDetail>({
        queryKey: ['product-slug', slug],
        queryFn: () => productClientService.getProductsBySlug(slug as string) as Promise<ProductDetail>,
        staleTime: 1000 * 60 * 5,
    });

    const { data: dataWishlist } = useQuery<{ isWishlisted: boolean }>({
        queryKey: ['product-isWishlist', product?._id, user?.id],
        queryFn: () => productClientService.isWishlistByGuestAndProduct(user?.id || "", product?._id as string),
        enabled: !!product?._id && !!user?.id,
    });

    const { data: dataProduct } = useQuery<IProductWithPagination | null>({
        queryKey: ['product-by-category', product?.category?._id || ""],
        queryFn: () => productClientService.getProductsByCategoryId(product?.category?._id || "" as string),
        enabled: !!product?.category?._id,
    });

    const addToListMutation = useMutation({
        mutationFn: ({ guestID, productID, isWishlist }: { guestID: string; productID: string; isWishlist: boolean }) =>
            productClientService.handleWishlist(guestID, productID, isWishlist),
        onSuccess: () => {
            Swal.fire({ icon: "success", title: "Cập nhật danh sách yêu thích thành công!" });
            queryClient.invalidateQueries({ queryKey: ['product-isWishlist', product?._id, user?.id] });
        },
        onError: () => message.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.'),
    });

    // Derive attribute groups from allowValues
    const attributeGroups = useMemo(() => {
        if (!product?.allowValues) return [];
        const groups: Record<string, {
            attribute: { _id: string; name: string; code: string; displayType: string };
            values: Array<{ _id: string; value: string; label: string; colorHex?: string; imageUrl?: string }>;
        }> = {};
        for (const av of product.allowValues) {
            if (!av.attributeValue?.attribute) continue;
            const attr = av.attributeValue.attribute;
            if (!groups[attr._id]) {
                groups[attr._id] = { attribute: attr, values: [] };
            }
            const existing = groups[attr._id].values.find(v => v._id === av.attributeValue._id);
            if (!existing) {
                groups[attr._id].values.push({
                    _id: av.attributeValue._id,
                    value: av.attributeValue.value,
                    label: av.attributeValue.label,
                    colorHex: av.attributeValue.colorHex,
                    imageUrl: av.attributeValue.imageUrl,
                });
            }
        }
        return Object.values(groups);
    }, [product?.allowValues]);

    // Set default variant on load
    useEffect(() => {
        if (product?.defaultVariant && !selectedVariant) {
            const dv = product.defaultVariant as unknown as IProductVariant;
            setSelectedVariant(dv);
            if (dv.combination) setSelectedCombination(dv.combination);
        }
    }, [product, selectedVariant]);

    // Match variant from selected combination
    useEffect(() => {
        if (!product?.variants || Object.keys(selectedCombination).length === 0) return;
        const match = product.variants.find(v => {
            if (!v.combination) return false;
            return Object.entries(selectedCombination).every(
                ([key, val]) => v.combination[key] === val
            );
        });
        if (match) setSelectedVariant(match);
    }, [selectedCombination, product?.variants]);

    const handleCombinationSelect = (attrCode: string, valueLabel: string) => {
        setSelectedCombination(prev => ({ ...prev, [attrCode]: valueLabel }));
    };

    // Current display data from selected variant or defaultVariant
    const displayImages = selectedVariant?.images?.length ? selectedVariant.images : getProductImages(product as IProductCard);
    const displayPrice = selectedVariant ? selectedVariant.price : getProductOriginalPrice(product as IProductCard);
    const displayDiscount = selectedVariant ? selectedVariant.discount : getProductDiscount(product as IProductCard);
    const displayFinalPrice = Math.round(displayPrice * (1 - displayDiscount / 100));
    const displayStock = selectedVariant?.stock ?? 0;

    useEffect(() => {
        if (!isLoadingProduct) window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [isLoadingProduct]);

    const responsiveSettings = [
        { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 1 } },
        { breakpoint: 800, settings: { slidesToShow: 3, slidesToScroll: 1 } },
        { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ];

    const handleAddToWishlist = (p: IProductCard) => {
        const guestID = user?.id || "";
        if (!guestID) {
            Swal.fire({ icon: "warning", title: "Vui lòng đăng nhập để sử dụng tính năng này!" });
            return;
        }
        addToListMutation.mutate({ guestID, productID: p._id, isWishlist: !dataWishlist?.isWishlisted });
    };

    if (isLoadingProduct) return <ProductDetailSkeleton />;

    if (!product || !product._id) return null;

    return (
        <>
            <DynamicMetadata
                title={`${product.name} - Giá ${displayFinalPrice.toLocaleString()}đ | PC Store`}
                description={`Mua ${product.name} chính hãng giá ${displayFinalPrice.toLocaleString()}đ. ${product.description || 'Bảo hành chính hãng, giao hàng nhanh.'}`}
                keywords={`${product.name}, mua ${product.name}, ${product.category?.name || 'pc gaming'}, linh kiện máy tính`}
                ogTitle={`${product.name} - ${displayFinalPrice.toLocaleString()}đ`}
                ogDescription={`${product.description || 'Bảo hành chính hãng, giao hàng nhanh'}`}
                ogImage={getProductImage(product) || '/laptop.png'}
            />

            <div className="pt-3 bg-slate-50 dark:bg-gray-900 dark:text-white min-h-screen">
                {/* Breadcrumb */}
                <div className="mx-5 xl:mx-32 mb-4">
                    <Breadcrumb
                        items={[
                            { title: <Link href="/home" className="flex items-center gap-1"><HomeOutlined /> Trang chủ</Link> },
                            ...(product.category ? [{ title: <Link href={`/category/${product.category.slug}`}>{product.category.name}</Link> }] : []),
                            { title: <span className="text-blue-600 font-medium">{product.name}</span> },
                        ]}
                    />
                </div>

                {/* Main Product Card */}
                <div className="mx-5 xl:mx-32 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 md:p-8 mb-6">
                    {/* Product Title */}
                    <h1 className="font-bold text-xl lg:text-2xl text-gray-900 dark:text-white pb-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 flex-wrap">
                        {product.name}
                        {displayDiscount > 10 && (
                            <Tag color="red" className="!text-sm !font-semibold !rounded-lg !px-3">
                                <FireFilled className="mr-1" /> -{displayDiscount}%
                            </Tag>
                        )}
                        {product.brand?.name && (
                            <Tag color="blue" className="!rounded-lg !text-xs">{product.brand.name}</Tag>
                        )}
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-12 mt-6 gap-8">
                        {/* Left: Image Gallery */}
                        <div className="lg:col-span-5">
                            <ProductImageGallery
                                images={displayImages}
                                productName={product.name}
                            />

                            {/* Rating + Stats */}
                            <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex flex-col items-center">
                                    <Rate disabled defaultValue={product.ratingAvg || 0} allowHalf className="text-sm" />
                                    <span className="text-xs text-gray-500 mt-1">{product.totalRatings || 0} đánh giá</span>
                                </div>
                                <Divider type="vertical" className="!h-10 !border-gray-300" />
                                <div className="flex flex-col text-sm">
                                    <span className="text-green-600 font-semibold flex items-center gap-1">
                                        <CheckCircleFilled /> Hàng chính hãng
                                    </span>
                                    <span className="text-blue-500 flex items-center gap-1 mt-1">
                                        <SafetyCertificateFilled /> Bảo hành đầy đủ
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Product Info */}
                        <div className="lg:col-span-7 space-y-5">
                            {/* Price Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-5">
                                <div className="flex items-end gap-4 flex-wrap">
                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-3xl xl:text-4xl">
                                        {displayFinalPrice.toLocaleString()}đ
                                    </span>
                                    {displayDiscount > 0 && (
                                        <>
                                            <span className="line-through text-gray-400 text-xl font-semibold">
                                                {displayPrice.toLocaleString()}đ
                                            </span>
                                            <Tag color="red" className="!text-sm !font-bold !rounded-lg">
                                                Tiết kiệm {(displayPrice - displayFinalPrice).toLocaleString()}đ
                                            </Tag>
                                        </>
                                    )}
                                </div>
                                {displayStock > 0 ? (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge status="success" />
                                        <span className="text-green-600 text-sm font-medium">Còn {displayStock} sản phẩm</span>
                                    </div>
                                ) : (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge status="error" />
                                        <span className="text-red-500 text-sm font-medium">Tạm hết hàng</span>
                                    </div>
                                )}
                            </div>

                            {/* Variant Selection */}
                            {attributeGroups.length > 0 && (
                                <div className="space-y-4">
                                    {attributeGroups.map(group => (
                                        <div key={group.attribute._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2.5 block">
                                                {group.attribute.name}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {group.values.map(val => {
                                                    const isSelected = selectedCombination[group.attribute.code] === val.label;
                                                    return (
                                                        <button
                                                            key={val._id}
                                                            onClick={() => handleCombinationSelect(group.attribute.code, val.label)}
                                                            className={`
                                                                px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 text-sm font-medium
                                                                ${isSelected
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/30 dark:text-blue-300'
                                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'
                                                                }
                                                            `}
                                                        >
                                                            {group.attribute.displayType === 'COLOR' && val.colorHex && (
                                                                <span
                                                                    className="w-5 h-5 rounded-full border-2 border-white shadow shrink-0"
                                                                    style={{ backgroundColor: val.colorHex }}
                                                                />
                                                            )}
                                                            {group.attribute.displayType === 'IMAGE' && val.imageUrl && (
                                                                <img src={val.imageUrl} alt={val.label} className="w-6 h-6 rounded object-cover" />
                                                            )}
                                                            {val.label}
                                                            {isSelected && <CheckCircleFilled className="text-blue-500 text-xs" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* SKU display */}
                            {selectedVariant?.sku && (
                                <div className="text-xs text-gray-400">SKU: {selectedVariant.sku}</div>
                            )}

                            {/* Shipping Info */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: <TruckOutlined className="text-blue-500" />, text: 'Giao hàng nhanh 24h' },
                                    { icon: <SwapOutlined className="text-blue-500" />, text: 'Đổi trả miễn phí 7 ngày' },
                                    { icon: <CreditCardOutlined className="text-blue-500" />, text: 'Hỗ trợ trả góp 0%' },
                                    { icon: <PhoneOutlined className="text-blue-500" />, text: 'Hotline: 1900 1234' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5">
                                        {item.icon}
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button
                                    size="large"
                                    onClick={() => {
                                        Swal.fire({
                                            icon: "success", title: "Thêm vào giỏ hàng thành công!",
                                            showConfirmButton: false, timer: 1500,
                                        });
                                        addToCart(product);
                                    }}
                                    icon={<ShoppingCartOutlined />}
                                    className="!bg-amber-500 !text-white !border-amber-500 hover:!bg-amber-600 !h-12 !px-8 !rounded-xl !font-semibold !text-base !shadow-lg !shadow-amber-500/20"
                                >
                                    Thêm vào giỏ
                                </Button>
                                <Button
                                    size="large"
                                    onClick={() => { addToCart(product); router.push('/cart'); }}
                                    icon={<ThunderboltFilled />}
                                    type="primary"
                                    className="!h-12 !px-10 !rounded-xl !font-semibold !text-base !shadow-lg !shadow-blue-500/20"
                                >
                                    Mua ngay
                                </Button>
                                <Button
                                    size="large"
                                    icon={<HeartOutlined />}
                                    onClick={() => handleAddToWishlist(product)}
                                    className={`!h-12 !px-6 !rounded-xl !font-medium ${dataWishlist?.isWishlisted ? '!text-red-500 !border-red-300' : '!text-gray-500 !border-gray-300'} hover:!text-red-500`}
                                >
                                    Yêu thích
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs: Description + Comments */}
                <div className="mx-5 xl:mx-32 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-6">
                    <Tabs
                        defaultActiveKey="1"
                        type="card"
                        className="product-detail-tabs"
                        size="large"
                        items={[
                            {
                                key: '1',
                                label: 'Mô tả sản phẩm',
                                children: <DescriptionProduct product={product} />,
                            },
                            {
                                key: '2',
                                label: (
                                    <span className="flex items-center gap-1.5">
                                        <CommentOutlined /> Đánh giá & bình luận
                                    </span>
                                ),
                                children: <CommentProduct product={product} />,
                            },
                            ...(product.variants && product.variants.length > 1 ? [{
                                key: '3',
                                label: `Tất cả biến thể (${product.variants.length})`,
                                children: (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {product.variants.map(v => {
                                            const finalP = Math.round(v.price * (1 - v.discount / 100));
                                            const isActive = selectedVariant?._id === v._id;
                                            return (
                                                <div
                                                    key={v._id}
                                                    onClick={() => { setSelectedVariant(v); if (v.combination) setSelectedCombination(v.combination); }}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isActive ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {v.images?.[0] && (
                                                            <img src={v.images[0]} alt={v.sku} className="w-16 h-16 rounded-lg object-cover border" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap gap-1 mb-1">
                                                                {v.combination && Object.entries(v.combination).map(([k, val]) => (
                                                                    <Tag key={k} color="blue" className="!text-xs !rounded-md !m-0">{val}</Tag>
                                                                ))}
                                                            </div>
                                                            <div className="font-bold text-blue-600">{finalP.toLocaleString()}đ</div>
                                                            {v.discount > 0 && <span className="text-xs text-gray-400 line-through">{v.price.toLocaleString()}đ</span>}
                                                            <div className="text-xs text-gray-500 mt-0.5">Kho: {v.stock}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ),
                            }] : []),
                        ]}
                    />
                </div>

                {/* Related Products */}
                {dataProduct && dataProduct.items?.length > 0 && (
                    <div className="mx-5 xl:mx-32 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-10">
                        <h2 className="font-bold text-blue-600 dark:text-white text-xl lg:text-2xl pb-4 border-b border-gray-100 flex items-center gap-2">
                            <RocketFilled className="text-blue-500" /> Sản phẩm tương tự
                        </h2>
                        <Carousel
                            slidesToShow={5}
                            slidesToScroll={1}
                            draggable
                            className="mt-6 cursor-grab"
                            dots={false}
                            autoplay
                            arrows
                            autoplaySpeed={3000}
                            responsive={responsiveSettings}
                        >
                            {dataProduct.items.map(item => (
                                <div key={item._id} className="px-1.5">
                                    <CardProduct css="hover:shadow-lg transition-all" product={item} />
                                </div>
                            ))}
                        </Carousel>
                    </div>
                )}
            </div>
        </>
    );
}
