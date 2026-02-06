import { Controller, Get, Param, Query } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('/admin/account-employee')
export class EmployeeHistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Get('/:id/history')
    getHistory(@Param('id') id: string, @Query() query: any) {
        // userId arg of historyService.findAll expects an object with _id or id property
        return this.historyService.findAll(query, { _id: id });
    }
}
