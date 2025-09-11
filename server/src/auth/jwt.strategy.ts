
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

    constructor(
        private configService: ConfigService,
        private roleService: RoleService
    ) {
        const secret = configService.get<string>("JWT_ACCESS_TOKEN_SECRET");

        if (!secret) {
            throw new Error("JWT_ACCESS_TOKEN_SECRET is not defined in environment variables");
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        const role = await this.roleService.findOne(payload?.roleId);
        return { ...payload, role };
    }
}
