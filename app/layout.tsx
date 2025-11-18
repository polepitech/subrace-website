import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getMessages } from 'next-intl/server';
import { defaultLocale } from '../i18n';
import LocaleProvider from './components/LocaleProvider';
import { GoogleAnalytics } from '@next/third-parties/google'

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
  title: "SubRace - Leaderboard",
  description: "SubRace leaderboard and statistics",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Charge les messages pour la locale par défaut
  const messages = await getMessages({ locale: defaultLocale });

  return (
    <html lang={defaultLocale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocaleProvider initialMessages={messages} initialLocale={defaultLocale}>
            <GoogleAnalytics gaId="GTM-P6C3DZVT" />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
