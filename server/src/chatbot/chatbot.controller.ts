import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ChatbotService } from 'src/chatbot/chatbot.service';


@Controller('chatbot')
export class ChatbotController {
    constructor(private readonly chatbotService: ChatbotService) { }

    @Post('message')
    async sendMessage(@Body() messageData: { message: string; userId?: string }): Promise<any> {
        return this.chatbotService.processMessage(messageData.message, messageData.userId);
    }

    @Get('suggestions')
    async getSuggestions(@Query('query') query: string) {
        return this.chatbotService.getSuggestions(query);
    }
}