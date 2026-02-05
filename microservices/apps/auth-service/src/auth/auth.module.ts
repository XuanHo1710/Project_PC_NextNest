import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { ClientAuthService } from 'src/auth/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountGuest,
  AccountGuestSchema,
} from 'src/account-guest/entities/account-guest.entity';
import { AccountGuestModule } from 'src/account-guest/account-guest.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountGuest.name, schema: AccountGuestSchema },
    ]),
    ConfigModule, // 👈 BẮT BUỘC
    AccountGuestModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET', 'secret'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRE', '3600s'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [ClientAuthService],
})
export class AuthModule {}
