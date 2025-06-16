import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccountEmployeeService } from './account-employee.service';
import { CreateAccountEmployeeDto } from './dto/create-account-employee.dto';
import { UpdateAccountEmployeeDto } from './dto/update-account-employee.dto';

@Controller('account-employee')
export class AccountEmployeeController {
  constructor(private readonly accountEmployeeService: AccountEmployeeService) {}

  @Post()
  create(@Body() createAccountEmployeeDto: CreateAccountEmployeeDto) {
    return this.accountEmployeeService.create(createAccountEmployeeDto);
  }

  @Get()
  findAll() {
    return this.accountEmployeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountEmployeeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountEmployeeDto: UpdateAccountEmployeeDto) {
    return this.accountEmployeeService.update(+id, updateAccountEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountEmployeeService.remove(+id);
  }
}
