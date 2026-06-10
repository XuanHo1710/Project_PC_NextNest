import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AccountEmployeeModule } from 'admin/account-employee/account-employee.module';
import { AccountGuestModule } from 'admin/account-guest/account-guest.module';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JwtStrategy } from 'guards/jwt.strategy';
import { AuthModule } from 'admin/auth/auth.module';
import { RoleModule } from 'admin/role/role.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { CategoryModule } from 'admin/category/category.module';
import { BrandModule } from 'admin/brand/brand.module';
import { ProductModule } from 'admin/product/product.module';
import { HistoryLogInterceptor } from 'admin/interceptors/history-log.interceptor';
import { HistoryModule } from 'admin/history/history.module';
import { OrderModule } from 'admin/order/order.module';
import { SettingsModule } from 'admin/settings/settings.module';

@Module({
  imports: [
    AccountEmployeeModule,
    AccountGuestModule,
    RoleModule,
    ConfigModule,
    AuthModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    HistoryModule,
    OrderModule,
    SettingsModule,
    JwtModule.register({}),
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HistoryLogInterceptor,
    },
    JwtStrategy,
  ],
})
export class AdminModule {}
