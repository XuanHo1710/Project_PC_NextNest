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
import { AccountGuest } from 'src/account-guest/entities/account-guest.entity';

@Controller()
export class AuthController {
  constructor(private readonly authService: ClientAuthService) {}

  @MessagePattern('auth.signIn')
  async signIn(@Payload() data: { email: string; password: string }) {
    console.log('auth.signIn payload:', data);
    const { email, password } = data;

    return this.authService.signIn(email, password);
  }

  @MessagePattern('auth.login')
  async login(@Payload() loginDto: { user: AccountGuest }) {
    return this.authService.login(loginDto.user);
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
      const result = await this.authService.login(guest);

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

  @MessagePattern('auth.refreshToken')
  async refresh(@Payload() data: { refreshToken: string }) {
    if (!data.refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }
    return this.authService.processNewToken(data.refreshToken);
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
}
