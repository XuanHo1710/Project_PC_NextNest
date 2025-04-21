import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Employee } from './entities/employee.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class EmployeeService {
  constructor(@InjectModel(Employee.name) private employeeModel: Model<Employee>) { }



  async create(createEmployeeDto: CreateEmployeeDto) {
    const employee = await this.employeeModel.create(createEmployeeDto)
    return employee;
  }

  async findAll() {
    const employees = await this.employeeModel.find({});
    return employees;
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

  async update(id: mongoose.Types.ObjectId, updateEmployeeDto: UpdateEmployeeDto) {
    return await this.employeeModel.updateOne({_id: id}, updateEmployeeDto);
  }

  async remove(id: mongoose.Types.ObjectId) {
    return await this.employeeModel.deleteOne({_id: id});
  }
}
