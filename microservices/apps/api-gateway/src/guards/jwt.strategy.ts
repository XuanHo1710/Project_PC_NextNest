import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
// import { RoleService } from 'src/admin/role/role.service';
import { MICROSERVICE } from '@project-pc/common';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @Inject(MICROSERVICE.AUTH_SERVICE) private roleService: ClientProxy,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_ACCESS_TOKEN_SECRET is not defined in environment variables',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const role = await firstValueFrom(
      this.roleService.send('role.findOne', { id: payload.roleId }),
    );

    payload.role = role;
    return { ...payload };
  }
}
