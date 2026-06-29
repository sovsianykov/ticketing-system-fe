import { create } from "zustand";

import type { User } from "@/types/auth";

type AuthState = {
    accessToken: string | null;
    user: User | null;
    setSession: (accessToken: string, user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,

    setSession: (accessToken, user) => set({ accessToken, user }),

    setAccessToken: (token) => set({ accessToken: token }),

    logout: () => set({ accessToken: null, user: null }),
}));
