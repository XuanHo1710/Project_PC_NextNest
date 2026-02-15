import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 120000, // Default 120s for AI service calls
      maxRedirects: 3,
    }),
  ],
  controllers: [AiController],
})
export class AiModule { }
