import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

/**
 * Self-service admin endpoints any authenticated employee may reach
 * without an explicit permission grant. Method-aware, exact-scope only.
 */
const ALWAYS_ALLOWED_ADMIN_PATHS: Array<{ method: string; path: string }> = [
  { method: 'GET', path: '/api/v1/admin/auth/profile' },
  { method: 'PATCH', path: '/api/v1/admin/auth/profile' },
  { method: 'GET', path: '/api/v1/admin/auth/profile-detail' },
  { method: 'PATCH', path: '/api/v1/admin/auth/change-password' },
  { method: 'POST', path: '/api/v1/admin/auth/logout' },
];

function normalizePath(path: string | undefined): string {
  return String(path || '')
    .replace(/\/+$/, '')
    .toLowerCase();
}

/**
 * Permission entry grants access to its exact path OR any sub-path
 * (Express route paths like '/api/v1/admin/product/:id' collapse to their base).
 */
function permissionMatches(
  permissionPath: string,
  method: string,
  targetPath: string,
  targetMethod: string,
): boolean {
  const permBase = normalizePath(permissionPath);
  if (!permBase) return false;

  const routeBase = normalizePath(targetPath.split('/:')[0]);
  const sameScope = routeBase === permBase || routeBase.startsWith(permBase + '/');

  return sameScope && String(method).toUpperCase() === String(targetMethod).toUpperCase();
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * JwtAuthGuard only ACTS on admin-area routes; client-area routes are
   * deferred to ClientJwtAuthGuard (both are merged global APP_GUARDs).
   */
  private isAdminArea(request: any): boolean {
    const url = String(request?.originalUrl ?? request?.url ?? '');
    return url.startsWith('/api/v1/admin') || url.startsWith('/api/admin');
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    if (!this.isAdminArea(request)) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (err || !user) {
      throw err || new UnauthorizedException('Token is not valid');
    }

    const roleName = String(user?.role?.name || '').toUpperCase();
    const isSuperAdmin =
      roleName === 'SUPER_ADMIN' || roleName === 'SUPERADMIN' || roleName === 'ADMIN';

    if (isSuperAdmin) {
      return user;
    }

    const targetPath = request?.route?.path;
    const normalizedTarget = normalizePath(targetPath);
    const targetMethod = String(request?.method || '').toUpperCase();

    // Self-service allowance is exact-scope + method-aware (no sub-path grants)
    const alwaysAllowed = ALWAYS_ALLOWED_ADMIN_PATHS.some(
      (allowed) =>
        targetMethod === allowed.method &&
        normalizedTarget === normalizePath(allowed.path),
    );

    // Default-DENY: employees need explicit permissions for every other route.
    if (!alwaysAllowed) {
      const permissions = Array.isArray(user?.role?.permission)
        ? user.role.permission
        : [];

      const granted = permissions.some((p: any) =>
        permissionMatches(p?.path, p?.method, targetPath, request?.method),
      );

      if (!granted) {
        throw new ForbiddenException(
          "You don't have permission to access this endpoint",
        );
      }
    }

    return user;
  }
}