import { Module } from '@nestjs/common';
import { AccountGuestController } from './account-guest.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.AUTH_SERVICE,
        },
      },
    ]),
  ],
  controllers: [AccountGuestController],
  providers: [],
})
export class AccountGuestModule {}
