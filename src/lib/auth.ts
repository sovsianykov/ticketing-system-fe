import type { AuthResponse } from "@/types/auth";

type Credentials = {
    email: string;
    password: string;
};

async function parseAuthResponse(res: Response): Promise<AuthResponse> {
    const data = await res.json();

    if (!res.ok) {
        const message =
            typeof data?.message === "string"
                ? data.message
                : Array.isArray(data?.message)
                  ? data.message.join(", ")
                  : "Request failed";

        throw new Error(message);
    }

    return data as AuthResponse;
}

export async function login(credentials: Credentials): Promise<AuthResponse> {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    return parseAuthResponse(res);
}

export async function register(
    credentials: Credentials
): Promise<AuthResponse> {
    const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    return parseAuthResponse(res);
}

export async function refreshAccessToken(): Promise<string> {
    const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message ?? "Refresh failed");
    }

    return data.accessToken as string;
}

export async function logout(accessToken: string | null): Promise<void> {
    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
    }).catch(() => undefined);
}
