import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("accessToken")?.value;
    const { pathname } = request.nextUrl;

    // Public routes that authenticated users shouldn't access
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
    
    // Protected routes
    const isProtectedPage = pathname.startsWith("/dashboard");

    if (token) {
        if (isAuthPage) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    } else {
        if (isProtectedPage) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/register",
        "/dashboard/:path*",
    ],
};