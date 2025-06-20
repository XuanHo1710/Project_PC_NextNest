import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
// import ms from 'ms';
import { AccountEmployeeService } from 'src/account-employee/account-employee.service';
import { AccountEmployee } from 'src/account-employee/entities/account-employee.entity';
import { EmployeeService } from 'src/employee/employee.service';
const bcrypt = require('bcrypt');
const ms = require("ms")

@Injectable()
export class AuthService {
  constructor(
    private accountEmployeeService: AccountEmployeeService,
    private jwtService: JwtService,
    private employeeService: EmployeeService,
    private configService: ConfigService
  ) { }

  async signIn(IDEmp: string, passPlainText: string): Promise<any | null> {
    const account = await this.accountEmployeeService.findAccountByIDEmp(IDEmp);
    const isCorrect = bcrypt.compareSync(passPlainText, account?.password || "");
    if (account && isCorrect) {
      return account;
    }
    return null;
  }

  async login(account: AccountEmployee, response: Response) {
    // Get Inforaccount 
    const employee = await this.employeeService.findOne(account.employee);
    const payload = { username: employee?.name, address: employee?.address, role: account.role };
    const refresh_token = this.createRefreshToken(payload);

    await this.accountEmployeeService.updateAccountEmployeeToken(refresh_token, account._id);

    // Set refresh_token as cookies
    // HttpOnly only server can use this cookies. Javascript can't use this cookies
    response.cookie("refresh_token", refresh_token,
      {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE') as string),
        secure: false,
        path: "/",
        sameSite: "lax",
      }
    );

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token
    };
  }

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
      });

      const account = await this.accountEmployeeService.findEmployeeByToken(refreshToken);

      if (account) {
        // Get Inforaccount 
        const employee = await this.employeeService.findOne(account.employee);
        const payload = { username: employee?.name, address: employee?.address, role: account.role };
        const refresh_token = this.createRefreshToken(payload);

        // Update user with refresh token
        await this.accountEmployeeService.updateAccountEmployeeToken(refresh_token, account._id);

        response.clearCookie("refresh_token");
        // Set refresh_token as cookies
        // HttpOnly only server can use this cookies. Javascript can't use this cookies
        response.cookie("refresh_token", refresh_token,
          {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE') as string),
            secure: false,
            path: "/",
            sameSite: "lax",
          }
        );
        return {
          // access_token: this.jwtService.sign(payload),
          // Mốt code là biết 
          refresh_token: refresh_token
        };
      } else {
        throw new BadRequestException("Not found this user with token")
      }

    } catch (error) {
      // Token het han thi se chay vo day => da ve login
      throw new BadRequestException(error);
    }
  }


  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE')
    });
    return refresh_token;
  }

  async logout(id: string, response: Response) {
    await this.accountEmployeeService.updateAccountEmployeeToken("", id);
    response.clearCookie("refresh_token");
    return { message: "Success Logout" }
  }
}