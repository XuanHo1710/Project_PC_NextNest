
import { axiosInstance } from '@/config/axiosClient';


interface ChatResponse {
    text: string;
    timestamp: string;
    suggestions?: string[];
}

export const chatbotClientService = {
    async sendMessage(message: string, userId?: string): Promise<ChatResponse> {
        try {
            const response = await axiosInstance.post(`/chatbot/message`, {
                message,
                userId
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            return {
                text: 'Xin lỗi, có lỗi xảy ra khi kết nối với hệ thống hỗ trợ. Vui lòng thử lại sau.',
                timestamp: new Date().toISOString()
            };
        }
    },

    async getSuggestions(query: string): Promise<string[]> {
        try {
            const response = await axiosInstance.get(`/chatbot/suggestions`, {
                params: { query }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting chatbot suggestions:', error);
            return [
                'Sản phẩm PC Gaming mới nhất',
                'Cách chọn laptop phù hợp',
                'Chương trình khuyến mãi'
            ];
        }
    }
};