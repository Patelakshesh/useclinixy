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
  title: 'Clinixy - The Modern Medical Clinic Management Platform',
  description: 'Clinixy is the ultimate SaaS platform for doctors and medical clinics. Automate appointment scheduling, patient management, staff coordination, and billing all in one place.',
  keywords: 'doctor appointment software, clinic management system, medical practice software, online booking for doctors, healthcare SaaS, Clinixy, patient scheduling, medical CRM',
  authors: [{ name: 'Clinixy' }],
  creator: 'Clinixy',
  publisher: 'Clinixy',
  openGraph: {
    title: 'Clinixy - Advanced Medical Clinic Management',
    description: 'Automate your medical clinic with Clinixy. Effortless online patient booking, smart doctor scheduling, and complete practice management.',
    url: 'https://useclinixy.vercel.app',
    siteName: 'Clinixy',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clinixy - The Modern Medical Clinic Platform',
    description: 'Transform your medical practice with smart patient scheduling and clinic management.',
  },
  verification: {
    google: '7IUFSXsW-JniYCpIOg4zlNdtlMyafi7arRBJiw8G2-4',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
