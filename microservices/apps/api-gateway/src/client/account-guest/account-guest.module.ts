import { Module } from '@nestjs/common';
import { AccountGuestController } from './account-guest.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE } from 'constraint';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.ACCOUNT_GUEST_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 3002,
        },
      },
    ]),
  ],
  controllers: [AccountGuestController],
  providers: [],
})
export class AccountGuestModule {}
