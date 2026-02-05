import {
  BadRequestException,
  Controller,
  Get,
  Inject,
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
import { ConfigService } from '@nestjs/config';

const ms = require('ms');

@Controller('/admin/auth')
export class AuthController {
  constructor(
    @Inject(MICROSERVICE.AUTH_SERVICE)
    private readonly authService: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('AuthController login called');
    const dataLogin = await firstValueFrom(
      this.authService.send('auth.loginAdmin', { accountAdmin: req.user }),
    );

    // Set cookies
    response.cookie('admin_refresh_token', dataLogin.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ms(
        this.configService.get<string>('JWT_REFRESH_EXPIRE') as string,
      ),
    });
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
    const refreshToken = req.cookies?.admin_refresh_token;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }

    return this.authService.send('auth.refreshTokenAdmin', { refreshToken });
  }

  @Get('profile')
  getProfile(@Employee() employee: any) {
    return employee;
  }
}
