import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // const request = context.switchToHttp().getRequest();
    // const token = this.extractTokenFromHeader(request);

    // if (!token) {
    //     throw new UnauthorizedException("You mustn't access this page");
    // }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const targetPath = request?.route?.path;
    const targetMethod = request?.method;

    if (user?.role?.permission && user?.role?.permission.length > 0) {
      const isExist = user?.role?.permission?.find(
        (p: any) => targetMethod === p?.method && targetPath === p?.path,
      );

      if (
        isExist === undefined &&
        targetPath !== '/api/v1/admin/account-employee' &&
        targetPath !== '/api/v1/admin/auth/decode-access' &&
        targetPath !== '/api/v1/admin/auth/refresh-token' &&
        targetPath !== '/api/v1/admin/auth/profile' &&
        targetPath !== '/api/v1/admin/history' &&
        targetPath !== '/api/v1/admin/auth/logout'
      ) {
        throw new ForbiddenException(
          "You don't have permission to access this endpoint",
        );
      }
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Token is not valid');
    }

    return user;
  }

  // private extractTokenFromHeader(request: any): string | undefined {
  //     const [type, token] = request.headers.authorization?.split(' ') ?? [];
  //     return type === 'Bearer' ? token : undefined;
  // }
}
