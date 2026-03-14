import axiosClient from "@/config/axiosClient";
import {
  IProductPopulated,
  IProductCard,
  IProductVariant,
  APIResponse,
  PaginatedResponse,
} from "@/types";
import { ICategory } from "@/types/category";
import { IBrand } from "@/types/brand";
import {
  IProductInteraction,
  ICreateProductInteraction,
} from "@/types/interaction";

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
  }): Promise<PaginatedResponse<IProductCard>> {
    const response = await axiosClient.get(this.baseURL, { params });
    return response.data;
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
    const result = response.data;
    // API returns PaginatedResponse — extract the data array
    return Array.isArray(result) ? result : (result as any)?.data || [];
  }

  /**
   * Search products with pagination + sort (for search page)
   */
  async searchProductsPaginated(
    query: string,
    page = 1,
    limit = 20,
    sort?: string,
  ): Promise<PaginatedResponse<IProductCard>> {
    const response = await axiosClient.get(`${this.baseURL}/search`, {
      params: { q: query, page, limit, sort },
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
  ): Promise<PaginatedResponse<IProductCard>> {
    const response = await axiosClient.get(`${this.baseURL}`, {
      params: { category: categoryId, page, sort, cpu, ram, price },
    });
    return response.data;
  }

  // ============== WISHLIST APIS ==============

  /**
   * Check if product is in user wishlist
   * Uses auth-service via gateway: GET /account-guest/favorites/check/:productId
   */
  async isWishlistByGuestAndProduct(productId: string): Promise<boolean> {
    const response = await axiosClient.get(
      `/account-guest/favorites/check/${productId}`,
    );
    return response.data;
  }

  /**
   * Add product to wishlist
   * Uses auth-service via gateway: POST /account-guest/favorites/:productId
   */
  async addToWishlist(productId: string): Promise<string[]> {
    const response = await axiosClient.post(
      `/account-guest/favorites/${productId}`,
    );
    return response.data;
  }

  /**
   * Remove product from wishlist
   * Uses auth-service via gateway: DELETE /account-guest/favorites/:productId
   */
  async removeFromWishlist(productId: string): Promise<string[]> {
    const response = await axiosClient.delete(
      `/account-guest/favorites/${productId}`,
    );
    return response.data;
  }

  /**
   * Get all favorite product IDs
   * Uses auth-service via gateway: GET /account-guest/favorites
   */
  async getWishlistIds(): Promise<string[]> {
    const response = await axiosClient.get(`/account-guest/favorites`);
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
  async getBrands(
    params?: Record<string, string>,
  ): Promise<PaginatedResponse<IBrand>> {
    const response = await axiosClient.get(this.brandURL, { params });
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
   * Get products by category slug (collection page)
   */
  async getCategoryCollectionProducts(
    slug: string,
    page = 1,
    limit = 12,
    sort?: string,
    cpu?: string,
    ram?: string,
    storage?: string,
  ): Promise<
    PaginatedResponse<IProductCard> & {
      collectionInfo: {
        category: ICategory | null;
        brand: IBrand | null;
      };
    }
  > {
    const response = await axiosClient.get(
      `${this.baseURL}/collection/${slug}`,
      {
        params: { page, limit, sort, cpu, ram, storage },
      },
    );
    return response.data;
  }

  /**
   * Get products by brand slug (brand page)
   */
  async getBrandCollectionProducts(
    slug: string,
    page = 1,
    limit = 12,
    sort?: string,
    cpu?: string,
    ram?: string,
    storage?: string,
  ): Promise<
    PaginatedResponse<IProductCard> & {
      collectionInfo: {
        category: ICategory | null;
        brand: IBrand | null;
      };
    }
  > {
    const response = await axiosClient.get(`${this.baseURL}/brand/${slug}`, {
      params: { page, limit, sort, cpu, ram, storage },
    });
    return response.data;
  }

  /**
   * @deprecated Use getCategoryCollectionProducts or getBrandCollectionProducts
   */
  async getCollectionProducts(
    slug: string,
    page = 1,
    limit = 12,
    sort?: string,
    cpu?: string,
    ram?: string,
    storage?: string,
  ) {
    return this.getCategoryCollectionProducts(
      slug,
      page,
      limit,
      sort,
      cpu,
      ram,
      storage,
    );
  }

  /**
   * Get products for homepage "Gợi ý cho bạn" section
   */
  async getClientProducts(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<IProductCard>> {
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

  // ============== PRODUCT VIEW TRACKING ==============

  /** Track a product view (for logged-in users) */
  async trackProductView(productId: string) {
    const response = await axiosClient.post(
      `${this.baseURL}/view/${productId}`,
    );
    return response.data;
  }

  /** Get recently viewed products */
  async getRecentlyViewedProducts(limit = 20) {
    const response = await axiosClient.get(
      `${this.baseURL}/recently-viewed/list`,
      { params: { limit } },
    );
    return response.data;
  }

  // ============== STOCK CHECK ==============

  /** Check stock availability for cart items */
  async checkCartStock(items: Array<{ variantId: string; quantity: number }>) {
    const response = await axiosClient.post(`${this.baseURL}/check-stock`, {
      items,
    });
    return response.data;
  }

  // ============== ELASTICSEARCH SEARCH ==============

  /**
   * Search product variants via Elasticsearch (full search with pagination)
   * Returns variant-level results with embedded product info
   */
  async esSearchProducts(
    q: string,
    page = 1,
    limit = 20,
    sort?: string,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
      category?: string;
      brand?: string;
    },
  ): Promise<
    PaginatedResponse<import("@/types/product").IProductVariantSearchResult>
  > {
    const response = await axiosClient.get("/search", {
      params: {
        q,
        page,
        limit,
        sort,
        ...filters,
      },
    });
    return response.data;
  }

  /**
   * Quick search (instant/autocomplete) via Elasticsearch
   */
  async esQuickSearch(
    q: string,
    limit = 10,
  ): Promise<import("@/types/product").IProductVariantSearchResult[]> {
    const response = await axiosClient.get("/search/quick", {
      params: { q, limit },
    });
    const result = response.data;
    return Array.isArray(result) ? result : (result as any)?.data || [];
  }
}

export const productClientService = new ProductClientService();
