import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AccountEmployeeService } from './account-employee.service';
import { CreateAccountEmployeeDto } from './dto/create-account-employee.dto';
import { UpdateAccountEmployeeDto } from './dto/update-account-employee.dto';
import { TypeQueryAccountEmployee, TypeUpdateManyAccountEmployee } from 'types/account-employee';
import mongoose from 'mongoose';

@Controller('/admin/account-employee')
export class AccountEmployeeController {
  constructor(private readonly accountEmployeeService: AccountEmployeeService) { }

  @Post()
  create(@Body() createAccountEmployeeDto: CreateAccountEmployeeDto) {
    return this.accountEmployeeService.create(createAccountEmployeeDto);
  }

  @Get()
  findAll(@Query() filter: TypeQueryAccountEmployee) {
    return this.accountEmployeeService.findAll(filter);
  }

  @Get()
  findAccountByIDEmp(IDEmp: string) {
    return this.accountEmployeeService.findAccountByIDEmp(IDEmp);
  }

  @Patch('/updateMany')
  updateMany(@Body() dataUpdate: TypeUpdateManyAccountEmployee) {
    return this.accountEmployeeService.updateMany(dataUpdate);
  }

  @Get(':id')
  findOne(@Param('id') id: mongoose.Types.ObjectId) {
    return this.accountEmployeeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: mongoose.Types.ObjectId, @Body() updateAccountEmployeeDto: UpdateAccountEmployeeDto) {
    return this.accountEmployeeService.update(id, updateAccountEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: mongoose.Types.ObjectId) {
    return this.accountEmployeeService.remove(id);
  }
}
