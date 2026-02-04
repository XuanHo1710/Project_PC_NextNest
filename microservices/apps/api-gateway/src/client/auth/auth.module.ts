import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE } from 'constrain';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
