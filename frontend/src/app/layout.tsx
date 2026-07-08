import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import WakeUpBackend from '@/components/WakeUpBackend';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://useclinixy.online'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  title: {
    template: '%s | Clinixy',
    default: 'Clinixy - The Modern Medical Clinic Management Platform',
  },
  description: 'Clinixy is the ultimate SaaS platform for doctors. Automate appointment scheduling, patient management, and clinic billing in one secure place.',
  keywords: [
    // High-intent transactional keywords
    'clinic management software India',
    'best clinic management software',
    'clinic management system',
    'cloud based clinic management software',
    'affordable clinic management software India',
    'clinic management software for doctors',
    'OPD management software',
    'clinic management software for small clinics',
    // Appointment & booking keywords
    'doctor appointment booking system',
    'online doctor appointment booking',
    'patient appointment scheduling software',
    'doctor scheduling software',
    'online booking system for doctors',
    'clinic appointment management system',
    'doctor appointment app India',
    // EMR & patient record keywords
    'EMR software India',
    'electronic medical records software',
    'EHR software for clinics',
    'digital patient records management',
    'patient management system',
    'patient management software India',
    'ABDM compliant EMR software',
    'cloud EMR for hospitals',
    'best EMR software for small clinics',
    // Billing keywords
    'clinic billing software',
    'medical billing software India',
    'hospital billing management system',
    // Specialty-specific keywords
    'clinic management software for dentists',
    'clinic software for pediatricians',
    'clinic management software for dermatologists',
    'clinic software for physiotherapists',
    'multi specialty clinic management software',
    'polyclinic management software',
    // Feature-specific keywords
    'patient reminder system',
    'digital prescription software',
    'prescription management software India',
    'patient queue management system',
    'clinic staff management software',
    'medical practice management software',
    // Pain-point & informational keywords
    'how to manage clinic patients digitally',
    'how to reduce patient no shows',
    'paperless clinic management',
    'digitize clinic records India',
    // Alternative & comparison keywords
    'Practo alternative for clinics',
    'best alternative to Practo',
    'SaaS clinic software India',
    'healthcare SaaS India',
    // Brand
    'Clinixy',
    'Clinixy clinic software',
  ],
  authors: [{ name: 'Clinixy' }],
  creator: 'Clinixy',
  publisher: 'Clinixy',
  openGraph: {
    title: 'Clinixy - Advanced Medical Clinic Management',
    description: 'Automate your medical clinic with Clinixy. Effortless online patient booking, smart doctor scheduling, and complete practice management.',
    url: 'https://useclinixy.online',
    siteName: 'Clinixy',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: '/opengraph-image.png',
      width: 1200,
      height: 630,
      alt: 'Clinixy - Clinic Management Software for Doctors in India',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clinixy - The Modern Medical Clinic Platform',
    description: 'Transform your medical practice with smart patient scheduling and clinic management.',
    images: ['/opengraph-image.png'],
  },
  verification: {
    google: 'iIpLhUNQ7yLht9bmYQ0iRpsmoRmzVARnJIzA9UDNM1I',
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
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
          <WakeUpBackend />
        </ThemeProvider>
      </body>
    </html>
  );
}
