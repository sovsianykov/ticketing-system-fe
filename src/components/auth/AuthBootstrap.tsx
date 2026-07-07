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

                let user = data.user ?? null;
                console.log("[AuthBootstrap] refresh data:", { hasUser: !!user, hasToken: !!data.accessToken });

                if (!user && data.accessToken) {
                    try {
                        const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
                        console.log("[AuthBootstrap] JWT payload:", payload);
                        const id = payload.sub ?? "";
                        const email = payload.email ?? "";
                        const name: string | null = payload.name ?? null;

                        if (name) {
                            user = { id, email, name, isEmailVerified: true };
                        } else {
                            // JWT has no name — fetch from /users list
                            const usersRes = await fetch(
                                (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1") + "/users",
                                { headers: { Authorization: `Bearer ${data.accessToken}` } }
                            );
                            if (usersRes.ok) {
                                const users: { id: string; email: string; name: string | null; isEmailVerified: boolean }[] = await usersRes.json();
                                user = users.find((u) => u.id === id || u.email === email) ?? { id, email, name: null, isEmailVerified: true };
                            } else {
                                user = { id, email, name: null, isEmailVerified: true };
                            }
                        }
                    } catch {
                        // leave user as null
                    }
                }

                setSession(data.accessToken, user);
            })
            .catch(() => {
                logout();
            });
    }, [accessToken, logout, setSession]);

    return children;
}
