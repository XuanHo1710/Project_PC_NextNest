import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { MICROSERVICE } from 'constraint';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ClientLocalStrategy extends PassportStrategy(
  Strategy,
  'client-strategy-local',
) {
  constructor(
    @Inject(MICROSERVICE.AUTH_SERVICE) private authService: ClientProxy,
  ) {
    super({
      usernameField: 'email', // <-- Quan trọng
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const account = await firstValueFrom(
      this.authService.send('auth.signIn', { email, password }),
    );
    if (!account) {
      throw new UnauthorizedException('Wrong Email or Password');
    }
    return account;
  }
}
