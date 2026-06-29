import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import type { BackendAuthResponse, BackendRefreshResponse } from "@/types/auth";
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_MAX_AGE } from "@/lib/token";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export function mapAuthResponse(data: BackendAuthResponse) {
    return {
        accessToken: data.access_token,
        user: data.user,
    };
}

export function setRefreshTokenCookie(
    response: NextResponse,
    refreshToken: string
) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
    });
}

export function clearRefreshTokenCookie(response: NextResponse) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
}

export async function getRefreshTokenFromCookies() {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function callBackendAuth(
    path: "/auth/login" | "/auth/register",
    body: Record<string, string>
) {
    const res = await fetch(`${BACKEND_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        return {
            ok: false as const,
            status: res.status,
            message:
                (data as { message?: string | string[] })?.message ??
                "Authentication failed",
        };
    }

    return {
        ok: true as const,
        data: data as BackendAuthResponse,
    };
}

export async function callBackendRefresh(refreshToken: string) {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        return {
            ok: false as const,
            status: res.status,
            message:
                (data as { message?: string })?.message ?? "Refresh failed",
        };
    }

    return {
        ok: true as const,
        data: data as BackendRefreshResponse,
    };
}

export async function callBackendLogout(accessToken: string) {
    await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }).catch(() => undefined);
}
