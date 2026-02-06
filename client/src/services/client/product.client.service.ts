import axiosClient from "@/config/axiosClient";
import {
  IProductPopulated,
  IProductCard,
  IProductListResponse,
  IProductVariant,
} from "@/types";
import { ICategory } from "@/types/category";
import { IBrand } from "@/types/brand";
import {
  IProductInteraction,
  ICreateProductInteraction,
} from "@/types/interaction";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

class ProductClientService {
  private baseURL = "/products";
  private categoryURL = "/categories";
  private brandURL = "/brands";

  // ============== PRODUCT APIs ==============

  /**
   * Get all products with pagination and filters
   * Populates: brand, category, defaultProductVariantId
   */
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: "ACTIVE" | "INACTIVE";
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<IProductListResponse> {
    const response = await axiosClient.get(this.baseURL, { params });
    return response as unknown as IProductListResponse;
  }

  /**
   * Get single product by ID with all relations populated
   */
  async getProductById(id: string): Promise<IProductPopulated> {
    const response = await axiosClient.get(`${this.baseURL}/${id}`);
    return response as unknown as IProductPopulated;
  }

  /**
   * Get single product by slug with all relations populated
   */
  async getProductBySlug(slug: string): Promise<IProductPopulated> {
    const response = await axiosClient.get(`${this.baseURL}/slug/${slug}`);
    return response as unknown as IProductPopulated;
  }

  /**
   * Get featured products for homepage
   */
  async getFeaturedProducts(limit: number = 8): Promise<IProductCard[]> {
    const response = await axiosClient.get(`${this.baseURL}/featured`, {
      params: { limit },
    });
    return response as unknown as IProductCard[];
  }

  /**
   * Get related products by product ID
   */
  async getRelatedProducts(
    productId: string,
    limit: number = 4,
  ): Promise<IProductCard[]> {
    const response = await axiosClient.get(
      `${this.baseURL}/${productId}/related`,
      {
        params: { limit },
      },
    );
    return response as unknown as IProductCard[];
  }

  /**
   * Search products by query
   */
  async searchProducts(
    query: string,
    limit: number = 10,
  ): Promise<IProductCard[]> {
    const response = await axiosClient.get(`${this.baseURL}/search`, {
      params: { q: query, limit },
    });
    return response as unknown as IProductCard[];
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit: number = 8): Promise<IProductCard[]> {
    const response = await axiosClient.get(`${this.baseURL}/new-arrivals`, {
      params: { limit },
    });
    return response as unknown as IProductCard[];
  }

  /**
   * Get best sellers
   */
  async getBestSellers(limit: number = 8): Promise<IProductCard[]> {
    const response = await axiosClient.get(`${this.baseURL}/best-sellers`, {
      params: { limit },
    });
    return response as unknown as IProductCard[];
  }

  /**
   * Get banner/feature products for homepage
   * @param type - Filter type: '', 'aio', 'pc', 'screen', 'discount'
   */
  async getBannerProducts(type: string = ""): Promise<IProductCard[]> {
    const response = await axiosClient.get(`${this.baseURL}/banner`, {
      params: { type },
    });
    return response as unknown as IProductCard[];
  }

  // ============== BACKWARD COMPATIBLE METHODS ==============

  /**
   * Get product by slug (alias for getProductBySlug)
   * Used by product detail page
   */
  async getProductsBySlug(slug: string): Promise<IProductCard> {
    const response = await axiosClient.get(`${this.baseURL}/slug/${slug}`);
    return response as unknown as IProductCard;
  }

  /**
   * Get products by category ID with optional filters
   */
  async getProductsByCategoryId(
    categoryId: string,
    page?: number,
    sort?: string,
    cpu?: string,
    ram?: string,
    price?: string,
  ): Promise<IProductListResponse> {
    const response = await axiosClient.get(`${this.baseURL}`, {
      params: { category: categoryId, page, sort, cpu, ram, price },
    });
    return response as unknown as IProductListResponse;
  }

  // ============== WISHLIST APIS ==============

  /**
   * Check if product is in user wishlist
   */
  async isWishlistByGuestAndProduct(
    guestId: string,
    productId: string,
  ): Promise<{ isWishlisted: boolean }> {
    const response = await axiosClient.get(
      `/guest/profile/${guestId}/wishlist/check/${productId}`,
    );
    return response as unknown as { isWishlisted: boolean };
  }

  /**
   * Add/Remove product from wishlist
   */
  async handleWishlist(
    guestId: string,
    productId: string,
    isWishlist: boolean,
  ): Promise<unknown> {
    if (isWishlist) {
      // Add to wishlist
      const response = await axiosClient.post(
        `/guest/profile/${guestId}/wishlist/${productId}`,
      );
      return response;
    } else {
      // Remove from wishlist
      const response = await axiosClient.delete(
        `/guest/profile/${guestId}/wishlist/${productId}`,
      );
      return response;
    }
  }

  /**
   * Get user wishlist
   */
  async getWishlist(guestId: string): Promise<IProductCard[]> {
    const response = await axiosClient.get(
      `/guest/profile/${guestId}/wishlist`,
    );
    return response as unknown as IProductCard[];
  }

  // ============== PRODUCT VARIANTS ==============

  /**
   * Get all variants of a product
   */
  async getProductVariants(productId: string): Promise<IProductVariant[]> {
    const response = await axiosClient.get(
      `${this.baseURL}/${productId}/variants`,
    );
    return response as unknown as IProductVariant[];
  }

  /**
   * Find variant by combination (e.g., { color: 'red', size: 'M' })
   */
  async getVariantByCombination(
    productId: string,
    combination: Record<string, string>,
  ): Promise<IProductVariant | null> {
    const response = await axiosClient.post(
      `${this.baseURL}/${productId}/variants/find`,
      {
        combination,
      },
    );
    return response as unknown as IProductVariant | null;
  }

  // ============== CATEGORIES ==============

  /**
   * Get all categories (optionally filtered by parent)
   */
  async getCategories(parentId?: string | null): Promise<ICategory[]> {
    const response = await axiosClient.get(this.categoryURL, {
      params: { parentId },
    });
    return response as unknown as ICategory[];
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<ICategory> {
    const response = await axiosClient.get(`${this.categoryURL}/${id}`);
    return response as unknown as ICategory;
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<ICategory> {
    const response = await axiosClient.get(`${this.categoryURL}/slug/${slug}`);
    return response as unknown as ICategory;
  }

  /**
   * Get category tree (nested structure)
   */
  async getCategoryTree(): Promise<ICategory[]> {
    const response = await axiosClient.get(`${this.categoryURL}/tree`);
    return response as unknown as ICategory[];
  }

  // ============== BRANDS ==============

  /**
   * Get all brands
   */
  async getBrands(): Promise<IBrand[]> {
    const response = await axiosClient.get(this.brandURL);
    return response as unknown as IBrand[];
  }

  /**
   * Get brand by ID
   */
  async getBrandById(id: string): Promise<IBrand> {
    const response = await axiosClient.get(`${this.brandURL}/${id}`);
    return response as unknown as IBrand;
  }

  // ============== PRODUCT INTERACTIONS ==============

  /**
   * Get product comments/reviews
   */
  async getProductComments(
    productId: string,
    page?: number,
    limit?: number,
  ): Promise<unknown> {
    const response = await axiosClient.get(
      `/product-interaction/${productId}`,
      {
        params: { page, limit },
      },
    );
    return response;
  }

  /**
   * Create a product comment/review
   */
  async createProductComment(data: {
    productId: string;
    guestId: string;
    content: string;
    rating: number;
    images?: string[];
  }): Promise<unknown> {
    const response = await axiosClient.post("/product-interaction", data);
    return response;
  }

  /**
   * Reply to a comment
   */
  async replyToComment(data: {
    guestId: string;
    productId: string;
    guestReplyId: string;
    content: string;
    images?: string[];
    isAdminReply?: boolean;
  }): Promise<unknown> {
    const response = await axiosClient.post("/product-interaction/reply", data);
    return response;
  }

  /**
   * Like/Dislike a comment
   */
  async interactCommentProduct(
    commentId: string,
    guestIdInteractedBy: string,
    isLike: boolean,
  ): Promise<unknown> {
    const response = await axiosClient.post("/product-interaction/interact", {
      commentId,
      guestIdInteractedBy,
      isLike,
    });
    return response;
  }

  // ============== BACKWARD COMPATIBLE ALIASES ==============

  /**
   * Get comments for product (alias for getProductComments)
   * Used by Comment.tsx
   */
  async getCommentOfProduct(
    productId: string,
    page?: number,
    limit?: number,
  ): Promise<IProductInteraction> {
    const response = await axiosClient.get(
      `/product-interaction/${productId}`,
      {
        params: { page, limit },
      },
    );
    return response as unknown as IProductInteraction;
  }

  /**
   * Post comment on product (alias for createProductComment)
   * Used by Comment.tsx
   */
  async postCommentOnProduct(
    data: ICreateProductInteraction,
  ): Promise<unknown> {
    const response = await axiosClient.post("/product-interaction", data);
    return response;
  }

  /**
   * Reply to a comment (formatted for Comment.tsx)
   */
  async replyCommentProduct(
    commentId: string,
    guestReplyId: string,
    content: string,
    images: string[],
    isAdminReply?: boolean,
  ): Promise<unknown> {
    const response = await axiosClient.post("/product-interaction/reply", {
      commentId,
      guestReplyId,
      content,
      images,
      isAdminReply,
    });
    return response;
  }
}

export const productClientService = new ProductClientService();
