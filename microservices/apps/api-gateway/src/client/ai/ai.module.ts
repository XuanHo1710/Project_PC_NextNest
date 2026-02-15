import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller';

@Module({
  imports: [HttpModule],
  controllers: [AiController],
})
export class AiModule {}
