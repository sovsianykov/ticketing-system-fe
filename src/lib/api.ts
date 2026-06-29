import axios from "axios";

import { useAuthStore } from "../../store/auth.store";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        if (
            error.response?.status === 401 &&
            original &&
            !original._retry &&
            !original.url?.includes("/auth/")
        ) {
            original._retry = true;

            try {
                const res = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.message ?? "Refresh failed");
                }

                const accessToken = data.accessToken as string;
                useAuthStore.getState().setAccessToken(accessToken);

                if (data.user) {
                    useAuthStore
                        .getState()
                        .setSession(accessToken, data.user);
                }

                original.headers.Authorization = `Bearer ${accessToken}`;
                return api(original);
            } catch {
                useAuthStore.getState().logout();
                if (typeof window !== "undefined") {
                    window.location.href = "/welcome";
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);
