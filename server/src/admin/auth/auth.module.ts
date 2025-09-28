import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountEmployeeModule } from 'src/admin/account-employee/account-employee.module';
import { EmployeeModule } from 'src/admin/employee/employee.module';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/admin/auth/passport/local.strategy';
import { JwtStrategy } from 'src/admin/auth/jwt.strategy';
import { GoogleStrategy } from 'src/admin/auth/passport/google.strategy';
import { RoleModule } from 'src/admin/role/role.module';

@Module({
  imports: [
    AccountEmployeeModule,
    EmployeeModule,
    RoleModule,
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
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [AuthService]
})
export class AuthModule { }
