import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountEmployeeModule } from 'src/account-employee/account-employee.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/auth/passport/local.strategy';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [
    AccountEmployeeModule,
    EmployeeModule,
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
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule { }
