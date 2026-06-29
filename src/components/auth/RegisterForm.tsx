"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "../../../store/auth.store";

const registerSchema = z
    .object({
        email: z.string().email("Please enter a valid email"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

type RegisterFormProps = {
    onSuccess?: () => void;
    className?: string;
};

export function RegisterForm({ onSuccess, className }: RegisterFormProps) {
    const setSession = useAuthStore((s) => s.setSession);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        setError(null);

        try {
            const session = await registerUser({
                email: values.email,
                password: values.password,
            });
            setSession(session.accessToken, session.user);
            onSuccess?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create account"
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
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="register-email"
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
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
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

            <div className="space-y-2">
                <Label htmlFor="register-confirm-password">
                    Confirm Password
                </Label>
                <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="pr-9 pl-8"
                        aria-invalid={Boolean(errors.confirmPassword)}
                        {...register("confirmPassword")}
                    />
                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword((value) => !value)
                        }
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={
                            showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                        }
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                <UserPlus />
                {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
        </form>
    );
}
