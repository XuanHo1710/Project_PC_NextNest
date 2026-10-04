import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleAuthGuard.name);

  /**
   * On the callback route, catch Passport errors at the canActivate level
   * so the controller can render a user-friendly HTML page instead of the
   * global exception filter returning a raw JSON 401 (white screen).
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isCallback = request.url?.includes('/callback');

    if (!isCallback) {
      // Initial redirect to Google — let Passport handle it normally
      return super.canActivate(context) as Promise<boolean>;
    }

    // Callback route: catch Passport errors so the controller can render HTML
    try {
      const result = await (super.canActivate(context) as Promise<boolean>);
      return result;
    } catch (err: any) {
      this.logger.warn(
        `Google OAuth callback failed: ${err?.message || 'unknown error'}`,
      );
      // Attach null user so controller renders error HTML
      request.user = null;
      return true;
    }
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    _info: any,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest();
    const isCallback = request.url?.includes('/callback');

    if (err || !user) {
      if (isCallback) {
        this.logger.warn(
          `Google OAuth handleRequest failed: ${err?.message || 'no user returned'}`,
        );
        return null as any;
      }
      throw err || new UnauthorizedException();
    }

    return user;
  }
}