"use client";

import { useEffect } from "react";

import { useAuthStore } from "../../../store/auth.store";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const setSession = useAuthStore((s) => s.setSession);
    const logout = useAuthStore((s) => s.logout);

    useEffect(() => {
        if (accessToken) {
            return;
        }

        fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
        })
            .then(async (res) => {
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.message ?? "Refresh failed");
                }

                setSession(data.accessToken, data.user ?? null);
            })
            .catch(() => {
                logout();
            });
    }, [accessToken, logout, setSession]);

    return children;
}
