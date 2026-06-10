import { Module } from '@nestjs/common';
import { AccountEmployeeController } from './account-employee.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST ?? 'auth-service',
          port: MICROSERVICE_PORT.AUTH_SERVICE,
        },
      },
    ]),
  ],
  controllers: [AccountEmployeeController],
  providers: [],
})
export class AccountEmployeeModule {}
