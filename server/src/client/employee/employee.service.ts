import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AccountEmployee } from 'src/admin/account-employee/entities/account-employee.entity';
import { Employee } from 'src/admin/employee/entities/employee.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class EmployeeService {

  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(AccountEmployee.name) private accountEmployeeModel: Model<AccountEmployee>
  ) { }

  async findAll() {
    const employees = await this.employeeModel.find({});
    return employees;
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

}
