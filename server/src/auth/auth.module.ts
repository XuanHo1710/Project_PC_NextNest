import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountEmployeeModule } from 'src/account-employee/account-employee.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AccountEmployeeModule,
    EmployeeModule,
    JwtModule.registerAsync({
      global: true,
      // imports: [ConfigModule],
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
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule { }
