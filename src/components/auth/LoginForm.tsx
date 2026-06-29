"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "../../../store/auth.store";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
    onSuccess?: () => void;
    className?: string;
};

export function LoginForm({ onSuccess, className }: LoginFormProps) {
    const setSession = useAuthStore((s) => s.setSession);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setError(null);

        try {
            const session = await login(values);
            setSession(session.accessToken, session.user);
            onSuccess?.();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to sign in"
            );
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn("space-y-4", className)}
        >
            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                >
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="pl-8"
                        aria-invalid={Boolean(errors.email)}
                        {...register("email")}
                    />
                </div>
                {errors.email && (
                    <p className="text-sm text-destructive">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="pr-9 pl-8"
                        aria-invalid={Boolean(errors.password)}
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                    >
                        {showPassword ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-sm text-destructive">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                <LogIn />
                {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
        </form>
    );
}
