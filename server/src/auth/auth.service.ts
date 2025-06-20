import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountEmployeeService } from 'src/account-employee/account-employee.service';
import { EmployeeService } from 'src/employee/employee.service';


const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private accountEmployeeService: AccountEmployeeService,
    private employeeService: EmployeeService,
    private jwtService: JwtService
  ) { }

  async signIn(IDEmp: string, passPlainText: string): Promise<{ access_token: string }> {
    const account = await this.accountEmployeeService.findAccountByIDEmp(IDEmp);

    if (!account) {
      throw new UnauthorizedException("Account not found");
    }

    const isCorrect = bcrypt.compareSync(passPlainText, account?.password);
    if (!isCorrect) {
      throw new UnauthorizedException("Password is not correct");
    }

    // Get Inforaccount 
    const employee = await this.employeeService.findOne(account.employee);


    const payload = { username: employee?.name, address: employee?.address, role: account.role };
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}