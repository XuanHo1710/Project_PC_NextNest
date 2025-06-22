import { Controller, Get, Post, UseGuards, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/auth/passport/local-auth.guard';
import { Employee, Public, ResponseMessage } from 'decorators/customize';
import { AccountEmployee } from 'src/account-employee/entities/account-employee.entity';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Controller('/admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user as AccountEmployee & { _id: mongoose.Schema.Types.ObjectId }, response); // Default la user. Do thang lon Passport lam nhu vay djt con me :)))
  }


  @Get('/decode-access')
  decodeAccessToken(@Req() request: Request) {
    const accessToken: string = request.cookies["access_token"] as string;
    return this.authService.decodeAccessToken(accessToken);
  }

  @Public()
  @Post('/logout')
  handleLogout(@Employee() employee: any, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(employee._id, response);
  }

  @Get("/refresh-token")
  refreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken: string = request.cookies["refresh_token"] as string;
    return this.authService.processNewToken(refreshToken, response);
  }

  @Get('profile')
  getProfile(@Employee() employee: any) {
    return employee;
  }

  // @UseGuards(AuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.employee;
  // }

}
