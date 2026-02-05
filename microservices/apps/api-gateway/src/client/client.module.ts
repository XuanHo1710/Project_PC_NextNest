import { Module } from '@nestjs/common';
import { AuthModule } from 'client/auth/auth.module';
import { ProductModule } from 'client/product/product.module';
import { JwtModule } from '@nestjs/jwt';
import { ClientJwtStrategy } from 'guards/client-jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientJwtAuthGuard } from 'guards/client-jwt-auth.guard';
import { AccountGuestModule } from 'client/account-guest/account-guest.module';

@Module({
  imports: [
    AccountGuestModule,
    ConfigModule,
    AuthModule,
    ProductModule,
    JwtModule.register({}),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ClientJwtAuthGuard,
    },
    ClientJwtStrategy,
  ],
})
export class ClientModule {}
