import axiosClient from "@/config/axiosClient";
import {
  IProductPopulated,
  IProductCard,
  IProductListResponse,
  IProductVariant,
  APIResponse,
} from "@/types";
import { ICategory } from "@/types/category";
import { IBrand } from "@/types/brand";
import {
  IProductInteraction,
  ICreateProductInteraction,
} from "@/types/interaction";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ProductClientService {
  private baseURL = "/product";
  private categoryURL = "/category";
  private brandURL = "/brand";

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
    return response.data;
  }

  /**
   * Get single product by slug with all relations populated
   * Uses microservice gateway route: /client/product/slug/:slug
   */
  async getProductBySlug(slug: string): Promise<IProductPopulated> {
    const response = await axiosClient.get(`/product/slug/${slug}`);
    return response.data;
  }

  /**
   * Get featured products for homepage
   */
  async getFeaturedProducts(limit: number = 8): Promise<IProductCard[]> {
    const response = await axiosClient.get(`${this.baseURL}/featured`, {
      params: { limit },
    });
    return response.data;
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
    return response.data;
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
    return response.data;
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit: number = 8): Promise<IProductCard[]> {
    const response = await axiosClient.get(`${this.baseURL}/new-arrivals`, {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Get best sellers
   */
  async getBestSellers(limit: number = 8): Promise<IProductCard[]> {
    const response = await axiosClient.get(`${this.baseURL}/best-sellers`, {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Get banner/feature products for homepage
   * @param type - Filter type: '', 'aio', 'pc', 'screen', 'discount'
   */
  async getBannerProducts(type: string = ""): Promise<IProductCard[]> {
    const response = await axiosClient.get(`${this.baseURL}/banner`, {
      params: { type },
    });
    return response.data;
  }

  // ============== BACKWARD COMPATIBLE METHODS ==============

  /**
   * Get product by slug (alias for getProductBySlug)
   * Used by product detail page — routes to microservice gateway
   */
  async getProductsBySlug(slug: string): Promise<IProductCard> {
    const response = await axiosClient.get(`/product/slug/${slug}`);
    return response.data;
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
    return response.data;
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
    return response.data;
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
      return response.data;
    } else {
      // Remove from wishlist
      const response = await axiosClient.delete(
        `/guest/profile/${guestId}/wishlist/${productId}`,
      );
      return response.data;
    }
  }

  /**
   * Get user wishlist
   */
  async getWishlist(guestId: string): Promise<IProductCard[]> {
    const response = await axiosClient.get(
      `/guest/profile/${guestId}/wishlist`,
    );
    return response.data;
  }

  // ============== PRODUCT VARIANTS ==============

  /**
   * Get all variants of a product
   */
  async getProductVariants(productId: string): Promise<IProductVariant[]> {
    const response = await axiosClient.get(
      `${this.baseURL}/${productId}/variants`,
    );
    return response.data;
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
    return response.data;
  }

  // ============== CATEGORIES ==============

  /**
   * Get all categories (optionally filtered by parent)
   */
  async getCategories(parentId?: string | null): Promise<ICategory[]> {
    const response = await axiosClient.get(this.categoryURL, {
      params: { parentId },
    });
    return response.data;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<ICategory> {
    const response = await axiosClient.get(`${this.categoryURL}/${id}`);
    return response.data;
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<ICategory> {
    const response = await axiosClient.get(`${this.categoryURL}/slug/${slug}`);
    return response.data;
  }

  /**
   * Get category tree (nested structure)
   */
  async getCategoryTree(): Promise<ICategory[]> {
    const response = await axiosClient.get(`${this.categoryURL}/tree`);
    return response.data;
  }

  // ============== BRANDS ==============

  /**
   * Get all brands
   */
  async getBrands(): Promise<IBrand[]> {
    const response = await axiosClient.get(this.brandURL);
    return response.data;
  }

  /**
   * Get brand by ID
   */
  async getBrandById(id: string): Promise<IBrand> {
    const response = await axiosClient.get(`${this.brandURL}/${id}`);
    return response.data;
  }

  /**
   * Get brand by slug
   */
  async getBrandBySlug(slug: string): Promise<IBrand> {
    const response = await axiosClient.get(`${this.brandURL}/slug/${slug}`);
    return response.data;
  }

  // ============== COLLECTION ==============

  /**
   * Get products by collection slug (matches both category & brand slugs)
   * Uses $or query on backend
   */
  async getCollectionProducts(
    slug: string,
    page = 1,
    limit = 12,
    sort?: string,
    cpu?: string,
    ram?: string,
  ): Promise<{
    items: IProductCard[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    collectionInfo: {
      category: ICategory | null;
      brand: IBrand | null;
    };
  }> {
    const response = await axiosClient.get(
      `${this.baseURL}/collection/${slug}`,
      {
        params: { page, limit, sort, cpu, ram },
      },
    );
    return response.data;
  }

  /**
   * Get products for homepage "Gợi ý cho bạn" section
   */
  async getClientProducts(
    page = 1,
    limit = 20,
  ): Promise<{
    items: IProductCard[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }> {
    const response = await axiosClient.get(`${this.baseURL}/client-products`, {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Get top discount products for homepage carousel
   */
  async getTopDiscountProducts(limit = 20): Promise<IProductCard[]> {
    const response = await axiosClient.get(`${this.baseURL}/top-discount`, {
      params: { limit },
    });
    return response.data;
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
    return response.data;
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
    return response.data;
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
    return response.data;
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
    return response.data;
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
    return response.data;
  }

  /**
   * Post comment on product (alias for createProductComment)
   * Used by Comment.tsx
   */
  async postCommentOnProduct(
    data: ICreateProductInteraction,
  ): Promise<unknown> {
    const response = await axiosClient.post("/product-interaction", data);
    return response.data;
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
    return response.data;
  }
}

export const productClientService = new ProductClientService();
