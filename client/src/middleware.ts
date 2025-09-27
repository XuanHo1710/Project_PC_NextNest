// import axios from 'axios';
import { pathAdminRoutes } from '@/config/route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách route cần đăng nhập 
const protectedPaths = [
    pathAdminRoutes.accountEmployee,
    pathAdminRoutes.accountGuest,
    pathAdminRoutes.category,
    pathAdminRoutes.dashboard,
    pathAdminRoutes.discount,
    pathAdminRoutes.employee,
    pathAdminRoutes.guest,
    pathAdminRoutes.permission,
    pathAdminRoutes.products,
    pathAdminRoutes.role
];
const authPaths = [pathAdminRoutes.login];
export function middleware(request: NextRequest) {
    const token = request.cookies.get('refresh_token')?.value;
    // const accessToken = request.cookies.get('access_token')?.value;

    // Fix VNPay return URL format - thay & đầu tiên thành ?
    if (request.nextUrl.pathname === '/payment/vnpay-return' && request.nextUrl.search.startsWith('&')) {
        const fixedSearch = '?' + request.nextUrl.search.substring(1);
        const fixedUrl = new URL(request.nextUrl.pathname + fixedSearch, request.url);
        return NextResponse.redirect(fixedUrl);
    }

    if (protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path)) && !token) {
        return NextResponse.redirect(new URL(pathAdminRoutes.login, request.url));
    }

    // // Nếu đã đăng nhập mà truy cập /auth/login → chuyển sang dashboard
    if (authPaths.some((path) => request.nextUrl.pathname.startsWith(path)) && token) {
        return NextResponse.redirect(new URL(pathAdminRoutes.dashboard, request.url));
    }

    return NextResponse.next();
}

