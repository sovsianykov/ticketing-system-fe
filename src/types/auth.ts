export type User = {
    id: string;
    email: string;
    name: string | null;
    isEmailVerified: boolean;
    verifiedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type AuthResponse = {
    accessToken: string;
    user: User;
};

export type BackendAuthResponse = {
    access_token: string;
    refresh_token?: string;
    user: User;
};

export type BackendRefreshResponse = {
    access_token: string;
    refresh_token?: string;
    user?: User;
};
