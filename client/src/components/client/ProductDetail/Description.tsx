'use client';

import { IProductCard } from "@/types/product";

export default function DescriptionProduct({ product }: { product: IProductCard }) {
    if (!product.description) {
        return (
            <div className="prose max-w-none dark:prose-invert">
                <p className="text-gray-500 dark:text-gray-400 italic">Chưa có mô tả sản phẩm.</p>
            </div>
        );
    }

    return (
        <div
            className="prose max-w-none dark:prose-invert wrap-break-word text-lg"
            dangerouslySetInnerHTML={{ __html: product.description }}
        />
    );
}