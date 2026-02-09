// services/cart.client.service.ts
import axios from "@/config/axiosClient";
import { ICart, ICartItem } from "@/types/order";

class CartClientService {
  /**
   * Sync cart to server.
   * Backend uses guestId for upsert → always 1 cart per guest.
   * Sends variant._id as product._id to match backend schema (ProductVariant ref).
   * Returns the server cart _id for store update.
   */
  async updateCart(cart: ICart): Promise<string | undefined> {
    const guestId = cart.guestId;
    if (!guestId) return undefined;

    const payload = {
      guestId,
      cartItems: cart.cartItems.map((item) => ({
        product: { _id: item.variant._id },
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      total: cart.total,
    };

    // Always use guestId in URL → backend upserts by guestId
    const response = await axios.patch(`/cart/${guestId}`, payload);
    const serverCart = response.data || response;
    return serverCart?._id;
  }

  /**
   * Get cart for a guest user.
   * Server returns populated ProductVariant as `product` in each cart item.
   * We transform this back to our frontend ICart structure.
   * Important: product.name must come from the Product entity, NOT the SKU or combination.
   */
  async getOne(guestId: string): Promise<ICart | null> {
    try {
      const response = await axios.get(`/cart/${guestId}`);
      const serverCart = response.data || response;

      if (!serverCart || !serverCart.cartItems) return null;

      // Transform server cart items to frontend ICartItem structure
      const cartItems: ICartItem[] = serverCart.cartItems
        .map((item: any) => {
          // Server populates cartItems.product → ProductVariant doc
          const variant = item.product;
          if (!variant || typeof variant === "string") return null;

          // ProductVariant may have nested `product` (Product doc) if deep populated
          const productData = variant.product;

          // Ensure we have valid product name from Product entity
          let productName = "";
          let productId = "";
          let productSlug = "";

          if (
            productData &&
            typeof productData === "object" &&
            productData._id
          ) {
            // Deep populated: we have full Product object
            productName = productData.name || "Sản phẩm";
            productId = productData._id;
            productSlug = productData.slug || "";
          } else if (typeof productData === "string") {
            // Only have Product ID as string, need to use default name
            productName = "Sản phẩm";
            productId = productData;
            productSlug = "";
          } else {
            // No product data at all
            productName = "Sản phẩm";
            productId = variant._id;
            productSlug = "";
          }

          return {
            product:
              productData && typeof productData === "object"
                ? {
                    _id: productData._id,
                    name: productData.name || "Sản phẩm",
                    slug: productData.slug || "",
                    brand: productData.brand,
                    category: productData.category,
                    defaultVariant: {
                      _id: variant._id,
                      sku: variant.sku,
                      price: variant.price,
                      discount: variant.discount,
                      images: variant.images || [],
                      combination: variant.combination || {},
                      stock: variant.stock,
                    },
                  }
                : {
                    // Fallback: construct minimal product info without SKU as name
                    _id: productId || variant._id,
                    name: productName,
                    slug: productSlug,
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
        })
        .filter(Boolean) as ICartItem[];

      return {
        _id: serverCart._id,
        cartItems,
        total: serverCart.total || 0,
        guestId: serverCart.guestId?.toString() || guestId,
      };
    } catch {
      return null;
    }
  }
}

export const cartClientService = new CartClientService();
