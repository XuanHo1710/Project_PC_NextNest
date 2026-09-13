import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientLocalStrategy } from 'guards/client-local-jwt.strategy';
import { GoogleStrategy } from 'guards/google.strategy';
import { MICROSERVICE, getServiceHost, getServicePort } from '@project-pc/common';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_TOKEN_SECRET', 'secret'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRE', '3600s'),
        },
      }),
    }),
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
  ],
  controllers: [AuthController],
  providers: [ClientLocalStrategy, GoogleStrategy],
  exports: [ClientLocalStrategy, GoogleStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
