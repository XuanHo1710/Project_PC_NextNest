import { Module } from '@nestjs/common';
import { AccountEmployeeController } from './account-employee.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, getServiceHost, getServicePort } from '@project-pc/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: getServiceHost(MICROSERVICE.AUTH_SERVICE),
          port: getServicePort(MICROSERVICE.AUTH_SERVICE),
        },
      },
    ]),
  ],
  controllers: [AccountEmployeeController],
  providers: [],
})
export class AccountEmployeeModule {}
