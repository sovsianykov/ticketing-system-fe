import type {
    BackendAuthResponse,
    BackendRefreshResponse,
    BackendRegisterResponse,
} from "@/types/auth";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export function mapAuthResponse(data: BackendAuthResponse) {
    return {
        accessToken: data.access_token,
        user: data.user,
    };
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

export async function callBackendRegister(
    body: { email: string; password: string; name?: string }
) {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
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
                "Registration failed",
        };
    }

    return {
        ok: true as const,
        data: data as BackendRegisterResponse,
    };
}

export async function callBackendRefresh(refreshToken: string) {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
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
        setCookie: res.headers.get("set-cookie"),
    };
}

export async function callBackendLogout(refreshToken: string) {
    await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
}
