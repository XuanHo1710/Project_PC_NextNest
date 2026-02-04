import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from 'constrain';

import type { Request, Response } from 'express';
import { Guest, Public } from '../../decorators/customize';
import { GoogleAuthGuard } from '../../guards/google-auth.guard';
import { ClientJwtAuthGuard } from '../../guards/client-jwt-auth.guard';
import { ClientLocalAuthGuard } from 'guards/client-local-jwt.guard';
import { firstValueFrom } from 'rxjs';
@Controller('client/auth')
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
    console.log('AuthController - login called');
    const user = request.user;
    return { user };

    // return await this.authService
    //   .send('auth.login', { user, response })
    //   .toPromise();
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
        email,
        password,
        fullname,
        phone,
      }),
    );
    return guest;
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: Request) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Guest() user: any, @Res() response: Response) {
    if (!user) {
      return response.status(400).json({
        message: 'Đăng nhập Google thất bại',
      });
    }

    try {
      // const guest = await this.authService.googleLogin(user);
      // const result = await this.authService.login(guest, response);

      // Redirect to frontend with success
      return response.redirect(
        // `${process.env.CLIENT_URL}/auth/success?token=${result.access_token}`,
        '',
      );
    } catch (error) {
      console.error('Google auth error:', error);
      return response.redirect(
        `${process.env.CLIENT_URL}?error=google_auth_failed`,
      );
    }
  }

  @Post('refresh')
  @Public()
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['client_refresh_token'];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }
    // return this.authService.processNewToken(refreshToken, response);
  }

  @Post('logout')
  @Public()
  async logout(@Res({ passthrough: true }) response: Response) {
    // return this.authService.logout(response);
  }

  @Get('profile')
  @UseGuards(ClientJwtAuthGuard)
  async getProfile(@Guest() guest: any) {
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

  @Post('refresh-token')
  @Public()
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['client_refresh_token'];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }

    try {
      // const result = await this.authService.processNewToken(
      //   refreshToken,
      //   response,
      // );
      // return result;
    } catch (error) {
      throw new BadRequestException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }
}
