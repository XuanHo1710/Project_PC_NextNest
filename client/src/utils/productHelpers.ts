import type { IProductCard } from "@/types/product";

/**
 * Product helper functions for IProductCard
 * These compute display values from the microservice variant-based structure.
 * All product data comes from defaultVariant (price, discount, images).
 */

/** Get the final price after discount */
export function getProductDisplayPrice(product: IProductCard): number {
  if (!product) return 0;
  if (product.defaultVariant) {
    const { price, discount } = product.defaultVariant;
    return Math.round(price * (1 - discount / 100));
  }
  return product.minPrice || 0;
}

/** Get the original price (before discount) */
export function getProductOriginalPrice(product: IProductCard): number {
  if (!product) return 0;
  if (product.defaultVariant) {
    return product.defaultVariant.price;
  }
  return product.maxPrice || 0;
}

/** Get the discount percentage (0-100) */
export function getProductDiscount(product: IProductCard): number {
  if (!product) return 0;
  if (product.defaultVariant) {
    return product.defaultVariant.discount;
  }
  return 0;
}

/** Get the primary display image */
export function getProductImage(product: IProductCard): string {
  if (!product) return "/placeholder-product.png";
  if (product.defaultVariant?.images?.length) {
    return product.defaultVariant.images[0];
  }
  return "/placeholder-product.png";
}

/** Get all product images */
export function getProductImages(product: IProductCard): string[] {
  if (!product) return [];
  if (product.defaultVariant?.images?.length) {
    return product.defaultVariant.images;
  }
  return [];
}

/** Get stock from defaultVariant */
export function getProductStock(product: IProductCard): number {
  if (!product) return 0;
  return product.defaultVariant?.stock ?? 0;
}

/** Format currency in VND */
export function formatCurrencyVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + " đ";
}

/**
 * Build a cart-compatible variant object from product's defaultVariant.
 * Used when adding to cart from listing/grid pages without explicit variant selection.
 */
export function getDefaultCartVariant(product: IProductCard) {
  if (!product?.defaultVariant) return null;
  const dv = product.defaultVariant;
  return {
    _id: dv._id,
    sku: dv.sku || "",
    price: dv.price,
    discount: dv.discount,
    stock: dv.stock ?? 0,
    images: dv.images || [],
    combination: dv.combination || {},
  };
}
