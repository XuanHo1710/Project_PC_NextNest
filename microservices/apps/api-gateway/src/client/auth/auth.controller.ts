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
import { MICROSERVICE } from '@project-pc/common';

import type { Request, Response } from 'express';
import { Guest, Public } from '../../decorators/customize';
import { GoogleAuthGuard } from '../../guards/google-auth.guard';
import { ClientLocalAuthGuard } from 'guards/client-local-jwt.guard';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

const ms = require('ms');

@Controller('/client/auth')
export class AuthController {
  constructor(
    @Inject(MICROSERVICE.AUTH_SERVICE)
    private readonly authService: ClientProxy,
    private readonly configService: ConfigService,
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
    return dataLogin;
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
      return response.send(`
      <script>
        window.opener.postMessage(
          { type: 'GOOGLE_LOGIN_FAILED' },
          '${process.env.CLIENT_URL}'
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
      return response.send(`
      <script>
        window.opener.postMessage(
          {
            type: 'GOOGLE_LOGIN_SUCCESS',
            payload: ${JSON.stringify(result)}
          },
          '${process.env.CLIENT_URL}'
        );
        window.close();
      </script>
    `);
    } catch (error) {
      return response.send(`
      <script>
        window.opener.postMessage(
          { type: 'GOOGLE_LOGIN_FAILED' },
          '${process.env.CLIENT_URL}'
        );
        window.close();
      </script>
    `);
    }
  }

  @Post('refresh')
  @Public()
  async refresh(@Req() request: Request) {
    try {
      const sessionId = request.cookies?.client_sessionId;
      if (!sessionId) {
        throw new BadRequestException('Session ID không tồn tại');
      }

      const result = await firstValueFrom(
        this.authService.send('auth.refreshToken', {
          sessionId,
        }),
      );

      if (!result || !result.access_token) {
        throw new BadRequestException('Không thể tạo access token mới');
      }

      return result;
    } catch (error) {
      console.error('Error in refresh handler:', error);
      throw error;
    }
  }

  @Post('logout')
  async logout(
    @Guest() guest: any,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (request.cookies?.client_refresh_token) {
      response.clearCookie('client_refresh_token', {
        path: '/',
      });
    }

    return this.authService.send('auth.logout', { id: guest._id });
  }

  @Get('profile')
  async getProfile(@Guest() guest: any) {
    console.log('Called profile endpoint', guest);
    return guest;
  }
}
