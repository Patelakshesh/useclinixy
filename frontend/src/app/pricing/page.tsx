import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Zap } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Pricing - Clinixy | Affordable Clinic Management Software',
  description: 'Simple, transparent pricing for clinics of all sizes. Start your 14-day free trial today. Manage appointments, patients, and billing with Clinixy.',
  alternates: {
    canonical: 'https://useclinixy.online/pricing',
  }
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans text-slate-900 dark:text-neutral-100 selection:bg-blue-500/30">
      <Navbar />
      
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">pricing</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
            Start with a 14-day free trial. No credit card required. Upgrade when you're ready to scale your practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="relative flex flex-col bg-slate-50 dark:bg-neutral-900/50 rounded-3xl p-8 border border-slate-200 dark:border-neutral-800">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Perfect for solo practitioners</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black">₹999</span>
              <span className="text-slate-500 dark:text-slate-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Up to 2 Doctors</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Up to 2,000 Patients</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Public Booking Portal</span>
              </li>
            </ul>
            <Link href="/register-clinic" className="w-full py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-center rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
              Start Free Trial
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative flex flex-col bg-white dark:bg-black rounded-3xl p-8 border-2 border-blue-600 shadow-2xl shadow-blue-900/20 transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 text-sm font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
              <Zap className="w-4 h-4" /> Most Popular
            </div>
            <div className="mb-6 mt-2">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">For growing polyclinics</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black">₹1,999</span>
              <span className="text-slate-500 dark:text-slate-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Up to 5 Doctors</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Unlimited Patients</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Public Booking Portal</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Priority Support</span>
              </li>
            </ul>
            <Link href="/register-clinic" className="w-full py-3 px-4 bg-blue-600 text-white font-bold text-center rounded-xl hover:bg-blue-700 transition-colors">
              Start Free Trial
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="relative flex flex-col bg-slate-50 dark:bg-neutral-900/50 rounded-3xl p-8 border border-slate-200 dark:border-neutral-800">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">For large hospitals & chains</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black">₹4,999</span>
              <span className="text-slate-500 dark:text-slate-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Unlimited Doctors</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Unlimited Patients</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Public Booking Portal</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Dedicated Account Manager</span>
              </li>
            </ul>
            <Link href="/register-clinic" className="w-full py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-center rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
