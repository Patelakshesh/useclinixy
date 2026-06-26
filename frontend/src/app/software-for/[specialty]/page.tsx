import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

interface Props {
  params: Promise<{ specialty: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const specialtyParam = resolvedParams.specialty;
  
  // Format the specialty name: 'dentists' -> 'Dentists'
  const specialtyName = specialtyParam.charAt(0).toUpperCase() + specialtyParam.slice(1);
  
  return {
    title: `Best Clinic Management Software for ${specialtyName} | Clinixy`,
    description: `Automate your ${specialtyParam} practice with Clinixy. The ultimate management software tailored for ${specialtyParam}. Start your 14-day free trial.`,
    alternates: {
      canonical: `https://useclinixy.online/software-for/${specialtyParam}`,
    }
  };
}

export default async function SpecialtyPage({ params }: Props) {
  const resolvedParams = await params;
  const specialtyParam = resolvedParams.specialty;
  const specialtyName = specialtyParam.charAt(0).toUpperCase() + specialtyParam.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-neutral-100 overflow-x-hidden">
      <Navbar />
      
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6">
              Made for {specialtyName}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
              The smart way to run your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{specialtyParam}</span> practice.
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Clinixy gives {specialtyParam} everything they need to manage patients, schedule appointments, and grow their clinic without the administrative headache.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register-clinic"
                className="inline-flex px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-colors items-center justify-center gap-2"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/pricing"
                className="inline-flex px-8 py-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 font-bold text-lg transition-colors items-center justify-center"
              >
                View Pricing
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white dark:bg-[#111] p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-neutral-800">
              <h3 className="text-2xl font-bold mb-6">Why {specialtyName} choose Clinixy</h3>
              <ul className="space-y-4">
                {[
                  'Automated appointment reminders to reduce no-shows',
                  'Secure digital patient records and history',
                  'Beautiful public booking portal for new patients',
                  'Staff and multi-doctor schedule management',
                  'Detailed analytics and revenue reporting'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
