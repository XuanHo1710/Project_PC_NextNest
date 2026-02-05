import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import mongoose, { Types } from 'mongoose';
import {
  MICROSERVICE,
  CreateAccountEmployeeDto,
  UpdateAccountEmployeeDto,
} from '@project-pc/common';

@Controller('/admin/account-employee')
export class AccountEmployeeController {
  constructor(
    @Inject(MICROSERVICE.AUTH_SERVICE)
    private readonly accountEmployeeService: ClientProxy,
  ) {}

  @Post()
  create(@Body() createAccountEmployeeDto: CreateAccountEmployeeDto) {
    return this.accountEmployeeService.send('account_employee.create', {
      createAccountEmployeeDto: createAccountEmployeeDto,
    });
  }

  @Get()
  findAll(@Query() filter: any) {
    return this.accountEmployeeService.send('account_employee.findAll', {
      filter: filter,
    });
  }

  @Get('/get-account')
  findAccountByIDEmp(IDEmp: string) {
    return this.accountEmployeeService.send(
      'account_employee.findAccountByIDEmp',
      { IDEmp: IDEmp },
    );
  }

  @Patch('/updateMany')
  updateMany(@Body() dataUpdate: any) {
    return this.accountEmployeeService.send('account_employee.updateMany', {
      dataUpdate: dataUpdate,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return { error: 'ID không hợp lệ' };
    }
    return this.accountEmployeeService.send('account_employee.findOne', {
      id: id,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: mongoose.Types.ObjectId,
    @Body() updateAccountEmployeeDto: UpdateAccountEmployeeDto,
  ) {
    return this.accountEmployeeService.send('account_employee.update', {
      id: id,
      updateAccountEmployeeDto: updateAccountEmployeeDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: mongoose.Types.ObjectId) {
    return this.accountEmployeeService.send('account_employee.remove', {
      id: id,
    });
  }
}
