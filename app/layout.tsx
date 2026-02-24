import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "筋トレログ",
  description: "シンプルで使いやすい、オフライン対応の筋トレ記録アプリ。",
  applicationName: "筋トレログ",
  manifest: "/manifest.json",
  themeColor: "#0b1120",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "筋トレログ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
            <h1 className="text-base font-semibold tracking-tight">
              筋トレログ
            </h1>
          </header>
          <main className="flex-1 px-4 pb-24 pt-3">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
