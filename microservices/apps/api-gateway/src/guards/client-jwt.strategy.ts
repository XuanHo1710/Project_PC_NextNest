import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class ClientJwtStrategy extends PassportStrategy(
  Strategy,
  'client-jwt',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
        'default-secret',
    });
  }

  async validate(payload: any) {
    return {
      _id: payload._id,
      guestId: payload.guestId,
      email: payload.email,
      avatar: payload.avatar,
      accountStatus: payload.accountStatus,
      fullname: payload.fullname,
      authProvider: payload.authProvider,
    };
  }
}
