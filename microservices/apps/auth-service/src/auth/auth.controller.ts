import {
  BadRequestException,
  Body,
  Controller,
  Req,
  Res,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientAuthService } from 'src/auth/auth.service';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';

@Controller()
export class AuthController {
  constructor(private readonly authService: ClientAuthService) {}

  @MessagePattern('auth.signIn')
  async signIn(@Payload() data: { email: string; password: string }) {
    console.log('auth.signIn payload:', data);
    const { email, password } = data;

    return this.authService.signIn(email, password);
  }

  async login(
    @Body() loginDto: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new BadRequestException('Email và mật khẩu không được để trống');
    }

    const guest = await this.authService.signIn(email, password);
    if (!guest) {
      throw new BadRequestException('Email hoặc mật khẩu không chính xác');
    }

    return this.authService.login(guest as any, response);
  }

  @MessagePattern('auth.register')
  async register(
    @Payload()
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

    const guest = await this.authService.register(
      email,
      password,
      fullname,
      phone,
    );

    return guest;
  }

  async googleAuth(@Req() req: Request) {
    // Initiates the Google OAuth2 login flow
  }

  async googleAuthRedirect(@Req() req: Request, @Res() response: Response) {
    const user = req.user;

    if (!user) {
      return response.status(400).json({
        message: 'Đăng nhập Google thất bại',
      });
    }

    try {
      const guest = await this.authService.googleLogin(user);
      const result = await this.authService.login(guest, response);

      // Redirect to frontend with success
      return response.redirect(
        `${process.env.CLIENT_URL}/auth/success?token=${result.access_token}`,
      );
    } catch (error) {
      console.error('Google auth error:', error);
      return response.redirect(
        `${process.env.CLIENT_URL}?error=google_auth_failed`,
      );
    }
  }

  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['client_refresh_token'];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }
    return this.authService.processNewToken(refreshToken, response);
  }

  async logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  async getProfile(guest: any) {
    // Now we can access the authenticated guest directly
    return {
      message: 'Profile retrieved successfully',
      user: {
        guestId: guest.guestId,
        email: guest.email,
        fullname: guest.fullname,
        avatar: guest.avatar,
        authProvider: guest.authProvider,
      },
    };
  }

  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['client_refresh_token'];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }

    try {
      const result = await this.authService.processNewToken(
        refreshToken,
        response,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }
}
