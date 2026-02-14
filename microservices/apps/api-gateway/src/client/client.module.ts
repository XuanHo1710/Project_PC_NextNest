import { Module } from '@nestjs/common';
import { AuthModule } from 'client/auth/auth.module';
import { ProductModule } from 'client/product/product.module';
import { ProductInteractionModule } from 'client/product-interaction/product-interaction.module';
import { JwtModule } from '@nestjs/jwt';
import { ClientJwtStrategy } from 'guards/client-jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientJwtAuthGuard } from 'guards/client-jwt-auth.guard';
import { AccountGuestModule } from 'client/account-guest/account-guest.module';
import { BrandModule } from 'client/brand/brand.module';
import { CategoryModule } from 'client/category/category.module';
import { CartModule } from 'client/cart/cart.module';
import { PaymentModule } from 'client/payment/payment.module';
import { OrderModule } from 'client/order/order.module';
import { NotificationModule } from 'client/notification/notification.module';
import { ChatModule } from 'client/chat/chat.module';
@Module({
  imports: [
    AccountGuestModule,
    ConfigModule,
    AuthModule,
    ProductModule,
    ProductInteractionModule,
    BrandModule,
    CartModule,
    CategoryModule,
    PaymentModule,
    OrderModule,
    NotificationModule,
    ChatModule,
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
