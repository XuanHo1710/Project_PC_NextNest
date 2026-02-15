'use client';

import { IProductVariantSearchResult } from "@/types/product";
import { formatCurrencyVND } from "@/utils/productHelpers";
import { Image } from "antd";
import Link from "next/link";

interface CardProductVariantProps {
    variant: IProductVariantSearchResult;
    css?: string;
}

const CardProductVariant = ({ variant, css = '' }: CardProductVariantProps) => {
    const displayPrice = variant.displayPrice || variant.price * (1 - (variant.discount || 0) / 100);
    const originalPrice = variant.price;
    const discount = variant.discount || 0;
    const productImage = variant.images?.[0] || '/placeholder-product.png';
    const combination = variant.combination || {};

    return (
        <div className={`card rounded-lg flex flex-col max-h-max bg-white dark:bg-gray-900 p-2 dark:text-white ${css}`}>
            {/* Product Image */}
            <div className="card-img w-full hover:-translate-y-2 transition-all">
                <Link href={`/product/${variant.productSlug}`}>
                    <Image
                        src={productImage}
                        width="100%"
                        height={200}
                        alt={variant.productName}
                        className="img-thumbnail object-contain"
                        fallback="/placeholder-product.png"
                        preview={false}
                    />
                </Link>
            </div>

            {/* Product Info */}
            <div className="card-content mb-2 text-center">
                <Link href={`/product/${variant.productSlug}`}>
                    <h2 className="font-medium cursor-pointer min-h-12 hover:text-blue-500 text-sm lg:text-base line-clamp-2">
                        {variant.productName}
                    </h2>
                </Link>

                {/* Combination Tags */}
                {Object.keys(combination).length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center my-1.5">
                        {Object.entries(combination).map(([key, value]) => (
                            <span
                                key={key}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            >
                                <span className="font-semibold mr-0.5">{key}:</span> {value}
                            </span>
                        ))}
                    </div>
                )}

                {/* Display Price (after discount) */}
                <h2 className="font-bold cursor-default text-xl my-1 text-blue-400">
                    {formatCurrencyVND(Math.round(displayPrice))}
                </h2>

                {/* Original Price & Discount */}
                {discount > 0 && (
                    <div className="font-medium cursor-default text-xs my-1">
                        <span className="line-through text-slate-400 mr-2">
                            {formatCurrencyVND(originalPrice)}
                        </span>
                        <span className="block lg:inline-block text-red-500">
                            (Tiết kiệm {discount.toFixed(0)}%)
                        </span>
                    </div>
                )}

                {/* Brand info */}
                {variant.brandName && (
                    <p className="text-xs text-gray-500 mt-1">
                        {variant.brandName}
                    </p>
                )}

                {/* Category info */}
                {variant.categoryName && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                        {variant.categoryName}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="card-footer flex items-center justify-between mt-auto px-1 pb-1">
                <div className="status text-xs cursor-default">
                    {variant.stock > 0 ? (
                        <div className="flex items-center text-green-600">
                            <i className="fa-regular fa-circle-check mr-1"></i>
                            <p>Còn hàng ({variant.stock})</p>
                        </div>
                    ) : (
                        <div className="flex items-center text-red-500">
                            <i className="fa-regular fa-circle-xmark mr-1"></i>
                            <p>Hết hàng</p>
                        </div>
                    )}
                </div>

                <Link
                    href={`/product/${variant.productSlug}`}
                    className="hover:bg-blue-500 transition-all text-sm max-h-max py-2 bg-blue-400 rounded-xl cart-icon flex items-center px-3 cursor-pointer text-white"
                >
                    <i className="fa-solid fa-eye mr-1"></i>
                    Xem
                </Link>
            </div>
        </div>
    );
};

export default CardProductVariant;
