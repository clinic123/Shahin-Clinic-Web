import type { Session } from "@/lib/auth";
import { betterFetch } from "@better-fetch/fetch";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/auth", "/forgot-password", "/reset-password", "/login"];
const protectedRoutes = [
  "/dashboard",
  "/checkout",
  "/profile",
  "/admin",
  "/doctor",
];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get the session
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  // If user is not authenticated and trying to access protected route
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  // If user is authenticated and trying to access auth page
  if (session && isPublicRoute) {
    // Redirect to dashboard or role-based default
    const roleRedirects: Record<string, string> = {
      admin: "/admin/",
      doctor: "/doctor/",
      user: "/dashboard",
    };

    const role = session?.user?.role;
    const redirectUrl = (role && roleRedirects[role]) || "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
