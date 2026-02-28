import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
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
  title: "Antistall — Mutual Action Plans That Keep Deals Moving",
  description: "Shared action plans that move deals from stalled to signed.",
  openGraph: {
    title: "Antistall — Mutual Action Plans That Keep Deals Moving",
    description: "Shared action plans that move deals from stalled to signed.",
    url: "https://antistall.com",
    siteName: "Antistall",
    images: [
      {
        url: "https://antistall.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Antistall — Mutual Action Plans That Keep Deals Moving",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider>{children}</ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
