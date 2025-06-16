import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import mongoose from 'mongoose';
import { TypeQueryEmployee, TypeUpdateManyEmployee } from 'types/employee';

@Controller('/admin/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  findAll(@Query() filter: TypeQueryEmployee) {
    return this.employeeService.findAll(filter);
  }

  @Get("/no-account")
  findEmployeeHaveNotAccount() {
    return this.employeeService.findEmployeeHaveNotAccount();
  }

  @Patch('/updateMany')
  updateMany(@Body() dataUpdate: TypeUpdateManyEmployee) {
    return this.employeeService.updateMany(dataUpdate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(+id);
  }


  @Patch(':id')
  update(@Param('id') id: mongoose.Types.ObjectId, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(id, updateEmployeeDto);
  }


  @Delete(':id')
  remove(@Param('id') id: mongoose.Types.ObjectId) {
    return this.employeeService.remove(id);
  }
}
