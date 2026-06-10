import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { RoleController } from 'admin/role/role.controller';

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
    ConfigModule,
  ],
  controllers: [RoleController],
  providers: [],
})
export class RoleModule {}
