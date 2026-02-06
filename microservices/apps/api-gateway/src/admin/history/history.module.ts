import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { EmployeeHistoryController } from './employee-history.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { HistoryService } from 'admin/history/history.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: MICROSERVICE.HISTORY_LOG_SERVICE,
                transport: Transport.TCP,
                options: {
                    port: MICROSERVICE_PORT.HISTORY_LOG_SERVICE,
                },
            },
        ]),
    ],
    controllers: [HistoryController, EmployeeHistoryController],
    providers: [HistoryService],
    exports: [HistoryService], // Export service để Interceptor dùng
})
export class HistoryModule { }
