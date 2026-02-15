import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Guest, Public } from '../../decorators/customize';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

@Controller('/client/chatbot')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly httpService: HttpService) { }

  /**
   * POST /client/chatbot/message
   * Send a message to the AI chatbot
   */
  @Post('message')
  @Public()
  async chatMessage(
    @Body() body: { message: string; userId?: string; history?: any[] },
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${AI_SERVICE_URL}/api/v1/ai/chat/message`,
          {
            message: body.message,
            userId: body.userId,
            history: body.history,
          },
          { timeout: 120000 }, // 120s - Ollama on CPU is slow
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`AI chat error: ${error.message}`);
      return {
        text: 'Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau.',
        timestamp: new Date().toISOString(),
        suggestions: [],
      };
    }
  }

  /**
   * GET /client/chatbot/suggestions
   * Get quick suggestions for the chatbot
   */
  @Get('suggestions')
  @Public()
  async chatSuggestions(@Query('query') query?: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${AI_SERVICE_URL}/api/v1/ai/chat/suggestions`, {
          params: { query: query || '' },
          timeout: 10000,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`AI suggestions error: ${error.message}`);
      return [
        'Sản phẩm PC Gaming mới nhất',
        'Cách chọn laptop phù hợp',
        'Chương trình khuyến mãi',
      ];
    }
  }

  /**
   * GET /client/chatbot/recommendations/:guestId
   * Get personalized recommendations based on viewing behavior
   */
  @Get('recommendations/:guestId')
  @Public()
  async getRecommendations(
    @Param('guestId') guestId: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${AI_SERVICE_URL}/api/v1/ai/recommendations/${guestId}`,
          {
            params: { limit: limit ? parseInt(limit, 10) : 20 },
            timeout: 60000, // 60s - embedding + qdrant search
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`AI recommendations error: ${error.message}`);
      return [];
    }
  }

  /**
   * GET /client/chatbot/popular
   * Get popular products (fallback when no user context)
   */
  @Get('popular')
  @Public()
  async getPopularProducts(@Query('limit') limit?: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${AI_SERVICE_URL}/api/v1/ai/popular`, {
          params: { limit: limit ? parseInt(limit, 10) : 20 },
          timeout: 30000,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`AI popular products error: ${error.message}`);
      return [];
    }
  }

  /**
   * POST /client/chatbot/reindex
   * Trigger product reindex in Qdrant
   */
  @Post('reindex')
  @Public()
  async reindexProducts() {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${AI_SERVICE_URL}/api/v1/ai/reindex`, null, {
          timeout: 300000, // 5 min - reindex can be slow
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`AI reindex error: ${error.message}`);
      return { message: 'Reindex failed', count: 0 };
    }
  }
}
