import { axiosInstance } from "@/config/axiosClient";
import { IProductCard } from "@/types/product";

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1") +
  "/client";

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

/** SSE event types from the streaming endpoint */
export interface StreamEvent {
  type: "token" | "done" | "error" | "replace";
  content?: string;
  suggestions?: string[];
  products?: IProductCard[];
  timestamp?: string;
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
        { timeout: 120000 },
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

  /**
   * Stream AI chat response via SSE. Calls `onToken` for each token,
   * and `onDone` when the full response + products are ready.
   */
  async sendMessageStream(
    message: string,
    userId?: string,
    history?: ChatMessage[],
    callbacks?: {
      onToken?: (token: string) => void;
      onReplace?: (text: string) => void;
      onDone?: (data: {
        suggestions: string[];
        products: IProductCard[];
        timestamp: string;
      }) => void;
      onError?: (error: string) => void;
    },
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, userId, history }),
      });

      if (!response.ok || !response.body) {
        callbacks?.onError?.("Kết nối thất bại.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: StreamEvent = JSON.parse(line.slice(6));
            switch (event.type) {
              case "token":
                callbacks?.onToken?.(event.content || "");
                break;
              case "replace":
                callbacks?.onReplace?.(event.content || "");
                break;
              case "done":
                callbacks?.onDone?.({
                  suggestions: event.suggestions || [],
                  products: event.products || [],
                  timestamp: event.timestamp || new Date().toISOString(),
                });
                break;
              case "error":
                callbacks?.onError?.(event.content || "Đã có lỗi xảy ra.");
                break;
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
      callbacks?.onError?.(
        "Xin lỗi, có lỗi xảy ra khi kết nối với hệ thống hỗ trợ.",
      );
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
    limit: number = 8,
  ): Promise<IProductCard[]> {
    try {
      const response = await axiosInstance.get(
        `/chatbot/recommendations/${guestId}`,
        { params: { limit }, timeout: 60000 },
      );
      // AI service now returns IProductCard-compatible JSON directly (real _id, sku, etc.)
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      return [];
    }
  },

  async getPopularProducts(limit: number = 8): Promise<IProductCard[]> {
    try {
      const response = await axiosInstance.get(`/chatbot/popular`, {
        params: { limit },
        timeout: 60000,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error getting popular products:", error);
      return [];
    }
  },
};
