"use client";

import { LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

export function WelcomeAuthPanel() {
    const router = useRouter();

    const handleLoginSuccess = () => {
        router.push("/dashboard");
        router.refresh();
    };

    const handleRegisterSuccess = () => {
        router.push("/check-email");
        router.refresh();
    };

    return (
        <Tabs defaultValue="register" className="w-full">
            <TabsList>
                <TabsTrigger value="register">
                    <UserPlus />
                    Sign Up
                </TabsTrigger>
                <TabsTrigger value="login">
                    <LogIn />
                    Sign In
                </TabsTrigger>
            </TabsList>

            <TabsContent value="register">
                <RegisterForm onSuccess={handleRegisterSuccess} />
            </TabsContent>

            <TabsContent value="login">
                <LoginForm onSuccess={handleLoginSuccess} />
            </TabsContent>
        </Tabs>
    );
}
