import { ICartItem } from "@/types/order";
import { formatCurrencyVND } from "@/utils/productHelpers";
import { Button, Image, Tag, Popconfirm } from "antd"
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import Link from "next/link";


interface CartProductProps {
    cartItem: ICartItem;
    handle: {
        removeFromCart: (variantId: string) => void;
        updateQuantity: (variantId: string, delta: number) => void;
    };
}

const CartProduct = ({ cartItem, handle }: CartProductProps) => {
    const { product, variant, quantity, price, subtotal } = cartItem;

    // Handle deleted/non-existent variant
    if (!variant || !variant._id) {
        return (
            <div className="group relative flex gap-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 flex items-center justify-center">
                    <DeleteOutlined className="text-2xl text-gray-300" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm md:text-base font-medium text-red-500">
                                Sản phẩm này hiện không tồn tại
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Sản phẩm đã bị xóa hoặc không còn bán. Vui lòng xóa khỏi giỏ hàng.
                            </p>
                        </div>
                        <Popconfirm
                            title="Xóa sản phẩm"
                            description="Xóa sản phẩm không tồn tại khỏi giỏ hàng?"
                            onConfirm={() => handle.removeFromCart(cartItem?.variant?._id || '')}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger size="small" icon={<DeleteOutlined />} className="flex-shrink-0">
                                Xóa
                            </Button>
                        </Popconfirm>
                    </div>
                </div>
            </div>
        );
    }

    const displayImage = variant.images?.[0] || "/placeholder-product.png";
    const originalPrice = variant.price;
    const hasDiscount = variant.discount > 0;

    return (
        <div className="group relative flex gap-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-750">
            {/* Product Image */}
            <Link href={`/product/${product.slug}`} className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50">
                    <Image
                        alt={product.name}
                        width="100%"
                        height="100%"
                        src={displayImage}
                        fallback="/placeholder-product.png"
                        className="!object-contain"
                        preview={false}
                    />
                </div>
            </Link>

            {/* Product Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                {/* Top Row: Name + Delete */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <Link href={`/product/${product.slug}`}>
                            <h3 className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-100 hover:text-blue-500 transition-colors line-clamp-2 leading-snug">
                                {product.name}
                            </h3>
                        </Link>

                        {/* Variant Tags */}
                        {variant.combination && Object.keys(variant.combination).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {Object.entries(variant.combination).map(([key, val]) => (
                                    <Tag key={key} color="blue" className="!text-xs !m-0 !rounded-md">
                                        {val}
                                    </Tag>
                                ))}
                            </div>
                        )}
                    </div>
                    <Popconfirm
                        title="Xóa sản phẩm"
                        description="Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?"
                        onConfirm={() => handle.removeFromCart(variant._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <button className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all cursor-pointer">
                            <DeleteOutlined className="text-base" />
                        </button>
                    </Popconfirm>
                </div>

                {/* Bottom Row: Price + Quantity + Subtotal */}
                <div className="flex items-end justify-between mt-2 gap-3">
                    {/* Unit Price */}
                    <div className="flex-shrink-0">
                        <p className="font-semibold text-sm md:text-base text-blue-600 dark:text-blue-400">
                            {formatCurrencyVND(price)}
                        </p>
                        {hasDiscount && (
                            <div className="flex items-center gap-1.5">
                                <p className="text-xs line-through text-gray-400">{formatCurrencyVND(originalPrice)}</p>
                                <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-1 py-0.5 rounded">
                                    -{variant.discount}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                            <button
                                onClick={() => handle.updateQuantity(variant._id, -1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                disabled={quantity <= 1}
                            >
                                <MinusOutlined className="text-xs" />
                            </button>
                            <span className="w-10 h-8 flex items-center justify-center text-sm font-medium bg-gray-50 dark:bg-gray-700 dark:text-white border-x border-gray-200 dark:border-gray-600">
                                {quantity}
                            </span>
                            <button
                                onClick={() => handle.updateQuantity(variant._id, 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                disabled={quantity >= variant.stock}
                            >
                                <PlusOutlined className="text-xs" />
                            </button>
                        </div>
                        {variant.stock > 0 && variant.stock <= 5 && (
                            <p className="text-[10px] text-orange-500 font-medium">Còn {variant.stock} sp</p>
                        )}
                    </div>

                    {/* Subtotal */}
                    <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">Thành tiền</p>
                        <p className="font-bold text-sm md:text-base text-red-500">{formatCurrencyVND(subtotal)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartProduct