import { Injectable } from '@nestjs/common';

interface ChatResponse {
    text: string;
    timestamp: string;
    suggestions?: string[];
}

@Injectable()
export class ChatbotService {
    private responses: Record<string, string[]> = {
        emoji: [
            'Nay bạn vui thế!',
            'Thích emoji nhỉ? Tôi cũng vậy! 😄',
            'Cảm xúc của bạn thật thú vị!'
        ],
        greeting: [
            'Xin chào! Tôi là trợ lý của PC Shop. Tôi có thể giúp gì cho bạn?',
            'Chào bạn! Rất vui được hỗ trợ bạn hôm nay. Bạn cần tôi giúp gì không?',
            'Xin chào! Tôi là ChatBot của PC Shop. Tôi có thể giúp bạn tìm sản phẩm hoặc trả lời thắc mắc.'
        ],
        price: [
            'Bạn có thể xem giá sản phẩm trong trang chi tiết sản phẩm. Nếu cần hỗ trợ thêm, vui lòng gọi hotline 1900.5301.',
            'Chúng tôi có nhiều mức giá khác nhau cho các sản phẩm PC. Bạn đang quan tâm đến dòng sản phẩm nào?',
            'Giá các sản phẩm của chúng tôi từ 10 triệu đến 50 triệu tùy cấu hình. Bạn có nhu cầu cụ thể về ngân sách không?'
        ],
        promotion: [
            'Hiện tại chúng tôi đang có chương trình khuyến mãi mua 1 tặng 1 và giảm giá đến 20% cho các sản phẩm PC Gaming. Bạn có thể xem thêm tại trang Khuyến Mãi!',
            'Từ ngày 15-30 tháng này, chúng tôi có chương trình giảm giá lên đến 30% cho các sản phẩm Gaming Gear và tặng kèm bàn phím cơ cho đơn hàng từ 20 triệu.',
            'Khách hàng mua PC Gaming từ 25 triệu sẽ được tặng ngay màn hình Gaming 24" và voucher giảm giá 500k cho lần mua tiếp theo.'
        ],
        warranty: [
            'Sản phẩm của chúng tôi được bảo hành từ 12-36 tháng tùy loại. Bạn có thể mang sản phẩm đến cửa hàng hoặc gửi về trung tâm bảo hành. Liên hệ 1900.5301 để được hỗ trợ nhanh nhất.',
            'Chúng tôi cung cấp bảo hành 3 năm cho linh kiện PC và 1 năm cho laptop. Quy trình bảo hành đơn giản, chỉ cần mang sản phẩm và hóa đơn đến cửa hàng.',
            'Chính sách bảo hành 1 đổi 1 trong 30 ngày đầu tiên nếu sản phẩm gặp lỗi. Sau đó, thời gian bảo hành theo tiêu chuẩn của nhà sản xuất.'
        ],
        shipping: [
            'Chúng tôi giao hàng miễn phí trong nội thành cho đơn hàng từ 1 triệu trở lên. Thời gian giao hàng từ 1-3 ngày tùy khu vực.',
            'Phí vận chuyển nội thành là 30k, miễn phí cho đơn từ 1 triệu. Giao hàng nhanh trong 24h với khu vực trung tâm.',
            'Dịch vụ vận chuyển toàn quốc với phí từ 30k-100k tùy khu vực. Thời gian giao hàng 1-5 ngày tùy địa điểm.'
        ],
        configuration: [
            'PC Shop có đầy đủ các linh kiện máy tính cao cấp từ CPU, GPU đến mainboard, RAM và ổ cứng. Bạn có thể tham khảo các cấu hình máy được đề xuất tại trang sản phẩm của chúng tôi.',
            'Chúng tôi có sẵn các cấu hình PC Gaming từ phổ thông đến cao cấp, từ 15 triệu đến 100 triệu. Bạn cần máy để chơi game gì?',
            'PC Shop cung cấp dịch vụ build PC theo yêu cầu với đầy đủ linh kiện chính hãng. Bạn có thể tùy chọn từ CPU, GPU đến tản nhiệt và vỏ case.'
        ],
        laptop: [
            'Chúng tôi cung cấp nhiều dòng laptop gaming và văn phòng từ các thương hiệu nổi tiếng như ASUS, MSI, Dell, HP và Lenovo. Bạn có thể ghé cửa hàng để trải nghiệm sản phẩm trực tiếp!',
            'PC Shop có đa dạng laptop gaming từ các hãng Alienware, ROG, Legion với cấu hình mạnh mẽ cho mọi nhu cầu chơi game.',
            'Bạn đang tìm laptop cho mục đích gì? Chúng tôi có laptop văn phòng nhẹ, mỏng và laptop gaming hiệu năng cao.'
        ],
        contact: [
            'Để được tư vấn chi tiết về sản phẩm, bạn vui lòng để lại số điện thoại hoặc gọi đến hotline 1900.5301. Đội ngũ chuyên viên của chúng tôi sẽ hỗ trợ bạn nhanh nhất có thể!',
            'Bạn có thể liên hệ với chúng tôi qua số hotline 1900.5301 hoặc ghé trực tiếp showroom tại 123 Nguyễn Trãi, Q.1, TP.HCM.',
            'PC Shop có hệ thống cửa hàng trên toàn quốc. Bạn có thể tìm cửa hàng gần nhất trên website hoặc liên hệ qua email support@pcshop.com.'
        ],
        fallback: [
            'Cảm ơn bạn đã liên hệ. Nhân viên của chúng tôi sẽ phản hồi sớm nhất có thể!',
            'Tôi chưa hiểu rõ ý bạn. Bạn có thể hỏi về giá cả, cấu hình, bảo hành hoặc chương trình khuyến mãi.',
            'Xin lỗi, tôi không thể trả lời câu hỏi này. Bạn có thể liên hệ trực tiếp với nhân viên qua số 1900.5301.'
        ]
    };

    private suggestions: Record<string, string[]> = {
        general: [
            'Các sản phẩm PC Gaming hot nhất',
            'Chương trình khuyến mãi hiện tại',
            'Cấu hình PC chơi game đề xuất',
            'Thời gian bảo hành sản phẩm',
            'Chi phí vận chuyển'
        ],
        price: [
            'PC Gaming dưới 20 triệu',
            'Laptop gaming giá tốt',
            'Chi phí build PC cao cấp',
            'Có trả góp không?'
        ],
        product: [
            'So sánh RTX 3080 và RTX 4070',
            'Nên chọn Intel hay AMD',
            'SSD hay HDD tốt hơn',
            'Màn hình gaming tốt nhất hiện nay'
        ]
    };

    private sessionStore: Record<string, {
        lastInteraction: Date;
        context?: string;
        history: { message: string; response: string }[]
    }> = {};

    processMessage(message: string, userId: string = 'default'): ChatResponse {
        // Create session if not exists
        if (!this.sessionStore[userId]) {
            this.sessionStore[userId] = {
                lastInteraction: new Date(),
                history: []
            };
        } else {
            this.sessionStore[userId].lastInteraction = new Date();
        }

        // Detect intent
        const intent = this.detectIntent(message.toLowerCase());

        // Get random response from the intent category
        const responses = this.responses[intent] || this.responses.fallback;
        const randomIndex = Math.floor(Math.random() * responses.length);
        const responseText = responses[randomIndex];

        // Store in history
        this.sessionStore[userId].history.push({
            message,
            response: responseText
        });

        // Generate suggestions based on intent
        let suggestionsCategory = 'general';
        if (['price', 'promotion'].includes(intent)) {
            suggestionsCategory = 'price';
        } else if (['configuration', 'laptop'].includes(intent)) {
            suggestionsCategory = 'product';
        }

        const suggestionsList = this.suggestions[suggestionsCategory];
        const selectedSuggestions = this.getRandomItems(suggestionsList, 3);

        return {
            text: responseText,
            timestamp: new Date().toISOString(),
            suggestions: selectedSuggestions
        };
    }

    getSuggestions(query: string): string[] {
        // Simple implementation - would be more sophisticated in a real system
        if (!query) return this.getRandomItems(this.suggestions.general, 3);

        const lowercaseQuery = query.toLowerCase();
        let category = 'general';

        if (lowercaseQuery.includes('giá') || lowercaseQuery.includes('tiền') || lowercaseQuery.includes('khuyến mãi')) {
            category = 'price';
        } else if (lowercaseQuery.includes('pc') || lowercaseQuery.includes('laptop') || lowercaseQuery.includes('cấu hình')) {
            category = 'product';
        }

        return this.getRandomItems(this.suggestions[category], 3);
    }

    private detectIntent(message: string): string {
        // Check if message is only emoji
        if (this.isOnlyEmoji(message)) {
            return 'emoji';
        }

        if (message.includes('xin chào') || message.includes('chào') || message.includes('hello')) {
            return 'greeting';
        } else if (message.includes('giá') || message.includes('bao nhiêu') || message.includes('tiền')) {
            return 'price';
        } else if (message.includes('khuyến mãi') || message.includes('giảm giá') || message.includes('sale')) {
            return 'promotion';
        } else if (message.includes('bảo hành')) {
            return 'warranty';
        } else if (message.includes('vận chuyển') || message.includes('giao hàng') || message.includes('ship')) {
            return 'shipping';
        } else if (message.includes('cấu hình') || message.includes('linh kiện') || message.includes('phần cứng')) {
            return 'configuration';
        } else if (message.includes('laptop') || message.includes('máy tính xách tay')) {
            return 'laptop';
        } else if (message.includes('tư vấn') || message.includes('hỗ trợ') || message.includes('liên hệ')) {
            return 'contact';
        } else {
            return 'fallback';
        }
    }

    // Function to check if a string contains only emoji
    private isOnlyEmoji(str: string): boolean {
        // Remove all whitespace from the string
        const trimmedStr = str.trim();

        if (trimmedStr.length === 0) return false;

        // This regex matches most emoji Unicode ranges
        // Including basic emoji, emoji with skin tone modifiers, flags, and symbols
        const emojiRegex = /^(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Modifier_Base}|\p{Emoji_Component})+$/u;

        // Alternative simpler approach - check for any common emoji patterns
        // This covers the most commonly used emojis
        const commonEmojiPattern = /^[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}]+$/u;

        return commonEmojiPattern.test(trimmedStr) || emojiRegex.test(trimmedStr);
    }

    private getRandomItems<T>(array: T[], count: number): T[] {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}