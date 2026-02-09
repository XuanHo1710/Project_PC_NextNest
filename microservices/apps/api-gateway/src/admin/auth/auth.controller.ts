import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Patch,
  Body,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '@project-pc/common';

import type { Request, Response } from 'express';
import { Employee, Public } from '../../decorators/customize';
import { LocalAuthGuard } from 'guards/local-auth.guard';
import { firstValueFrom } from 'rxjs';

@Controller('/admin/auth')
export class AuthController {
  constructor(
    @Inject(MICROSERVICE.AUTH_SERVICE)
    private readonly authService: ClientProxy,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request) {
    const dataLogin = await firstValueFrom(
      this.authService.send('auth.loginAdmin', { accountAdmin: req.user }),
    );

    return dataLogin;
  }

  @Post('/logout')
  handleLogout(
    @Employee() employee: any,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (request.cookies?.admin_refresh_token) {
      response.clearCookie('admin_refresh_token', {
        path: '/',
      });
    }
    return this.authService.send('auth.logoutAdmin', { id: employee._id });
  }

  @Public()
  @Post('/refresh')
  refreshToken(@Req() req: Request) {
    const sessionId = req.cookies?.admin_sessionId;
    if (!sessionId) {
      throw new BadRequestException('Session không tồn tại');
    }

    return this.authService.send('auth.refreshTokenAdmin', { sessionId });
  }

  @Get('profile')
  getProfile(@Employee() employee: any) {
    return employee;
  }

  @Get('profile-detail')
  getProfileDetail(@Employee() employee: any) {
    return this.authService.send('account_employee.findOne', {
      id: employee._id,
    });
  }

  @Patch('profile')
  async updateProfile(@Employee() employee: any, @Body() body: any) {
    const { _id } = employee;
    return this.authService.send('account_employee.update_profile', {
      id: _id,
      updateProfileDto: body,
    });
  }

  @Patch('/change-password')
  async changePassword(@Employee() employee: any, @Body() body: any) {
    const { _id } = employee;
    return this.authService.send('auth.changePasswordAdmin', {
      id: _id,
      body,
    });
  }
}
