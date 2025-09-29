import { Controller, Get, Post, Body, Res, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';
import { ClientAuthService } from './auth.service';
import { GoogleAuthGuard } from '../../admin/auth/passport/google-auth.guard';
import { ClientJwtAuthGuard } from './client-jwt-auth.guard';
import { Guest, Public } from 'decorators/customize';

@Controller('/client/auth')
export class ClientAuthController {
    constructor(private readonly authService: ClientAuthService) { }

    @Post('login')
    @Public()
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
    @Public()
    async register(@Body() registerDto: { email: string; password: string; fullname: string, phone: string }) {
        const { email, password, fullname, phone } = registerDto;

        if (!email || !password || !fullname || !phone) {
            throw new BadRequestException('Vui lòng điền đầy đủ thông tin');
        }

        const guest = await this.authService.register(email, password, fullname, phone);
        return {
            user: {
                id: guest.account.guestId,
                email: guest.account.email,
                fullname: guest.guest.fullname,
                phone: guest.guest.phone
            }
        };
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
    async googleAuthRedirect(@Req() req: Request, @Res() response: Response) {
        const user = req.user;

        if (!user) {
            return response.status(400).json({
                message: 'Đăng nhập Google thất bại'
            });
        }

        try {
            const guest = await this.authService.googleLogin(user);
            const result = await this.authService.login(guest, response);

            // Redirect to frontend with success
            return response.redirect(`${process.env.CLIENT_URL}/auth/success?token=${result.access_token}`);
        } catch (error) {
            console.error('Google auth error:', error);
            return response.redirect(`${process.env.CLIENT_URL}?error=google_auth_failed`);
        }
    }

    @Post('refresh')
    @Public()
    async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies['client_refresh_token'];
        if (!refreshToken) {
            throw new BadRequestException('Refresh token không tồn tại');
        }
        return this.authService.processNewToken(refreshToken, response);
    }

    @Post('logout')
    @Public()
    async logout(@Res({ passthrough: true }) response: Response) {
        return this.authService.logout(response);
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
                authProvider: guest.authProvider
            }
        };
    }

    @Post('refresh-token')
    @Public()
    async refreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies['client_refresh_token'];
        if (!refreshToken) {
            throw new BadRequestException('Refresh token không tồn tại');
        }

        try {
            const result = await this.authService.processNewToken(refreshToken, response);
            return result;
        } catch (error) {
            throw new BadRequestException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
    }

    @Get('decode-access')
    @UseGuards(ClientJwtAuthGuard)
    async decodeAccessToken(@Guest() guest: any) {
        // Return decoded token info for frontend
        return {
            message: 'Token decoded successfully',
            user: guest
        };
    }
}