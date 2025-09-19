import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import mongoose from 'mongoose';
// import ms from 'ms';
import { AccountEmployeeService } from 'src/admin/account-employee/account-employee.service';
import { AccountEmployee } from 'src/admin/account-employee/entities/account-employee.entity';
import { EmployeeService } from 'src/admin/employee/employee.service';
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

  async login(account: AccountEmployee & { _id: mongoose.Schema.Types.ObjectId }, response: Response) {

    // Get Inforaccount 
    const employee = await this.employeeService.findOne(account.employee);

    const payload = { IDEmp: account.IDEmp, username: employee?.name, roleId: account.roleId, employeeId: employee?._id };

    const access_token = this.createAccessToken(payload);

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE')
    });

    await this.accountEmployeeService.updateAccountEmployeeToken(access_token, ms(this.configService.get<string>('JWT_ACCESS_EXPIRE') as string), account._id.toString());

    // Set refresh_token as cookies
    // HttpOnly only server can use this cookies. Javascript can't use this cookies
    response.cookie("refresh_token", refresh_token,
      {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE') as string)
      }
    );

    response.cookie("access_token", access_token,
      {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>('JWT_ACCESS_EXPIRE') as string),
      }
    );

    return {
      access_token,
      refresh_token,
      payload
    };
  }

  processNewToken = async (refreshToken: string, response: Response) => {
    console.log("Refresh token nè kakakak");

    try {
      const detailPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
      });

      const account = await this.accountEmployeeService.findAccountByIDEmp(detailPayload.IDEmp) as AccountEmployee & { _id: mongoose.Schema.Types.ObjectId };
      if (!account) {
        throw new BadRequestException("Tài khoản không tồn tại");
      }

      const payload = {
        IDEmp: detailPayload.IDEmp,
        username: detailPayload.username,
        roleId: detailPayload.roleId,
        employeeId: detailPayload.employeeId
      };

      const access_token = this.createAccessToken(payload);

      await this.accountEmployeeService.updateAccountEmployeeToken(
        access_token,
        ms(this.configService.get<string>('JWT_ACCESS_EXPIRE') as string),
        account._id.toString()
      );

      response.cookie("access_token", access_token, {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>('JWT_ACCESS_EXPIRE') as string),
      });

      return { access_token, ...payload };

    } catch (err) {
      throw new BadRequestException("Refresh token không hợp lệ hoặc đã hết hạn");
    }
  }



  createAccessToken = (payload: any) => {
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE')
    });
    return access_token;
  }

  decodeToken = (token: string, type: string) => {
    if (type === "access") {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
      });
    }
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
    });
  }

  async logout(response: Response) {
    response.clearCookie("refresh_token");
    response.clearCookie("access_token");
    return { message: "Success Logout" }
  }
}