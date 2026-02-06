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
import {
  CreateAccountEmployeeDto,
  UpdateAccountEmployeeDto,
} from '@project-pc/common';
import mongoose, { Types } from 'mongoose';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('/admin/account-employee')
export class AccountEmployeeController {
  constructor(
    private readonly accountEmployeeService: AccountEmployeeService,
  ) { }

  @MessagePattern('account_employee.create')
  create(
    @Payload() data: { createAccountEmployeeDto: CreateAccountEmployeeDto },
  ) {
    return this.accountEmployeeService.create(data.createAccountEmployeeDto);
  }

  @MessagePattern('account_employee.findAll')
  findAll(@Payload() data: { filter: any }) {
    return this.accountEmployeeService.findAll(data.filter);
  }

  @MessagePattern('account_employee.findAccountByIDEmp')
  findAccountByIDEmp(@Payload() data: { IDEmp: string }) {
    return this.accountEmployeeService.findAccountByIDEmp(data.IDEmp);
  }

  @MessagePattern('account_employee.updateMany')
  updateMany(@Payload() data: { dataUpdate: any }) {
    return this.accountEmployeeService.updateMany(data.dataUpdate);
  }

  @MessagePattern('account_employee.findOne')
  findOne(@Payload() data: { id: string }) {
    if (!Types.ObjectId.isValid(data.id)) {
      return { error: 'ID không hợp lệ' };
    }
    return this.accountEmployeeService.findOne(data.id);
  }

  @MessagePattern('account_employee.update')
  update(
    @Payload()
    data: {
      id: mongoose.Types.ObjectId;
      updateAccountEmployeeDto: UpdateAccountEmployeeDto;
    },
  ) {
    return this.accountEmployeeService.update(
      data.id,
      data.updateAccountEmployeeDto,
    );
  }

  @MessagePattern('account_employee.remove')
  remove(@Payload() data: { id: mongoose.Types.ObjectId }) {
    return this.accountEmployeeService.remove(data.id);
  }
}
