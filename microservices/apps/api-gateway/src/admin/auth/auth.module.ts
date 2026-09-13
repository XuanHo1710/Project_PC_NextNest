import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { MICROSERVICE, getServiceHost, getServicePort } from '@project-pc/common';
import { AuthController } from 'admin/auth/auth.controller';
import { LocalStrategy } from 'guards/local.strategy';

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
  ],
  controllers: [AuthController],
  providers: [LocalStrategy],
  exports: [LocalStrategy, JwtModule],
})
export class AuthModule {}
