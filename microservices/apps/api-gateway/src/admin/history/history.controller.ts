import { Controller, Get, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { Employee } from 'decorators/customize';

@Controller('/admin/history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Get()
    findAll(@Query() query: any, @Employee() employee: any) {
        return this.historyService.findAll(query, employee._id);
    }
}
