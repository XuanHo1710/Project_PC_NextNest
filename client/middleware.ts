import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin routes that require authentication
const protectedAdminPaths = [
    '/admin/dashboard',
    '/admin/products',
    '/admin/account-employee',
    '/admin/account-guest',
    '/admin/category',
    '/admin/discount',
    '/admin/employee',
    '/admin/guest',
    '/admin/permission',
    '/admin/role',
];

// Client routes that require authentication
const protectedClientPaths = [
    '/profile',
    '/orders',
    '/wishlist',
    '/checkout',
];

// Auth pages (redirect if already logged in)
const authPaths = ['/auth/login'];

export function middleware(request: NextRequest) {
    // Check ONLY access_token (Backend handles refresh_token in Redis)
    const accessToken = request.cookies.get('access_token')?.value;
    const pathname = request.nextUrl.pathname;

    // Fix VNPay return URL format - replace first & with ?
    if (pathname === '/payment/vnpay-return' && request.nextUrl.search.startsWith('&')) {
        const fixedSearch = '?' + request.nextUrl.search.substring(1);
        const fixedUrl = new URL(pathname + fixedSearch, request.url);
        return NextResponse.redirect(fixedUrl);
    }

    // Admin routes protection
    if (protectedAdminPaths.some((path) => pathname.startsWith(path)) && !accessToken) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Client routes protection
    if (protectedClientPaths.some((path) => pathname.startsWith(path)) && !accessToken) {
        const redirectUrl = new URL('/home', request.url);
        redirectUrl.searchParams.set('login', 'required');
        return NextResponse.redirect(redirectUrl);
    }

    // Already logged in, redirect from auth pages to dashboard/home
    if (authPaths.some((path) => pathname.startsWith(path)) && accessToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        // Admin routes
        '/admin/:path*',
        // Auth routes
        '/auth/:path*',
        // Protected client routes
        '/profile/:path*',
        '/orders/:path*',
        '/wishlist/:path*',
        '/checkout/:path*',
        // Payment routes
        '/payment/:path*',
    ],
};
