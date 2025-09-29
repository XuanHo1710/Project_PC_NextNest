import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AccountEmployeeModule } from 'src/admin/account-employee/account-employee.module';
import { AccountGuestModule } from 'src/admin/account-guest/account-guest.module';
import { AppService } from 'src/app.service';
import { AuthModule } from 'src/admin/auth/auth.module';
import { JwtStrategy } from 'src/admin/auth/jwt.strategy';
import { CategoryModule } from 'src/admin/category/category.module';
import { DiscountModule } from 'src/admin/discount/discount.module';
import { EmployeeModule } from 'src/admin/employee/employee.module';
import { ProductModule } from 'src/admin/product/product.module';
import { RoleModule } from 'src/admin/role/role.module';

@Module({
  imports: [
    EmployeeModule,
    CategoryModule,
    ProductModule,
    DiscountModule,
    AccountEmployeeModule,
    AccountGuestModule,
    RoleModule,
    AuthModule,
    JwtModule.register({}),
  ],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,  -> Này dùng ở global mà mình chia 2 module rồi nên nếu để như này thì client cx bị :))
    // },
    JwtStrategy
  ]
})
export class AdminModule { }
