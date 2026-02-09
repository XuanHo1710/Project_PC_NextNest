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
        <div className={`card rounded-lg flex flex-col max-h-max bg-white dark:bg-gray-900 p-2 dark:text-white ${css}`}>
            {/* Product Image */}
            <div className="card-img w-full hover:-translate-y-2 transition-all">
                <Image
                    src={productImage}
                    width="100%"
                    height={200}
                    alt={product.name}
                    className="img-thumbnail object-contain"
                    fallback="/placeholder-product.png"
                />
            </div>

            {/* Product Info */}
            <div className="card-content mb-3 text-center">
                <Link href={`/product/${product.slug}`}>
                    <h2 className="font-medium cursor-pointer min-h-12 hover:text-blue-500 text-sm lg:text-base line-clamp-2">
                        {product.name}
                    </h2>
                </Link>

                {/* Display Price (after discount) */}
                <h2 className="font-bold cursor-default text-xl my-1 text-blue-400">
                    {displayPrice.toLocaleString('vi-VN')} đ
                </h2>

                {/* Original Price & Discount */}
                {discount > 0 && (
                    <div className="font-medium cursor-default text-xs my-1">
                        <span className="line-through text-slate-400 mr-2">
                            {originalPrice.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="block lg:inline-block text-red-500">
                            (Tiết kiệm {discount.toFixed(0)}%)
                        </span>
                    </div>
                )}

                {/* Brand info (if available) */}
                {product.brand && (
                    <p className="text-xs text-gray-500 mt-1">
                        {product.brand.name}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="card-footer flex items-center justify-between mt-auto">
                <div className="status text-xs md:text-base cursor-default">
                    <div className="flex items-center text-green-600">
                        <i className="fa-regular fa-circle-check mr-2"></i>
                        <p>Còn hàng</p>
                    </div>
                    <div className="flex items-center">
                        <i className="fa-solid fa-gift mr-2"></i>
                        <p>Quà tặng</p>
                    </div>
                </div>

                <div
                    onClick={handleAddToCart}
                    className="hover:bg-blue-500 transition-all text-base max-h-max py-2.5 bg-blue-400 rounded-2xl cart-icon flex items-center px-3 xl:px-5 cursor-pointer text-white"
                >
                    <i className="fa-solid fa-cart-shopping"></i>
                </div>
            </div>
        </div>
    );
};

export default CardProduct;