import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "CYBERPREDICT X — Predictive Cybercrime Intelligence & Early Warning Platform",
  description: "AI-Powered Cybercrime Predictive Intelligence & Early-Warning Platform for SIH",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#090909] text-[#F5F2EA]`}
    >
      <body className="min-h-full flex flex-col bg-[#090909] text-[#F5F2EA]">{children}</body>
    </html>
  );
}

