import axios from 'axios';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('refresh_token')?.value;

    const accountEmployee = getAccountEmployee(token as string || "");

    if (!accountEmployee) {
        return NextResponse.redirect(new URL('/admin/auth/login', request.url));
    }


    // Danh sách route cần đăng nhập 
    const protectedPaths = ['/admin/dashboard', '/admin/employee', '/admin/product'];

    if (
        protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))
        && !token
    ) {
        return NextResponse.redirect(new URL('/admin/auth/login', request.url));
    }

    return NextResponse.next();
}


async function getAccountEmployee(token: string) {
    try {
        const response = await axios.post("http://localhost:8080/api/v1/admin/account-employee/token-account", token)
        return response.data;
    } catch {
        return null;
    }
}
