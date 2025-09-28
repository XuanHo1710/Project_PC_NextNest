import { Controller, Get, Post, Body, Res, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';
import { ClientAuthService } from './auth.service';
import { GoogleAuthGuard } from '../../admin/auth/passport/google-auth.guard';

@Controller('/client/auth')
export class ClientAuthController {
    constructor(private readonly authService: ClientAuthService) { }

    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }, @Res({ passthrough: true }) response: Response) {
        const { email, password } = loginDto;

        if (!email || !password) {
            throw new BadRequestException('Email và mật khẩu không được để trống');
        }

        const guest = await this.authService.signIn(email, password);
        if (!guest) {
            throw new BadRequestException('Email hoặc mật khẩu không chính xác');
        }

        return this.authService.login(guest, response);
    }

    @Post('register')
    async register(@Body() registerDto: { email: string; password: string; fullname: string }) {
        const { email, password, fullname } = registerDto;

        if (!email || !password || !fullname) {
            throw new BadRequestException('Vui lòng điền đầy đủ thông tin');
        }

        const guest = await this.authService.register(email, password, fullname);
        return {
            user: {
                id: guest._id,
                email: guest.email,
                fullname: guest.fullname
            }
        };
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req: Request) {
        // Initiates the Google OAuth2 login flow
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
        const user = req.user;

        if (!user) {
            throw new BadRequestException('Đăng nhập Google thất bại');
        }

        const guest = await this.authService.googleLogin(user);
        const result = await this.authService.login(guest, response);

        // Redirect to frontend with success
        response.redirect(`${process.env.CLIENT_URL}/auth/success?token=${result.access_token}`);
        return result;
    }

    @Post('refresh')
    async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies['client_refresh_token'];

        if (!refreshToken) {
            throw new BadRequestException('Refresh token không tồn tại');
        }

        return this.authService.processNewToken(refreshToken, response);
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        return this.authService.logout(response);
    }

    @Get('profile')
    async getProfile(@Req() request: Request) {
        // This will be implemented with JWT guard later
        const token = request.cookies['client_access_token'];
        if (!token) {
            throw new BadRequestException('Chưa đăng nhập');
        }

        // For now, return a simple response
        return { message: 'Profile endpoint' };
    }
}