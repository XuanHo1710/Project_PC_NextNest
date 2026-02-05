import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccountEmployeeModule } from 'admin/account-employee/account-employee.module';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JwtStrategy } from 'guards/jwt.strategy';

@Module({
  imports: [AccountEmployeeModule, ConfigModule, JwtModule.register({})],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
  ],
})
export class AdminModule {}
