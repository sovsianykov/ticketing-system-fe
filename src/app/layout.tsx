import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import Providers from "./providers";
import { UserAvatar } from "@/components/UserAvatar/UserAvatar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ticketing System",
  description: "Jira-like ticketing application",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563EB",
};


export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className={geistSans.variable}>
      <body className={geistSans.className}>
      <Providers>
        <header className="h-12 bg-background border-b flex items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
            <Image src="/projectavatar.png" alt="Logo" width={28} height={28} />
            Ticketing System Light
          </Link>
          <UserAvatar />
        </header>
        {children}
      </Providers>
      </body>
      </html>
  );
}
