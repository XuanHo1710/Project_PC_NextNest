import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccountEmployeeModule } from 'admin/account-employee/account-employee.module';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JwtStrategy } from 'guards/jwt.strategy';
import { AuthModule } from 'admin/auth/auth.module';
import { RoleModule } from 'admin/role/role.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { CategoryModule } from 'admin/category/category.module';

@Module({
  imports: [
    AccountEmployeeModule,
    RoleModule,
    ConfigModule,
    AuthModule,
    CategoryModule,
    JwtModule.register({}),
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
  ],
})
export class AdminModule {}
