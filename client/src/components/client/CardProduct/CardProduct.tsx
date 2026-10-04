'use client';

import useCartStore from "@/hooks/useCart";
import { IProductCard } from "@/types/product";
import {
    getProductDisplayPrice,
    getProductOriginalPrice,
    getProductDiscount,
    getProductImage,
    getDefaultCartVariant
} from "@/utils/productHelpers";
import { Image, message } from "antd";
import Link from "next/link";
import Swal from "sweetalert2";

interface CardProductProps {
    product: IProductCard;
    css?: string;
}

const CardProduct = ({ product, css = '' }: CardProductProps) => {
    const { addToCart } = useCartStore();

    const displayPrice = getProductDisplayPrice(product);
    const originalPrice = getProductOriginalPrice(product);
    const discount = getProductDiscount(product);
    const productImage = getProductImage(product);

    const handleAddToCart = () => {
        const variant = getDefaultCartVariant(product);
        if (!variant) {
            message.warning('Sản phẩm không có phiên bản khả dụng!');
            return;
        }
        if (variant.stock <= 0) {
            message.error('Sản phẩm đã hết hàng!');
            return;
        }
        Swal.fire({
            icon: "success",
            title: "Thêm sản phẩm vào giỏ hàng thành công!",
            showConfirmButton: false,
            timer: 2000,
            background: "#fff",
            color: "#000",
            iconColor: "#52c41a",
            customClass: {
                title: "!text-2xl",
            },
        });

        addToCart(product, variant);
    };

    return (
        <div className={`card rounded-lg flex flex-col bg-white dark:bg-gray-900 p-1.5 sm:p-2 md:p-3 dark:text-white ${css}`}>
            {/* Product Image */}
            <div className="card-img w-full hover:-translate-y-2 transition-all">
                <Image
                    src={productImage}
                    width="100%"
                    height={180}
                    alt={product.name}
                    className="img-thumbnail object-contain"
                    fallback="/placeholder-product.png"
                />
            </div>

            {/* Product Info */}
            <div className="card-content mb-2 sm:mb-3 text-center">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium cursor-pointer hover:text-blue-500 text-xs sm:text-sm lg:text-base line-clamp-2" style={{ minHeight: '2.5em' }}>
                        {product.name}
                    </h3>
                </Link>

                {/* Display Price (after discount) */}
                <p className="font-bold cursor-default text-sm sm:text-base md:text-xl my-1 text-blue-400">
                    {displayPrice.toLocaleString('vi-VN')} đ
                </p>

                {/* Original Price & Discount */}
                {discount > 0 && (
                    <div className="font-medium cursor-default text-[10px] sm:text-xs my-1">
                        <span className="line-through text-slate-400 mr-1 sm:mr-2">
                            {originalPrice.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="block text-red-500">
                            (Tiết kiệm {discount.toFixed(0)}%)
                        </span>
                    </div>
                )}

                {/* Brand info (if available) */}
                {product.brand && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                        {product.brand.name}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="card-footer flex items-center justify-between mt-auto gap-1">
                <div className="status text-[10px] sm:text-xs md:text-sm cursor-default min-w-0 flex-1">
                    <div className="flex items-center text-green-600">
                        <i className="fa-regular fa-circle-check mr-1 sm:mr-2 shrink-0"></i>
                        <p>Còn hàng</p>
                    </div>
                    <div className="flex items-center">
                        <i className="fa-solid fa-gift mr-1 sm:mr-2 shrink-0"></i>
                        <p>Quà tặng</p>
                    </div>
                </div>

                <div
                    onClick={handleAddToCart}
                    className="hover:bg-blue-500 transition-all text-sm sm:text-base py-2 sm:py-2.5 bg-blue-400 rounded-2xl cart-icon flex items-center px-2.5 sm:px-3 xl:px-5 cursor-pointer text-white shrink-0"
                >
                    <i className="fa-solid fa-cart-shopping"></i>
                </div>
            </div>
        </div>
    );
};

export default CardProduct;