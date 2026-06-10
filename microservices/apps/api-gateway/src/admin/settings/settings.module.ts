import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.HISTORY_LOG_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.HISTORY_LOG_HOST ?? 'history-log',
          port: MICROSERVICE_PORT.HISTORY_LOG_SERVICE,
        },
      },
    ]),
  ],
  controllers: [SettingsController],
})
export class SettingsModule {}
