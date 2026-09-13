import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { MICROSERVICE } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(MICROSERVICE.AUTH_SERVICE) private authService: ClientProxy,
  ) {
    super({
      usernameField: 'IDEmp', // <-- Quan trọng
      passwordField: 'password',
    });
  }

  async validate(IDEmp: string, password: string) {
    const account = await firstValueFrom(
      this.authService.send('auth.signInAdmin', { IDEmp, password }),
    );
    if (!account) {
      throw new UnauthorizedException('Wrong ID Employee or Password');
    }
    return account;
  }
}
