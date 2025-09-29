import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'decorators/customize';

@Injectable()
export class ClientJwtAuthGuard extends AuthGuard('client-jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // For client routes, we need to validate JWT token
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const targetPath = request?.route?.path;
        const targetMethod = request?.method;

        // Allow access to certain client endpoints without strict validation
        const publicClientPaths = [
            '/api/v1/client/auth/decode-access',
            '/api/v1/client/auth/refresh-token',
            '/api/v1/client/auth/profile',
            '/api/v1/client/auth/logout',
            '/api/v1/client/auth/login',
            '/api/v1/client/auth/register',
            '/api/v1/client/auth/google-login',
        ];

        // If it's a public client path, allow access
        if (publicClientPaths.includes(targetPath)) {
            return user || null; // Return user if exists, null if not
        }

        // For protected client routes (like orders, payments, profile updates)
        if (err || !user) {
            throw err || new UnauthorizedException('Vui lòng đăng nhập để truy cập tính năng này');
        }

        // Additional validation for client users
        if (!user.guestId) {
            throw new UnauthorizedException('Thông tin người dùng không hợp lệ');
        }

        return user;
    }
}