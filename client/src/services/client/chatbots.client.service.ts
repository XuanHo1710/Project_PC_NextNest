import { axiosInstance } from "@/config/axiosClient";
import { IProductCard } from "@/types/product";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const chatbotClientService = {
  async sendMessage(
    message: string,
    userId?: string,
    history?: ChatMessage[],
  ): Promise<ChatResponse> {
    try {
      const response = await axiosInstance.post(`/chatbot/message`, {
        message,
        userId,
        history,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      return {
        text: "Xin lỗi, có lỗi xảy ra khi kết nối với hệ thống hỗ trợ. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString(),
      };
    }
  },

  async getSuggestions(query: string): Promise<string[]> {
    try {
      const response = await axiosInstance.get(`/chatbot/suggestions`, {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting chatbot suggestions:", error);
      return [
        "Sản phẩm PC Gaming mới nhất",
        "Cách chọn laptop phù hợp",
        "Chương trình khuyến mãi",
      ];
    }
  },

  async getRecommendations(
    guestId: string,
    limit: number = 20,
  ): Promise<IProductCard[]> {
    try {
      const response = await axiosInstance.get(
        `/chatbot/recommendations/${guestId}`,
        { params: { limit } },
      );
      const items = Array.isArray(response.data) ? response.data : [];
      return items.map(mapAiItemToProductCard);
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      return [];
    }
  },

  async getPopularProducts(limit: number = 20): Promise<IProductCard[]> {
    try {
      const response = await axiosInstance.get(`/chatbot/popular`, {
        params: { limit },
      });
      const items = Array.isArray(response.data) ? response.data : [];
      return items.map(mapAiItemToProductCard);
    } catch (error) {
      console.error("Error getting popular products:", error);
      return [];
    }
  },
};

/** Map the flat AI recommendation item to the IProductCard shape expected by CardProduct. */
function mapAiItemToProductCard(item: any): IProductCard {
  return {
    _id: item.product_id || "",
    name: item.name || "",
    slug: item.slug || "",
    defaultVariant: {
      _id: "",
      sku: "",
      price: item.default_variant_price || 0,
      discount: item.default_variant_discount || 0,
      images: item.default_variant_image ? [item.default_variant_image] : [],
      combination: {},
      stock: item.default_variant_stock || 0,
    },
    brand: item.brand_name ? { _id: "", name: item.brand_name } : undefined,
    category: item.category_name
      ? { _id: "", name: item.category_name, slug: item.category_slug || "" }
      : undefined,
    minPrice: item.min_price || 0,
    maxPrice: item.max_price || 0,
    status: "ACTIVE",
  } as IProductCard;
}
