import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from '@/components/providers/QueryProvider'
import '../styles/globals.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'ConnectED',
    template: 'ConnectED — %s',
  },
  description:
    'ConnectED — the all-in-one school social platform. Chat with classmates, share notes, find study buddies, and stay on top of school life.',
  openGraph: {
    siteName: 'ConnectED',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <QueryProvider>{children}</QueryProvider>
        </body>
    </html>
  );
}
