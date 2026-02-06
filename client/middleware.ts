import { pathAdminRoutes } from "@/config/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin routes that require authentication
const protectedAdminPaths = [
  "/admin/dashboard",
  "/admin/products",
  "/admin/account-employee",
  "/admin/account-guest",
  "/admin/category",
  "/admin/discount",
  "/admin/employee",
  "/admin/guest",
  "/admin/permission",
  "/admin/role",
];

// Client routes that require authentication
const protectedClientPaths = ["/profile", "/orders", "/wishlist", "/checkout"];

// Auth pages (redirect if already logged in)
const authPaths = ["/auth/login"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Read the correct cookie names set by the login routes
  const clientAccessToken = request.cookies.get("client_access_token")?.value;
  const adminAccessToken = request.cookies.get("admin_access_token")?.value;
  const adminSessionId = request.cookies.get("admin_sessionId")?.value;


  // Fix VNPay return URL format - replace first & with ?
  if (
    pathname === "/payment/vnpay-return" &&
    request.nextUrl.search.startsWith("&")
  ) {
    const fixedSearch = "?" + request.nextUrl.search.substring(1);
    const fixedUrl = new URL(pathname + fixedSearch, request.url);
    return NextResponse.redirect(fixedUrl);
  }

  // Admin routes protection — check admin_access_token
  if (
    protectedAdminPaths.some((path) => pathname.startsWith(path)) &&
    !adminAccessToken && !adminSessionId
  ) {
    return NextResponse.redirect(new URL(pathAdminRoutes.login, request.url));
  }

  // Client routes protection — check client_access_token
  if (
    protectedClientPaths.some((path) => pathname.startsWith(path)) &&
    !clientAccessToken
  ) {
    const redirectUrl = new URL("/home", request.url);
    redirectUrl.searchParams.set("login", "required");
    return NextResponse.redirect(redirectUrl);
  }

  // Already logged in as admin, redirect from auth pages to dashboard
  if (authPaths.some((path) => pathname.startsWith(path)) && adminAccessToken) {
    return NextResponse.redirect(new URL(pathAdminRoutes.dashboard, request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Admin routes
    "/admin/:path*",
    // Auth routes
    "/auth/:path*",
    // Protected client routes
    "/profile/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/checkout/:path*",
    // Payment routes
    "/payment/:path*",
  ],
};
