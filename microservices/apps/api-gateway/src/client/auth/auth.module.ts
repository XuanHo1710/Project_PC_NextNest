import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE } from 'constrain';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientLocalStrategy } from 'guards/client-local-jwt.strategy';

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
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [ClientLocalStrategy],
  exports: [ClientLocalStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
