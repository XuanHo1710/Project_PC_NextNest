// services/cart.client.service.ts
import axios from "@/config/axiosClient";
import { ICart, ICartItem } from "@/types/order";

class CartClientService {
  /**
   * Sync cart to server.
   * Backend uses guestId for upsert → always 1 cart per guest.
   * Each cartItem.product is the variant ObjectId (ProductVariant ref on backend).
   * Returns the server cart _id for store update.
   */
  async updateCart(cart: ICart): Promise<string | undefined> {
    const guestId = cart.guestId;
    if (!guestId) return undefined;

    // Deduplicate by variant._id before sending — same variant = sum quantities
    const deduped = this.deduplicateItems(cart.cartItems);

    const payload = {
      guestId,
      cartItems: deduped.map((item) => ({
        product: { _id: item.variant._id }, // variant._id → ProductVariant ObjectId
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      total: deduped.reduce((sum, i) => sum + i.subtotal, 0),
    };

    const response = await axios.patch(`/cart/${guestId}`, payload);
    const serverCart = response.data || response;
    return serverCart?._id;
  }

  /**
   * Get cart for a guest user.
   * Server returns populated ProductVariant as `product` in each cart item.
   * Transform back to frontend ICartItem structure with product + variant separation.
   */
  async getOne(guestId: string): Promise<ICart | null> {
    try {
      const response = await axios.get(`/cart/${guestId}`);
      const serverCart = response.data || response;

      if (!serverCart || !serverCart.cartItems) return null;

      const cartItems: ICartItem[] = serverCart.cartItems
        .map((item: any) => this.transformServerItem(item))
        .filter(Boolean) as ICartItem[];

      // Deduplicate by variant._id (safety net)
      const dedupedItems = this.deduplicateItems(cartItems);

      return {
        _id: serverCart._id,
        cartItems: dedupedItems,
        total: serverCart.total || 0,
        guestId: serverCart.guestId?.toString() || guestId,
      };
    } catch {
      return null;
    }
  }

  /**
   * Transform a single server cart item (populated ProductVariant) to frontend ICartItem.
   * Server shape: { product: ProductVariant (populated), quantity, price, subtotal }
   * ProductVariant may have nested `.product` (Product doc) from deep populate.
   */
  private transformServerItem(item: any): ICartItem | null {
    const variant = item.product;
    if (!variant || typeof variant === "string") return null;

    // ProductVariant may have nested `product` (Product doc) if deep populated
    const productData = variant.product;

    // Build product info from the nested Product entity
    const productInfo =
      productData && typeof productData === "object" && productData._id
        ? {
            _id: productData._id,
            name: productData.name || "Sản phẩm",
            slug: productData.slug || "",
            brand: productData.brand,
            category: productData.category,
          }
        : {
            _id: typeof productData === "string" ? productData : variant._id,
            name: "Sản phẩm",
            slug: "",
          };

    return {
      product: {
        ...productInfo,
        defaultVariant: {
          _id: variant._id,
          sku: variant.sku,
          price: variant.price,
          discount: variant.discount,
          images: variant.images || [],
          combination: variant.combination || {},
          stock: variant.stock,
        },
      },
      variant: {
        _id: variant._id,
        sku: variant.sku || "",
        price: variant.price || 0,
        discount: variant.discount || 0,
        stock: variant.stock || 0,
        images: variant.images || [],
        combination: variant.combination || {},
      },
      quantity: item.quantity || 1,
      price: item.price || 0,
      subtotal: item.subtotal || 0,
    } as ICartItem;
  }

  /**
   * Deduplicate cart items by variant._id.
   * If two items reference the same variant, merge their quantities.
   * This guarantees: 1 variant = 1 line item.
   */
  private deduplicateItems(items: ICartItem[]): ICartItem[] {
    const map = new Map<string, ICartItem>();

    for (const item of items) {
      const key = item.variant._id;
      if (!key) continue;

      const existing = map.get(key);
      if (existing) {
        // Same variant → merge quantities (cap at stock)
        const mergedQty = Math.min(
          existing.quantity + item.quantity,
          item.variant.stock || Infinity,
        );
        existing.quantity = mergedQty;
        existing.subtotal = mergedQty * existing.price;
      } else {
        map.set(key, { ...item });
      }
    }

    return Array.from(map.values());
  }
}

export const cartClientService = new CartClientService();
