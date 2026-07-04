import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { callBackendLogout } from "@/lib/auth-server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/token";

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    // Call backend with refreshToken
    // Backend will revoke token and clear the cookie
    if (refreshToken) {
        await callBackendLogout(refreshToken);
    }

    // Clear the cookie on frontend
    const response = NextResponse.json({ success: true });
    response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return response;
}
