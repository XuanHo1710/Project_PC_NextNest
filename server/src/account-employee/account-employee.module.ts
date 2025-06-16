import { Module } from '@nestjs/common';
import { AccountEmployeeService } from './account-employee.service';
import { AccountEmployeeController } from './account-employee.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountEmployee, AccountEmployeeSchema } from './entities/account-employee.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: AccountEmployee.name, schema: AccountEmployeeSchema }])],
  controllers: [AccountEmployeeController],
  providers: [AccountEmployeeService],
})
export class AccountEmployeeModule { }
