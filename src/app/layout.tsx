import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "viralNest - Discover & Save Viral Content",
  description: "Discover, save, and reuse viral content from across the internet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50`}
      >
        <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold tracking-tight">viral<span className="text-blue-600">Nest</span></Link>
            <nav className="flex space-x-4 text-sm font-medium">
              <Link href="/feed" className="hover:text-blue-600">Trending</Link>
              <Link href="/feed/fitness" className="hover:text-blue-600">Fitness</Link>
              <Link href="/feed/startup" className="hover:text-blue-600">Startups</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
