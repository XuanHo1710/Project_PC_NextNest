import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, getServiceHost, getServicePort } from '@project-pc/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.HISTORY_LOG_SERVICE,
        transport: Transport.TCP,
        options: {
          host: getServiceHost(MICROSERVICE.HISTORY_LOG_SERVICE),
          port: getServicePort(MICROSERVICE.HISTORY_LOG_SERVICE),
        },
      },
    ]),
  ],
  controllers: [SettingsController],
})
export class SettingsModule {}
