import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AccountEmployeeService } from './account-employee.service';
import { CreateAccountEmployeeDto } from './dto/create-account-employee.dto';
import { UpdateAccountEmployeeDto } from './dto/update-account-employee.dto';
import mongoose, { Types } from 'mongoose';

@Controller('/admin/account-employee')
export class AccountEmployeeController {
  constructor(
    private readonly accountEmployeeService: AccountEmployeeService,
  ) {}

  @Post()
  create(@Body() createAccountEmployeeDto: CreateAccountEmployeeDto) {
    return this.accountEmployeeService.create(createAccountEmployeeDto);
  }

  @Get()
  findAll(@Query() filter: any) {
    return this.accountEmployeeService.findAll(filter);
  }

  @Get('/get-account')
  findAccountByIDEmp(IDEmp: string) {
    return this.accountEmployeeService.findAccountByIDEmp(IDEmp);
  }

  @Patch('/updateMany')
  updateMany(@Body() dataUpdate: any) {
    return this.accountEmployeeService.updateMany(dataUpdate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return { error: 'ID không hợp lệ' };
    }
    return this.accountEmployeeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: mongoose.Types.ObjectId,
    @Body() updateAccountEmployeeDto: UpdateAccountEmployeeDto,
  ) {
    return this.accountEmployeeService.update(id, updateAccountEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: mongoose.Types.ObjectId) {
    return this.accountEmployeeService.remove(id);
  }
}
