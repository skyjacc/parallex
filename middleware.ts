import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/account", "/support", "/referral"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if route requires auth
    const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!isProtected) {
        return NextResponse.next();
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
        console.error("[middleware] NEXTAUTH_SECRET is not set");
        return NextResponse.redirect(new URL("/auth/error?error=ConfigurationError", request.url));
    }
    const token = await getToken({
        req: request,
        secret,
    });

    // Not authenticated → redirect to sign in
    if (!token) {
        const signInUrl = new URL("/auth/signin", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Admin route → check role
    if (pathname.startsWith("/admin")) {
        const isAdmin = token.role === "ADMIN";
        const isSupport = token.role === "SUPPORT";
        if (!isAdmin && !isSupport) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        if (isSupport && !pathname.startsWith("/admin/support")) {
            return NextResponse.redirect(new URL("/admin/support", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*", "/account/:path*", "/support/:path*", "/referral/:path*"],
};
