import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { extractJwtFromCookie } from '../core/auth-cookies';

@Injectable()
export class ClientJwtStrategy extends PassportStrategy(
  Strategy,
  'client-jwt',
) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_ACCESS_TOKEN_SECRET is not defined in environment variables',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie('client_access_token'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
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
