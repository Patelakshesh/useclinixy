import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import ReactQueryProvider from '@/providers/ReactQueryProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'ClinicSaaS - Advanced Clinic Management',
  description: 'A comprehensive doctor appointment and clinic management platform.',
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
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#111',
              color: '#fff',
              border: '1px solid #333'
            },
          }} 
        />
      </body>
    </html>
  );
}
