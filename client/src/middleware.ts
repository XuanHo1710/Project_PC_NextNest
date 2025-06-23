// import axios from 'axios';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách route cần đăng nhập 
const protectedPaths = ['/admin/dashboard', '/admin/employee', '/admin/product'];
const authPaths = ['/auth/login'];
export function middleware(request: NextRequest) {
    const token = request.cookies.get('refresh_token')?.value;
    const accessToken = request.cookies.get('access_token')?.value;


    if (protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path)) && (!token || !accessToken)) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }


    // Nếu đã đăng nhập mà truy cập /auth/login → chuyển sang dashboard
    if (authPaths.some((path) => request.nextUrl.pathname.startsWith(path)) && token && accessToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
}

