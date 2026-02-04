import { Controller, Body, Param, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import mongoose from 'mongoose';

@Controller('/admin/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  findAll(@Query() filter) {
    return this.employeeService.findAll(filter);
  }

  findEmployeeHaveNotAccount() {
    return this.employeeService.findEmployeeHaveNotAccount();
  }

  updateMany(@Body() dataUpdate) {
    return this.employeeService.updateMany(dataUpdate);
  }

  findOne(@Param('id') id: mongoose.Schema.Types.ObjectId) {
    return this.employeeService.findOne(id);
  }

  update(
    @Param('id') id: mongoose.Types.ObjectId,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  remove(@Param('id') id: mongoose.Types.ObjectId) {
    return this.employeeService.remove(id);
  }
}
