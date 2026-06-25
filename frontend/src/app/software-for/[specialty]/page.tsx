import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Star, Users, Activity, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';

// Define the specialties we want to rank for on Google
const specialties = {
  'dentists': {
    title: 'Dentists',
    hero: 'Dental Practice Management Software',
    description: 'Automate your dental clinic. Manage patient records, schedule appointments, and grow your practice with Clinixy.',
    benefits: ['Dental Charting Integration', 'Family Appointment Booking', 'Automated Recall Reminders'],
    icon: '🦷'
  },
  'pediatricians': {
    title: 'Pediatricians',
    hero: 'Pediatric Clinic Management Platform',
    description: 'The smart way to manage your pediatric clinic. Easy scheduling for parents and comprehensive health tracking for children.',
    benefits: ['Growth Chart Tracking', 'Parent/Guardian Portals', 'Vaccination Reminders'],
    icon: '👶'
  },
  'chiropractors': {
    title: 'Chiropractors',
    hero: 'Chiropractic Practice Software',
    description: 'Streamline your chiropractic practice. Faster patient check-ins, automated billing, and smart scheduling.',
    benefits: ['Recurring Appointment Setup', 'Treatment Plan Tracking', 'Easy Check-in Kiosk'],
    icon: '🦴'
  },
  'physiotherapists': {
    title: 'Physiotherapists',
    hero: 'Physiotherapy Clinic Management',
    description: 'Empower your physiotherapy clinic with intelligent scheduling, exercise plan sharing, and seamless billing.',
    benefits: ['Exercise Plan Attachments', 'Progress Tracking Notes', 'Insurance Direct Billing'],
    icon: '🏃'
  }
};

type Props = {
  params: Promise<{ specialty: string }>;
};

// Next.js Dynamic Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const specialtyData = specialties[resolvedParams.specialty as keyof typeof specialties];
  
  if (!specialtyData) return { title: 'Not Found' };

  return {
    title: `Best Clinic Software for ${specialtyData.title} | Clinixy`,
    description: specialtyData.description,
    alternates: {
      canonical: `https://useclinixy.online/software-for/${resolvedParams.specialty}`,
    }
  };
}

// Pre-render these pages at build time for instant loading (Max SEO)
export function generateStaticParams() {
  return Object.keys(specialties).map((specialty) => ({
    specialty: specialty,
  }));
}

export default async function SpecialtyPage({ params }: Props) {
  const resolvedParams = await params;
  const data = specialties[resolvedParams.specialty as keyof typeof specialties];

  if (!data) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Best Clinic Software for ${data.title}`,
    "description": data.description,
    "publisher": {
      "@type": "Organization",
      "name": "Clinixy"
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Simple Header */}
      <nav className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-20 flex items-center px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">Clinixy</span>
        </Link>
        <div className="ml-auto">
          <Link href="/register-clinic" className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:shadow-lg transition-all">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 text-center max-w-4xl mx-auto">
        <div className="text-6xl mb-6">{data.icon}</div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
          {data.hero}
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-2xl mx-auto">
          {data.description}
        </p>
        <Link 
          href="/register-clinic"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-xl hover:-translate-y-1"
        >
          Try Clinixy for {data.title} <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Specialty Features */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-16">
            Why {data.title} choose Clinixy
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {data.benefits.map((benefit, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{benefit}</h3>
                <p className="text-slate-500 dark:text-slate-400">Custom tailored workflows designed specifically to meet the daily demands of your practice.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
