import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientAuthService } from 'src/auth/auth.service';
import { AccountGuest } from 'src/account-guest/entities/account-guest.entity';
import { AccountEmployee } from 'src/account-employee/entities/account-employee.entity';

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
  async refresh(@Payload() data: { sessionId: string }) {
    if (!data.sessionId) {
      throw new BadRequestException('Session ID không tồn tại');
    }
    return this.authService.processNewToken(data.sessionId);
  }

  @MessagePattern('auth.logout')
  async logout(@Payload() data: { id: string }) {
    return this.authService.logout(data.id);
  }

  // Admin service handlers
  @MessagePattern('auth.loginAdmin')
  async loginAdmin(@Payload() data: { accountAdmin: AccountEmployee }) {
    return this.authService.loginAdmin(data.accountAdmin);
  }

  @MessagePattern('auth.logoutAdmin')
  handleLogout(@Payload() data: { id: string }) {
    return this.authService.logoutAdmin(data.id);
  }

  @MessagePattern('auth.refreshTokenAdmin')
  refreshToken(@Payload() data: { refreshToken: string }) {
    if (!data.refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }
    return this.authService.processNewTokenAdmin(data.refreshToken);
  }

  @MessagePattern('auth.signInAdmin')
  async signInAdmin(@Payload() data: { IDEmp: string; password: string }) {
    console.log('auth.signInAdmin payload:', data);
    const { IDEmp, password } = data;
    return this.authService.signInAdmin(IDEmp, password);
  }
}
