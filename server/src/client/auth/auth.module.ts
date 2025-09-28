import { Module } from '@nestjs/common';
import { ClientAuthService } from './auth.service';
import { ClientAuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Guest, GuestSchema } from '../../admin/guest/entities/guest.entity';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from '../../admin/auth/passport/google.strategy';
import { ClientJwtStrategy } from './client-jwt.strategy';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Guest.name, schema: GuestSchema }]),
        PassportModule,
        JwtModule.registerAsync({
            global: true,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    secret: configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
                    signOptions: {
                        expiresIn: configService.get<string>("JWT_ACCESS_EXPIRE")
                    }
                }
            }
        }),
    ],
    controllers: [ClientAuthController],
    providers: [ClientAuthService, GoogleStrategy, ClientJwtStrategy],
    exports: [ClientAuthService]
})
export class ClientAuthModule { }