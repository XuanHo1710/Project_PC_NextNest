import { Injectable } from '@nestjs/common';
import { CreateAccountEmployeeDto } from './dto/create-account-employee.dto';
import { UpdateAccountEmployeeDto } from './dto/update-account-employee.dto';

@Injectable()
export class AccountEmployeeService {
  create(createAccountEmployeeDto: CreateAccountEmployeeDto) {
    return 'This action adds a new accountEmployee';
  }

  findAll() {
    return `This action returns all accountEmployee`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accountEmployee`;
  }

  update(id: number, updateAccountEmployeeDto: UpdateAccountEmployeeDto) {
    return `This action updates a #${id} accountEmployee`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountEmployee`;
  }
}
