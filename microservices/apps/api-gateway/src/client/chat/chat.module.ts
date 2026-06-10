import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.CHAT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.CHAT_SERVICE_HOST ?? 'chat-service',
          port: MICROSERVICE_PORT.CHAT_SERVICE,
        },
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatGateway],
})
export class ChatModule {}
