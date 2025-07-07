import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'decorators/customize';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private reflector: Reflector,
        private configService: ConfigService,
        private jwtService: JwtService
    ) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        // Add your custom authentication logic here
        // for example, call super.logIn(request) to establish a session.
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException("You mustn't access this page");
        }

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET")
                }
            );
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['employee'] = payload;
        } catch {
            throw new UnauthorizedException("Token is not valid");
        }
        const result = await super.canActivate(context);
        return result as boolean;
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const targetPath = request?.route?.path;
        const targetMethod = request?.method;


        if (user?.role.permission && user?.role?.permission.length > 0) {

            const isExist = user?.role?.permission?.find(p => (
                targetMethod === p?.method
                && targetPath === p?.path
            ))

            console.log(targetPath);


            if (isExist === undefined &&
                targetPath !== "/api/v1/admin/account-employee" &&
                targetPath !== "/api/v1/admin/auth/decode-access" &&
                targetPath !== "/api/v1/admin/auth/refresh-token"
            ) {
                throw new ForbiddenException("You can't access this endpoint :DDD")
            }
        }

        if (err || !user) {
            return err || new UnauthorizedException("Token is not valid")
        }

        return user;
    }


    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}