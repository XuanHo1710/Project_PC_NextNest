'use client';

import { Button, Empty, Image, message, Popconfirm, Tooltip } from 'antd';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IProductCard } from '@/types/product';
import { accountGuestService, productClientService } from '@/services/client';
import useAuthUser from '@/hooks/useAuthUser';
import useCartStore from '@/hooks/useCart';
import {
    getProductDisplayPrice,
    getProductOriginalPrice,
    getProductDiscount,
    getProductImage,
    getProductStock,
    getDefaultCartVariant,
    formatCurrencyVND,
} from '@/utils/productHelpers';
import { WishlistSkeleton } from '@/components/Skeletons/WishlistSkeleton';
import { DynamicMetadata } from "@/components/common/DynamicMetadata";
import ProfileSidebar from '@/components/client/ProfileSidebar/ProfileSidebar';
import Breadcrumb from '@/components/client/Breadcrumb/Breadcrumb';
import {
    HeartFilled,
    ShoppingCartOutlined,
    DeleteOutlined,
    EyeOutlined,
} from '@ant-design/icons';

export default function WishlistPage() {
    const { user } = useAuthUser();
    const queryClient = useQueryClient();
    const { addToCart } = useCartStore();

    // Fetch wishlist favorite product IDs
    const { data: favoriteIds = [], isLoading: isLoadingFavorites } = useQuery<string[]>({
        queryKey: ['wishlist'],
        queryFn: () => accountGuestService.getFavorites(),
        enabled: !!user?.id,
    });

    // Fetch product details for each favorite ID
    const { data: wishlistProducts = [], isLoading: isLoadingProducts } = useQuery<IProductCard[]>({
        queryKey: ['wishlist-products', favoriteIds],
        queryFn: async () => {
            if (!favoriteIds.length) return [];
            const products = await Promise.all(
                favoriteIds.map(async (id) => {
                    try {
                        const product = await productClientService.getProductById(id);
                        return product as unknown as IProductCard;
                    } catch {
                        return null;
                    }
                }),
            );
            return products.filter(Boolean) as IProductCard[];
        },
        enabled: favoriteIds.length > 0,
    });

    const isLoading = isLoadingFavorites || isLoadingProducts;

    // Mutation to remove from wishlist
    const removeFromWishlistMutation = useMutation({
        mutationFn: ({ productId }: { productId: string }) =>
            productClientService.removeFromWishlist(productId),
        onSuccess: () => {
            message.success('Đã xóa khỏi danh sách yêu thích!');
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
        },
        onError: () => {
            message.error('Có lỗi xảy ra khi xóa sản phẩm!');
        },
    });

    const handleAddToCart = (product: IProductCard) => {
        if (getProductStock(product) === 0) {
            message.error('Sản phẩm đã hết hàng');
            return;
        }
        const variant = getDefaultCartVariant(product);
        if (!variant) {
            message.warning('Sản phẩm không có phiên bản khả dụng!');
            return;
        }
        addToCart(product, variant);
        message.success('Đã thêm vào giỏ hàng!');
    };

    const handleRemoveFromWishlist = (productId: string) => {
        removeFromWishlistMutation.mutate({ productId });
    };

    const breadcrumb = (
        <div className="mx-5 xl:mx-32">
            <Breadcrumb items={[
                { label: 'Hồ sơ', href: '/profile/detail' },
                { label: 'Yêu thích' },
            ]} />
        </div>
    );

    if (isLoading) {
        return (
            <div className="container mx-auto">
                {breadcrumb}
                <div className="mx-5 xl:mx-32 mt-5 pb-5 grid grid-cols-12 gap-0 lg:gap-9">
                    <ProfileSidebar user={user} activePage="wishlist" />
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <HeartFilled className="text-red-500 text-xl" />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white m-0">Danh sách yêu thích</h2>
                            </div>
                            <WishlistSkeleton />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <DynamicMetadata
                title={`Danh sách yêu thích (${wishlistProducts?.length || 0}) - PC Store`}
                description="Quản lý danh sách sản phẩm yêu thích của bạn tại PC Store."
            />
            <div className="container mx-auto">
                {breadcrumb}

                <div className="mx-5 xl:mx-32 mt-5 pb-5 grid grid-cols-12 gap-0 lg:gap-9">
                    <ProfileSidebar user={user} activePage="wishlist" />

                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <HeartFilled className="text-red-500 text-xl" />
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white m-0">
                                        Yêu thích
                                    </h2>
                                    <span className="bg-red-50 dark:bg-red-900/30 text-red-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        {wishlistProducts.length}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                {wishlistProducts.length === 0 ? (
                                    <div className="py-16">
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description={
                                                <div className="text-center">
                                                    <p className="text-gray-400 mb-4 text-sm">
                                                        Bạn chưa thêm sản phẩm nào vào danh sách yêu thích
                                                    </p>
                                                    <Link href="/home">
                                                        <Button type="primary">
                                                            Khám phá sản phẩm
                                                        </Button>
                                                    </Link>
                                                </div>
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {wishlistProducts.map((product) => {
                                            const displayPrice = getProductDisplayPrice(product);
                                            const originalPrice = getProductOriginalPrice(product);
                                            const discount = getProductDiscount(product);
                                            const stock = getProductStock(product);
                                            const image = getProductImage(product);

                                            return (
                                                <div
                                                    key={product._id}
                                                    className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-200"
                                                >
                                                    {/* Image */}
                                                    <Link href={`/product/${product.slug}`} className="flex-shrink-0">
                                                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700">
                                                            <Image
                                                                src={image || '/laptop.png'}
                                                                alt={product.name}
                                                                preview={false}
                                                                className="!w-full !h-full object-contain"
                                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                            />
                                                            {discount > 0 && (
                                                                <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                                    -{discount}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Link>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <Link href={`/product/${product.slug}`}>
                                                            <h3 className="font-medium text-gray-800 dark:text-white text-sm sm:text-base line-clamp-2 hover:text-blue-500 transition-colors mb-1">
                                                                {product.name}
                                                            </h3>
                                                        </Link>

                                                        {product.category && (
                                                            <span className="text-xs text-gray-400 mb-2 block">
                                                                {product.category.name}
                                                            </span>
                                                        )}

                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-lg font-bold text-red-500">
                                                                {formatCurrencyVND(displayPrice)}
                                                            </span>
                                                            {discount > 0 && (
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    {formatCurrencyVND(originalPrice)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                                            <span className={`text-xs ${stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                                {stock > 0 ? `Còn ${stock} sản phẩm` : 'Hết hàng'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                                                        <Tooltip title="Thêm vào giỏ hàng">
                                                            <Button
                                                                type="primary"
                                                                icon={<ShoppingCartOutlined />}
                                                                disabled={stock === 0}
                                                                onClick={() => handleAddToCart(product)}
                                                                className="!rounded-lg"
                                                                size="middle"
                                                            />
                                                        </Tooltip>
                                                        <Tooltip title="Xem chi tiết">
                                                            <Link href={`/product/${product.slug}`}>
                                                                <Button
                                                                    icon={<EyeOutlined />}
                                                                    className="!rounded-lg"
                                                                    size="middle"
                                                                />
                                                            </Link>
                                                        </Tooltip>
                                                        <Popconfirm
                                                            title="Xóa khỏi yêu thích?"
                                                            onConfirm={() => handleRemoveFromWishlist(product._id)}
                                                            okText="Xóa"
                                                            cancelText="Hủy"
                                                            okButtonProps={{ danger: true }}
                                                        >
                                                            <Tooltip title="Xóa">
                                                                <Button
                                                                    type="text"
                                                                    danger
                                                                    icon={<DeleteOutlined />}
                                                                    className="!rounded-lg"
                                                                    size="middle"
                                                                    loading={removeFromWishlistMutation.isPending}
                                                                />
                                                            </Tooltip>
                                                        </Popconfirm>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}