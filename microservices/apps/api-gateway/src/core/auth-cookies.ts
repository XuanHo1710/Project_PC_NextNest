import type { Request, Response } from 'express';

const ms = require('ms');

export type AuthCookiePrefix = 'client' | 'admin';

const isProduction = () => process.env.NODE_ENV === 'production';

function parseSeconds(value: string | undefined, fallback: string): number {
  const parsed = ms(String(value || fallback));
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : 0;
}

export function setAuthCookies(
  response: Response,
  prefix: AuthCookiePrefix,
  accessToken: string,
  refreshToken: string,
): void {
  const accessMaxAge = parseSeconds(process.env.JWT_ACCESS_EXPIRE, '3600s');
  const refreshMaxAge = parseSeconds(process.env.JWT_REFRESH_EXPIRE, '30d');
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
  const common = {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax' as const,
    path: '/',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };

  response.cookie(`${prefix}_access_token`, accessToken, {
    ...common,
    maxAge: accessMaxAge * 1000,
  });
  response.cookie(`${prefix}_refresh_token`, refreshToken, {
    ...common,
    maxAge: refreshMaxAge * 1000,
  });
}

export function clearAuthCookies(
  response: Response,
  prefix: AuthCookiePrefix,
): void {
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
  const common = {
    path: '/',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };
  response.clearCookie(`${prefix}_access_token`, common);
  response.clearCookie(`${prefix}_refresh_token`, common);
}

export function getCookie(request: Request, name: string): string | undefined {
  return request?.cookies?.[name];
}

export const extractJwtFromCookie =
  (cookieName: string) =>
  (request?: Request & { cookies?: Record<string, string> }): string | null =>
    request?.cookies?.[cookieName] ?? null;
