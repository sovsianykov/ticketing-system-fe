"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "register_attempts";
const MAX_SAVED = 5;

type SavedAttempt = { name: string; email: string };

function loadAttempts(): SavedAttempt[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
        return [];
    }
}

function saveAttempt(attempt: SavedAttempt) {
    const existing = loadAttempts().filter((a) => a.email !== attempt.email);
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([attempt, ...existing].slice(0, MAX_SAVED))
    );
}

const passwordCriteria = {
    minLength: (v: string) => v.length >= 8,
    uppercase: (v: string) => /[A-Z]/.test(v),
    special: (v: string) => /[^A-Za-z0-9]/.test(v),
};

const registerSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attempts, setAttempts] = useState<SavedAttempt[]>([]);
    const [activeSuggestion, setActiveSuggestion] = useState<"name" | "email" | null>(null);
    const nameRef = useRef<HTMLDivElement>(null);
    const emailRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setAttempts(loadAttempts());
    }, []);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                nameRef.current && !nameRef.current.contains(e.target as Node) &&
                emailRef.current && !emailRef.current.contains(e.target as Node)
            ) {
                setActiveSuggestion(null);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const passwordValue = watch("password", "");
    const criteria = {
        minLength: passwordCriteria.minLength(passwordValue),
        uppercase: passwordCriteria.uppercase(passwordValue),
        special: passwordCriteria.special(passwordValue),
    };
    const allCriteriaMet = criteria.minLength && criteria.uppercase && criteria.special;

    const onSubmit = async (values: RegisterFormValues) => {
        setError(null);

        try {
            await registerUser({
                name: values.name,
                email: values.email,
                password: values.password,
            });
            sessionStorage.setItem(
                "pending_login",
                JSON.stringify({ email: values.email, password: values.password })
            );
            saveAttempt({ name: values.name, email: values.email });
            setAttempts(loadAttempts());
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
                <Label htmlFor="register-name">Name</Label>
                <div className="relative" ref={nameRef}>
                    <User className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="register-name"
                        type="text"
                        autoComplete="off"
                        placeholder="John Doe"
                        className="pl-8"
                        aria-invalid={Boolean(errors.name)}
                        {...register("name")}
                        onFocus={() => attempts.length > 0 && setActiveSuggestion("name")}
                    />
                    {activeSuggestion === "name" && attempts.length > 0 && (
                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md top-full">
                            {attempts.map((a) => (
                                <li key={a.email}>
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setValue("name", a.name, { shouldValidate: true });
                                            setValue("email", a.email, { shouldValidate: true });
                                            setActiveSuggestion(null);
                                        }}
                                    >
                                        <User className="size-3.5 shrink-0 text-muted-foreground" />
                                        <span className="truncate">{a.name}</span>
                                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">{a.email}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {errors.name && (
                    <p className="text-sm text-destructive">
                        {errors.name.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative" ref={emailRef}>
                    <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="register-email"
                        type="email"
                        autoComplete="off"
                        placeholder="you@company.com"
                        className="pl-8"
                        aria-invalid={Boolean(errors.email)}
                        {...register("email")}
                        onFocus={() => attempts.length > 0 && setActiveSuggestion("email")}
                    />
                    {activeSuggestion === "email" && attempts.length > 0 && (
                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md top-full">
                            {attempts.map((a) => (
                                <li key={a.email}>
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setValue("name", a.name, { shouldValidate: true });
                                            setValue("email", a.email, { shouldValidate: true });
                                            setActiveSuggestion(null);
                                        }}
                                    >
                                        <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                                        <span className="truncate">{a.email}</span>
                                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">{a.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
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

                <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Password criteria
                    </p>
                    {[
                        { met: criteria.minLength, label: "Minimum 8 characters" },
                        { met: criteria.uppercase, label: "At least one uppercase (capital) letter" },
                        { met: criteria.special, label: "At least one special character" },
                    ].map(({ met, label }) => (
                        <div key={label} className="flex items-center gap-2">
                            <span
                                className={cn(
                                    "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                                    met
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-input bg-background"
                                )}
                                aria-hidden="true"
                            >
                                {met && <Check className="size-2.5" strokeWidth={3} />}
                            </span>
                            <span className={cn("text-xs", met ? "text-foreground" : "text-muted-foreground")}>
                                {label}
                            </span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 pt-0.5 border-t border-border mt-1">
                        <span
                            className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                                allCriteriaMet
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input bg-background"
                            )}
                            aria-label={allCriteriaMet ? "All criteria met" : "Criteria not yet met"}
                        >
                            {allCriteriaMet && <Check className="size-2.5" strokeWidth={3} />}
                        </span>
                        <span className={cn("text-xs font-medium", allCriteriaMet ? "text-foreground" : "text-muted-foreground")}>
                            All criteria met
                        </span>
                    </div>
                </div>
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
