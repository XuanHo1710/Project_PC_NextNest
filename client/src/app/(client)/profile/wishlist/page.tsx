'use client';

import { Button, Empty, Image, message, Popconfirm } from 'antd';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IProductCard } from '@/types/model.client';
import { guestClientService, productClientService } from '@/services/client';
import useAuthUser from '@/hooks/useAuthUser';
import useCartStore from '@/hooks/useCart';
import { WishlistSkeleton } from '@/components/Skeletons/WishlistSkeleton';
import {
    HeartFilled,
    ShoppingCartOutlined,
    DeleteOutlined,
    EyeOutlined
} from '@ant-design/icons';

export default function WishlistPage() {
    const { user } = useAuthUser();
    const queryClient = useQueryClient();
    const { addToCart } = useCartStore();

    // Format currency function
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Fetch wishlist data
    const { data: wishlistProducts = [], isLoading } = useQuery<IProductCard[]>({
        queryKey: ['wishlist', user?.id],
        queryFn: () => guestClientService.getWishlist(user?.id || ''),
        enabled: !!user?.id,
    });

    console.log(wishlistProducts)

    // Mutation to remove from wishlist
    const removeFromWishlistMutation = useMutation({
        mutationFn: ({ productId }: { productId: string }) =>
            productClientService.handleWishlist(user?.id || '', productId, false),
        onSuccess: () => {
            message.success('Đã xóa khỏi danh sách yêu thích!');
            queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
        },
        onError: () => {
            message.error('Có lỗi xảy ra khi xóa sản phẩm!');
        },
    });

    const handleAddToCart = (product: IProductCard) => {
        if (product.stock === 0) {
            message.error('Sản phẩm đã hết hàng');
            return;
        }
        addToCart(product);
        message.success('Đã thêm sản phẩm vào giỏ hàng!');
    };

    const handleRemoveFromWishlist = (productId: string) => {
        removeFromWishlistMutation.mutate({ productId });
    };

    if (isLoading) {
        return (
            <div className='container mx-auto'>
                {/* Breadcrumb */}
                <div className='flex items-center mt-3 mx-5 xl:mx-32'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white mr-3">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <Link href="/profile/detail" className="font-medium text-lg text-stone-500 dark:text-white mr-3">Hồ sơ người dùng</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-400 dark:text-white mr-3">Danh sách yêu thích</h3>
                </div>

                <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                    {/* Sidebar */}
                    <div className='col-span-12 lg:col-span-3'>
                        <div className='flex items-center'>
                            <i className='fas fa-user-circle text-5xl text-blue-600'></i>
                            <div className='mx-4'>
                                <h6 className='text-base font-semibold'>Tài khoản của,</h6>
                                <h1 className='font-bold text-lg'>{user?.fullname || 'Khách hàng'}</h1>
                            </div>
                        </div>
                        <ul className='pl-0 my-5'>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/detail"}>
                                <li className='inline-block'>
                                    <i className="fa-regular fa-user w-9"></i>
                                    <span className='font-medium'>Thông tin tài khoản</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/order"}>
                                <li className='inline-block'>
                                    <i className="far fa-list-alt w-9"></i>
                                    <span className='font-medium'>Tra cứu đơn hàng</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 bg-blue-400 text-white px-5 rounded-lg' href={"/profile/wishlist"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-heart w-9"></i>
                                    <span className='font-medium'>Danh sách yêu thích</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/address"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-location-dot w-9"></i>
                                    <span className='font-medium'>Quản lý địa chỉ</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/password"}>
                                <li className='inline-block'>
                                    <i className="fas fa-lock w-9"></i>
                                    <span className='font-medium'>Thay đổi mật khẩu</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/home"}>
                                <li className='inline-block'>
                                    <i className="fas fa-sign-out-alt w-9"></i>
                                    <span className='font-medium'>Đăng xuất</span>
                                </li>
                            </Link>
                        </ul>
                    </div>

                    {/* Main Content with Skeleton */}
                    <div className='col-span-12 lg:col-span-9'>
                        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-2xl font-bold text-gray-800 dark:text-white flex items-center'>
                                    <HeartFilled className='text-red-500 mr-3' />
                                    Danh sách yêu thích
                                </h2>
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
            <div className='container mx-auto'>
                {/* Breadcrumb */}
                <div className='flex items-center mt-3 mx-5 xl:mx-32'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white mr-3">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <Link href="/profile/detail" className="font-medium text-lg text-stone-500 dark:text-white mr-3">Hồ sơ người dùng</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-400 dark:text-white mr-3">Danh sách yêu thích</h3>
                </div>

                <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                    {/* Sidebar */}
                    <div className='col-span-12 lg:col-span-3'>
                        <div className='flex items-center'>
                            <i className='fas fa-user-circle text-5xl text-blue-600'></i>
                            <div className='mx-4'>
                                <h6 className='text-base font-semibold'>Tài khoản của,</h6>
                                <h1 className='font-bold text-lg'>{user?.fullname || 'Khách hàng'}</h1>
                            </div>
                        </div>
                        <ul className='pl-0 my-5'>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/detail"}>
                                <li className='inline-block'>
                                    <i className="fa-regular fa-user w-9"></i>
                                    <span className='font-medium'>Thông tin tài khoản</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/order"}>
                                <li className='inline-block'>
                                    <i className="far fa-list-alt w-9"></i>
                                    <span className='font-medium'>Tra cứu đơn hàng</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 bg-blue-400 text-white px-5 rounded-lg' href={"/profile/wishlist"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-heart w-9"></i>
                                    <span className='font-medium'>Danh sách yêu thích</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/address"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-location-dot w-9"></i>
                                    <span className='font-medium'>Quản lý địa chỉ</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/password"}>
                                <li className='inline-block'>
                                    <i className="fas fa-lock w-9"></i>
                                    <span className='font-medium'>Thay đổi mật khẩu</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/home"}>
                                <li className='inline-block'>
                                    <i className="fas fa-sign-out-alt w-9"></i>
                                    <span className='font-medium'>Đăng xuất</span>
                                </li>
                            </Link>
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className='col-span-12 lg:col-span-9'>
                        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-2xl font-bold text-gray-800 dark:text-white flex items-center'>
                                    <HeartFilled className='!text-red-500 mr-3' />
                                    Danh sách yêu thích
                                </h2>
                                <div className='text-sm text-gray-500 dark:text-gray-400'>
                                    {wishlistProducts.length} sản phẩm
                                </div>
                            </div>

                            {wishlistProducts.length === 0 ? (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div className='text-center'>
                                            <p className='text-gray-500 dark:text-gray-400 mb-4'>
                                                Danh sách yêu thích của bạn đang trống
                                            </p>
                                            <Link href="/home">
                                                <Button type="primary" size="large">
                                                    <ShoppingCartOutlined className='mr-2' />
                                                    Khám phá sản phẩm
                                                </Button>
                                            </Link>
                                        </div>
                                    }
                                />
                            ) : (
                                <div className='grid max-h-[900px] overflow-y-scroll grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                                    {wishlistProducts.map((product) => (
                                        <div key={product._id} className='group bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-600 transform hover:-translate-y-1'>
                                            {/* Product Image */}
                                            <div className='relative h-48 overflow-hidden'>
                                                <Image
                                                    src={product.images[0] || '/laptop.png'}
                                                    alt={product.name}

                                                    className='object-cover group-hover:scale-110 transition-transform duration-500'
                                                />
                                                {product.discount > 0 && (
                                                    <div className='absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg'>
                                                        -{product.discount}%
                                                    </div>
                                                )}
                                                {/* Remove from wishlist button */}
                                                <Popconfirm
                                                    title="Xóa khỏi danh sách yêu thích?"
                                                    description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?"
                                                    onConfirm={() => handleRemoveFromWishlist(product._id)}
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        className='absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md'
                                                        size="small"
                                                        loading={removeFromWishlistMutation.isPending}
                                                    />
                                                </Popconfirm>
                                            </div>

                                            {/* Product Info */}
                                            <div className='p-4'>
                                                <h3 className='font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 h-12 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                                                    {product.name}
                                                </h3>

                                                {/* Category */}
                                                {product.category && (
                                                    <p className='text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium'>
                                                        {product.category.name}
                                                    </p>
                                                )}

                                                {/* Price */}
                                                <div className='mb-4'>
                                                    <div className='flex items-center space-x-2'>
                                                        <span className='text-xl font-bold text-red-600 dark:text-red-400'>
                                                            {formatCurrency(product.newPrice)}
                                                        </span>
                                                        {product.discount > 0 && (
                                                            <span className='text-sm text-gray-500 dark:text-gray-400 line-through'>
                                                                {formatCurrency(product.oldPrice)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stock Status */}
                                                <div className='mb-4'>
                                                    {product.stock > 0 ? (
                                                        <div className='flex items-center text-green-600 dark:text-green-400 text-sm'>
                                                            <div className='w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse'></div>
                                                            Còn hàng ({product.stock} sản phẩm)
                                                        </div>
                                                    ) : (
                                                        <div className='flex items-center text-red-600 dark:text-red-400 text-sm'>
                                                            <div className='w-2 h-2 bg-red-500 rounded-full mr-2'></div>
                                                            Hết hàng
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Sold Count */}

                                                <div className='mb-4 text-xs text-gray-500 dark:text-gray-400'>
                                                    Đã bán: {product.soldCount || 0} sản phẩm
                                                </div>


                                                {/* Action Buttons */}
                                                <div className='flex space-x-2'>
                                                    <Link href={`/product/${product._id}`} className='flex-1'>
                                                        <Button
                                                            type="primary"
                                                            block
                                                            icon={<EyeOutlined />}
                                                            className='bg-gradient-to-r from-blue-500 to-blue-600 border-none hover:from-blue-600 hover:to-blue-700'
                                                        >
                                                            Xem chi tiết
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        type="default"
                                                        icon={<ShoppingCartOutlined />}
                                                        disabled={product.stock === 0}
                                                        onClick={() => handleAddToCart(product)}
                                                        className='hover:border-green-500 hover:text-green-500'
                                                    >
                                                        Giỏ hàng
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Additional Info */}
                        <div className='mt-6 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4'>
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                <i className="fas fa-lightbulb mr-2"></i>
                                Mẹo sử dụng:
                            </h3>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                <li>• Thêm sản phẩm vào danh sách yêu thích để theo dõi giá và tình trạng hàng</li>
                                <li>• Bạn sẽ nhận được thông báo khi sản phẩm có khuyến mãi</li>
                                <li>• Danh sách yêu thích giúp bạn so sánh và quyết định mua hàng dễ dàng hơn</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}