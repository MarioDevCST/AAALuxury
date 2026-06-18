import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminQuickAccess } from "@/components/AdminQuickAccess";
import { LanguageProvider } from "@/components/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AAA Luxury & Sport Rental Car",
  description: "AAA Luxury & Sport Rental Car",
  icons: {
    icon: "/branding/favicon/favicon.png",
    shortcut: "/branding/favicon/favicon.png",
    apple: "/branding/favicon/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
          <AdminQuickAccess />
        </LanguageProvider>
      </body>
    </html>
  );
}
