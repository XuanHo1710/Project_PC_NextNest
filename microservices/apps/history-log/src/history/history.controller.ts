import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from '@project-pc/common';

@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) { }

  @MessagePattern('history.create')
  create(@Payload() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @MessagePattern('history.findAll')
  findAll(@Payload() { filter, userId }: any) {
    console.log("Đã nhận được request tìm kiếm lịch sử")
    console.log(filter, userId)
    return this.historyService.findAll(filter || {}, userId);
  }

  @MessagePattern('history.findOne')
  findOne(@Payload() id: number) {
    return this.historyService.findOne(id);
  }
}
