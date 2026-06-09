import { pathAdminRoutes } from "@/config/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách route cần đăng nhập (Admin)
const protectedAdminPaths = [
  pathAdminRoutes.accountEmployee,
  pathAdminRoutes.accountGuest,
  pathAdminRoutes.category,
  pathAdminRoutes.dashboard,
  pathAdminRoutes.discount,
  pathAdminRoutes.employee,
  pathAdminRoutes.guest,
  pathAdminRoutes.permission,
  pathAdminRoutes.products,
  pathAdminRoutes.role,
];

// Danh sách route cần đăng nhập (Client)
const protectedClientPaths = ["/profile", "/orders", "/wishlist", "/checkout"];

const authPaths = [pathAdminRoutes.login];

export function proxy(request: NextRequest) {
  const clientAccessToken = request.cookies.get("client_access_token")?.value;
  const adminAccessToken = request.cookies.get("admin_access_token")?.value;
  const adminSessionId = request.cookies.get("admin_sessionId")?.value;

  // Fix VNPay return URL format - thay & đầu tiên thành ?
  if (
    request.nextUrl.pathname === "/payment/vnpay-return" &&
    request.nextUrl.search.startsWith("&")
  ) {
    const fixedSearch = "?" + request.nextUrl.search.substring(1);
    const fixedUrl = new URL(
      request.nextUrl.pathname + fixedSearch,
      request.url,
    );
    return NextResponse.redirect(fixedUrl);
  }

  console.log(adminSessionId);

  // Admin routes protection - check admin_access_token
  if (
    protectedAdminPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    ) &&
    !adminAccessToken &&
    !adminSessionId
  ) {
    return NextResponse.redirect(new URL(pathAdminRoutes.login, request.url));
  }

  // Client routes protection - check client_access_token
  if (
    protectedClientPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    ) &&
    !clientAccessToken
  ) {
    const redirectUrl = new URL("/home", request.url);
    redirectUrl.searchParams.set("login", "required");
    return NextResponse.redirect(redirectUrl);
  }

  // Nếu admin đã đăng nhập mà truy cập /auth/login → chuyển sang dashboard
  if (
    authPaths.some((path) => request.nextUrl.pathname.startsWith(path)) &&
    adminAccessToken
  ) {
    return NextResponse.redirect(
      new URL(pathAdminRoutes.dashboard, request.url),
    );
  }

  return NextResponse.next();
}
