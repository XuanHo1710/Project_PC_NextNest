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
  products?: IProductCard[];
}

export const chatbotClientService = {
  async sendMessage(
    message: string,
    userId?: string,
    history?: ChatMessage[],
  ): Promise<ChatResponse> {
    try {
      const response = await axiosInstance.post(
        `/chatbot/message`,
        {
          message,
          userId,
          history,
        },
        { timeout: 120000 }, // 120s - LLM inference is slow on CPU
      );
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
      // AI service now returns IProductCard-compatible JSON directly (real _id, sku, etc.)
      return Array.isArray(response.data) ? response.data : [];
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
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error getting popular products:", error);
      return [];
    }
  },
};
