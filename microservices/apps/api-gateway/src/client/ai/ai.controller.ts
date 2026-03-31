import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Logger,
  Res,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Guest, Public } from '../../decorators/customize';
import type { Response } from 'express';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

@Controller('/client/chatbot')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly httpService: HttpService) {}

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
   * POST /client/chatbot/stream
   * Stream AI chat response via SSE (Server-Sent Events)
   * Tokens arrive in real-time for instant UI feedback
   */
  @Post('stream')
  @Public()
  async chatMessageStream(
    @Body() body: { message: string; userId?: string; history?: any[] },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.post(
          `${AI_SERVICE_URL}/api/v1/ai/chat/stream`,
          {
            message: body.message,
            userId: body.userId,
            history: body.history,
          },
          {
            responseType: 'stream',
            timeout: 120000,
          },
        );

        await new Promise<void>((resolve, reject) => {
          response.data.on('data', (chunk: Buffer) => {
            res.write(chunk);
          });

          response.data.on('end', () => {
            resolve();
          });

          response.data.on('error', (err: Error) => {
            reject(err);
          });
        });

        res.end();
        return;
      } catch (error) {
        const isRetryable =
          error.code === 'ECONNRESET' ||
          error.code === 'ECONNREFUSED' ||
          error.message?.includes('ECONNRESET');

        if (isRetryable && attempt < MAX_RETRIES) {
          this.logger.warn(
            `AI stream attempt ${attempt} failed (${error.code || error.message}), retrying in 1s...`,
          );
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        this.logger.error(`AI stream error: ${error.message}`);
        res.write(
          `data: ${JSON.stringify({ type: 'error', content: 'Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau.' })}\n\n`,
        );
        res.end();
        return;
      }
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
            params: { limit: limit ? parseInt(limit, 10) : 16 },
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
