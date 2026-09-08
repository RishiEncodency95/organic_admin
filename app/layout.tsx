import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moksha Sewa Admin",
  description: "Admin dashboard for Moksha Sewa — bookings, donations, and content management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${geistSans.className} min-h-full flex flex-col`} suppressHydrationWarning>
        <LanguageProvider><StoreProvider>{children}</StoreProvider></LanguageProvider>
      </body>
    </html>
  );
}
