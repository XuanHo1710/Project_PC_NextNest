import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { NotificationController } from 'client/notification/notification.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.NOTIFICATION_SERVICE,
        },
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [],
})
export class NotificationModule {}
