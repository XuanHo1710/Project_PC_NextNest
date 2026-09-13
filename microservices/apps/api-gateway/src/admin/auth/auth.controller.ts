import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '@project-pc/common';

import type { Request, Response } from 'express';
import { Public } from '../../decorators/customize';
import { LocalAuthGuard } from 'guards/local-auth.guard';
import {
  clearAuthCookies,
  getCookie,
  setAuthCookies,
} from '../../core/auth-cookies';
import { firstValueFrom } from 'rxjs';
import { Throttle } from '@nestjs/throttler';

const jwt = require('jsonwebtoken');

function verifiedRefreshOwnerId(refreshToken: string): string | null {
  try {
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
    );
    return decoded?._id ? String(decoded._id) : null;
  } catch {
    return null;
  }
}

@Throttle({ default: { limit: 15, ttl: 60_000 } })
@Controller('/admin/auth')
export class AuthController {
  constructor(
    @Inject(MICROSERVICE.AUTH_SERVICE)
    private readonly authService: ClientProxy,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const dataLogin = await firstValueFrom(
      this.authService.send('auth.loginAdmin', { accountAdmin: req.user }),
    );

    if (!dataLogin?.access_token) {
      return dataLogin;
    }

    setAuthCookies(
      response,
      'admin',
      dataLogin.access_token,
      dataLogin.refresh_token,
    );

    return { user: dataLogin.payload };
  }

  @Post('/logout')
  @Public()
  async handleLogout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = getCookie(request, 'admin_refresh_token');

    if (refreshToken) {
      const ownerId = verifiedRefreshOwnerId(refreshToken);
      if (ownerId) {
        await firstValueFrom(
          this.authService.send('auth.logoutAdmin', { id: ownerId }),
        );
      }
    }

    clearAuthCookies(response, 'admin');
    return { message: 'Đăng xuất thành công' };
  }

  @Public()
  @Post('/refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = getCookie(req, 'admin_refresh_token');
    if (!refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }

    const result = await firstValueFrom(
      this.authService.send('auth.refreshTokenAdmin', { refreshToken }),
    );

    // TCP serializes thrown HttpExceptions as plain {status:'error'} payloads
    if ((result as any)?.status === 'error') {
      clearAuthCookies(response, 'admin');
      throw new UnauthorizedException(
        (result as any).message || 'Phiên đăng nhập không hợp lệ',
      );
    }

    if (!result || !result.access_token) {
      throw new BadRequestException('Không thể tạo access token mới');
    }

    setAuthCookies(
      response,
      'admin',
      result.access_token,
      result.refresh_token,
    );

    return { user: result.payload };
  }

  @Get('profile')
  getProfile(@Req() request: Request & { user?: any }) {
    const employee = request.user;
    if (!employee) {
      throw new BadRequestException('Không có thông tin đăng nhập');
    }
    return employee;
  }

  @Get('profile-detail')
  getProfileDetail(@Req() request: Request & { user?: any }) {
    const employee = request.user;
    if (!employee) {
      throw new BadRequestException('Không có thông tin đăng nhập');
    }
    return this.authService.send('account_employee.findOne', {
      id: employee._id,
    });
  }

  @Patch('profile')
  async updateProfile(@Req() request: Request & { user?: any }, @Body() body: any) {
    const employee = request.user;
    if (!employee) {
      throw new BadRequestException('Không có thông tin đăng nhập');
    }
    return this.authService.send('account_employee.update_profile', {
      id: employee._id,
      updateProfileDto: body,
    });
  }

  @Patch('/change-password')
  async changePassword(@Req() request: Request & { user?: any }, @Body() body: any) {
    const employee = request.user;
    if (!employee) {
      throw new BadRequestException('Không có thông tin đăng nhập');
    }
    return this.authService.send('auth.changePasswordAdmin', {
      id: employee._id,
      body,
    });
  }
}
