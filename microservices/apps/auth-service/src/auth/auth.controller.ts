import {
  BadRequestException,
  Body,
  Controller,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
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

  @MessagePattern('auth.googleLogin')
  async googleAuthRedirect(@Payload() data: { user: any }) {
    const user = data.user;
    try {
      const guest = await this.authService.googleLogin(user);
      return guest;
    } catch (error) {
      console.error('Google auth error:', error);
      return null;
    }
  }

  @MessagePattern('auth.refreshToken')
  async refresh(@Payload() data: { refreshToken: string }) {
    if (!data.refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }
    return this.authService.processNewToken(data.refreshToken);
  }

  @MessagePattern('auth.logout')
  async logout(@Payload() data: { id: string }) {
    console.log('auth.logout payload:', data);
    return this.authService.logout(data.id);
  }
}
