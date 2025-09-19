import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountEmployee, AccountEmployeeSchema } from 'src/admin/account-employee/entities/account-employee.entity';
import { Employee, EmployeeSchema } from 'src/admin/employee/entities/employee.entity';



@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: AccountEmployee.name, schema: AccountEmployeeSchema }
    ])
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModuleClient { }
