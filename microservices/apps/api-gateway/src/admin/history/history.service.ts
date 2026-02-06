import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '@project-pc/common';
import { CreateHistoryDto } from '@project-pc/common';

@Injectable()
export class HistoryService {
    constructor(
        @Inject(MICROSERVICE.HISTORY_LOG_SERVICE)
        private readonly historyServiceClient: ClientProxy,
    ) { }

    findAll(filter: any, employeeOrId: any) {
        const userId = employeeOrId?._id || employeeOrId?.id || employeeOrId;
        console.log("Đã nhận được request tìm kiếm lịch sử cho:", userId);
        return this.historyServiceClient.send('history.findAll', { filter, userId });
    }

    createLog(data: CreateHistoryDto) {
        this.historyServiceClient.emit('history.create', data);
    }
}
