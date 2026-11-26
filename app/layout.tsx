import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = localFont({
  src: [
    { path: '../public/fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Organic Admin",
  description: "Admin dashboard for Organic Bharat — bookings, donations, and content management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-full flex flex-col`} suppressHydrationWarning>
        <LanguageProvider><StoreProvider>{children}</StoreProvider></LanguageProvider>
      </body>
    </html>
  );
}
