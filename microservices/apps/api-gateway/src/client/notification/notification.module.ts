import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { NotificationController } from 'client/notification/notification.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.NOTIFICATION_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5673'],
          queue: 'notification.main',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'notification.retry.exchange',
              'x-dead-letter-routing-key': 'notification.retry',
            },
          },
        },
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [],
})
export class NotificationModule {}
