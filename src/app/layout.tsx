import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/providers/AuthProvider";
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
  title: "Halifax Bank",
  description: "Halifax Bank",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="flex-grow flex flex-col">
          <AuthProvider>{children}</AuthProvider>
        </main>
        <footer className="bg-gray-900/80 backdrop-blur-sm text-white text-center p-4">
          <p>&copy; 2025 Halifax Bank. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
