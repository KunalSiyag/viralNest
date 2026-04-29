import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "viralNest — Discover & Save Viral Content",
    template: "%s | viralNest",
  },
  description: "Discover, save, and reuse viral content from Instagram, Pinterest, YouTube, TikTok and more. The ultimate content discovery engine.",
  keywords: ["viral content", "instagram reels", "pinterest videos", "content discovery", "download reels", "trending content"],
  openGraph: {
    type: "website",
    siteName: "viralNest",
    title: "viralNest — Discover & Save Viral Content",
    description: "Discover, save, and reuse viral content from across the internet.",
  },
  twitter: {
    card: "summary_large_image",
    title: "viralNest — Discover & Save Viral Content",
    description: "Discover, save, and reuse viral content from across the internet.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
