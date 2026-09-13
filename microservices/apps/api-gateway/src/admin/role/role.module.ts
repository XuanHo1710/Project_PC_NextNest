import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, getServiceHost, getServicePort } from '@project-pc/common';
import { RoleController } from 'admin/role/role.controller';

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
    ConfigModule,
  ],
  controllers: [RoleController],
  providers: [],
})
export class RoleModule {}
