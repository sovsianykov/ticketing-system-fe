"use client";

import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import {useAuthStore} from "../../../store/auth.store";

type FormData = {
    email: string;
    password: string;
};

export default function LoginForm() {
    const { register, handleSubmit } = useForm<FormData>();
    const setToken = useAuthStore((s) => s.setAccessToken);

    const onSubmit = async (data: FormData) => {
        const res = await api.post("/auth/login", data);

        setToken(res.data.accessToken);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input placeholder="email" {...register("email")} />
            <input placeholder="password" type="password" {...register("password")} />

            <button type="submit">Login</button>
        </form>
    );
}