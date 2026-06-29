import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "@/lib/token";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PAGES = ["/welcome", "/login", "/register"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasRefreshToken = Boolean(
        request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
    );

    const isProtected = PROTECTED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    const isAuthPage = AUTH_PAGES.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (isProtected && !hasRefreshToken) {
        const url = request.nextUrl.clone();
        url.pathname = "/welcome";
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
    }

    if (isAuthPage && hasRefreshToken) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/welcome", "/login", "/register"],
};
