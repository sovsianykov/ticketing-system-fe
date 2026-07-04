"use client";

import { useEffect } from "react";

import { useAuthStore } from "../../../store/auth.store";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const setSession = useAuthStore((s) => s.setSession);
    const logout = useAuthStore((s) => s.logout);

    useEffect(() => {
        // Only try to refresh if we have no accessToken
        // This is disabled for now due to server-side cookie issues
        // Refresh will be handled by axios interceptor when needed
        if (accessToken) {
            return;
        }

        // TODO: Re-enable when server-side cookie forwarding is fixed
        // fetch("/api/auth/refresh", {
        //     method: "POST",
        //     credentials: "include",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // })
        //     .then(async (res) => {
        //         const data = await res.json();

        //         if (!res.ok) {
        //             throw new Error(data?.message ?? "Refresh failed");
        //         }

        //         setSession(data.accessToken, data.user ?? null);
        //     })
        //     .catch(() => {
        //         logout();
        //     });
    }, [accessToken, logout, setSession]);

    return children;
}
