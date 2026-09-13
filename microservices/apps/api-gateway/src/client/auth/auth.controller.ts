import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '@project-pc/common';

import type { Request, Response } from 'express';
import { Public } from '../../decorators/customize';
import { GoogleAuthGuard } from '../../guards/google-auth.guard';
import { ClientLocalAuthGuard } from 'guards/client-local-jwt.guard';
import {
  clearAuthCookies,
  getCookie,
  setAuthCookies,
} from '../../core/auth-cookies';
import { firstValueFrom } from 'rxjs';
import { Throttle } from '@nestjs/throttler';

const jwt = require('jsonwebtoken');

function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * Extracts the session owner from a refresh token ONLY after verifying its
 * signature — prevents forged tokens from revoking other users' sessions.
 */
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

@Throttle({ default: { limit: 20, ttl: 60_000 } })
@Controller('/client/auth')
export class AuthController {
  constructor(
    @Inject(MICROSERVICE.AUTH_SERVICE)
    private readonly authService: ClientProxy,
  ) {}

  @UseGuards(ClientLocalAuthGuard)
  @Post('login')
  @Public()
  async login(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = request.user;
    const dataLogin = await firstValueFrom(
      this.authService.send('auth.login', { user }),
    );

    if (!dataLogin?.access_token) {
      return dataLogin;
    }

    setAuthCookies(
      response,
      'client',
      dataLogin.access_token,
      dataLogin.refresh_token,
    );

    return { user: dataLogin.payload };
  }

  @Post('register')
  @Public()
  async register(
    @Body()
    registerDto: {
      email: string;
      password: string;
      fullname: string;
      phone: string;
    },
  ) {
    const { email, password, fullname, phone } = registerDto;

    if (!email || !password || !fullname || !phone) {
      throw new BadRequestException('Vui lòng điền đầy đủ thông tin');
    }

    const guest = await firstValueFrom(
      this.authService.send('auth.register', {
        email: String(email).trim().toLowerCase(),
        password,
        fullname,
        phone,
      }),
    );
    return guest;
  }

  @Get('/google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() request: Request, @Res() response: Response) {
    const user: any = (request as any).user;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (!user) {
      return response.send(`
      <script>
        window.opener.postMessage(
          { type: 'GOOGLE_LOGIN_FAILED' },
          '${safeJsonStringify(clientUrl)}'
        );
        window.close();
      </script>
    `);
    }
    try {
      const checkAccountGoogle = await firstValueFrom(
        this.authService.send('auth.googleLogin', {
          user: user,
        }),
      );
      const result = await firstValueFrom(
        this.authService.send('auth.login', { user: checkAccountGoogle }),
      );

      if (!result?.access_token) {
        throw new Error('Login failed');
      }

      setAuthCookies(
        response,
        'client',
        result.access_token,
        result.refresh_token,
      );

      return response.send(`
      <script>
        window.opener.postMessage(
          {
            type: 'GOOGLE_LOGIN_SUCCESS',
            payload: ${safeJsonStringify(result.payload)}
          },
          '${safeJsonStringify(clientUrl)}'
        );
        window.close();
      </script>
    `);
    } catch (error) {
      clearAuthCookies(response, 'client');
      return response.send(`
      <script>
        window.opener.postMessage(
          { type: 'GOOGLE_LOGIN_FAILED' },
          '${safeJsonStringify(clientUrl)}'
        );
        window.close();
      </script>
    `);
    }
  }

  @Get('verify-email')
  @Public()
  async verifyEmail(@Query('token') token: string, @Res() response: Response) {
    if (!token) {
      return response.send(
        this.getVerifyEmailHtml(false, 'Token không hợp lệ'),
      );
    }

    try {
      await firstValueFrom(
        this.authService.send('auth.verifyEmail', { token }),
      );
      return response.send(
        this.getVerifyEmailHtml(
          true,
          'Tài khoản đã được kích hoạt thành công!',
        ),
      );
    } catch (error: any) {
      const message = error?.message || 'Token không hợp lệ hoặc đã hết hạn';
      return response.send(this.getVerifyEmailHtml(false, message));
    }
  }

  private getVerifyEmailHtml(success: boolean, message: string): string {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const color = success ? '#10b981' : '#ef4444';
    const icon = success ? '✓' : '✗';
    const title = success ? 'Kích hoạt thành công!' : 'Kích hoạt thất bại';
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 48px; text-align: center; max-width: 440px; width: 90%; }
    .icon { width: 80px; height: 80px; border-radius: 50%; background: ${color}15; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 40px; color: ${color}; font-weight: bold; }
    h1 { color: #1e293b; font-size: 24px; margin: 0 0 12px; }
    p { color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 32px; }
    .btn { display: inline-block; background: ${color}; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${clientUrl}/home" class="btn">${success ? 'Đăng nhập ngay' : 'Về trang chủ'}</a>
  </div>
</body>
</html>`;
  }

  @Post('refresh')
  @Public()
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = getCookie(request, 'client_refresh_token');
    if (!refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }

    const result = await firstValueFrom(
      this.authService.send('auth.refreshToken', { refreshToken }),
    );

    // TCP serializes thrown HttpExceptions as plain {status:'error'} payloads
    if ((result as any)?.status === 'error') {
      clearAuthCookies(response, 'client');
      throw new UnauthorizedException(
        (result as any).message || 'Phiên đăng nhập không hợp lệ',
      );
    }

    if (!result || !result.access_token) {
      throw new BadRequestException('Không thể tạo access token mới');
    }

    setAuthCookies(
      response,
      'client',
      result.access_token,
      result.refresh_token,
    );

    return { user: result.payload };
  }

  @Post('logout')
  @Public()
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = getCookie(request, 'client_refresh_token');

    if (refreshToken) {
      const ownerId = verifiedRefreshOwnerId(refreshToken);
      if (ownerId) {
        await firstValueFrom(
          this.authService.send('auth.logout', { id: ownerId }),
        );
      }
    }

    clearAuthCookies(response, 'client');
    return { message: 'Đăng xuất thành công' };
  }
}
