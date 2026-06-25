'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Activity } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: "Starter Clinic",
      price: "$49",
      description: "Perfect for solo practitioners starting their digital journey.",
      features: [
        "1 Doctor Account",
        "Unlimited Patient Records",
        "Online Booking Link",
        "Basic Calendar Management",
        "Email Reminders"
      ],
      missing: [
        "Custom Subdomain",
        "SMS Reminders",
        "Multi-Staff Management",
        "Advanced Analytics"
      ],
      recommended: false
    },
    {
      name: "Professional",
      price: "$99",
      description: "The complete operating system for growing medical practices.",
      features: [
        "Up to 5 Doctor Accounts",
        "Custom Branded Subdomain",
        "SMS & Email Reminders",
        "Multi-Staff Management",
        "Advanced Analytics & Reports",
        "Prescription Builder",
        "Priority 24/7 Support"
      ],
      missing: [],
      recommended: true
    },
    {
      name: "Hospital Network",
      price: "Custom",
      description: "Enterprise-grade infrastructure for large scale networks.",
      features: [
        "Unlimited Doctor Accounts",
        "Multiple Clinic Locations",
        "Custom API Access",
        "Dedicated Account Manager",
        "White-glove Onboarding",
        "Custom Integration",
        "SLA Guarantee"
      ],
      missing: [],
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">Clinixy</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors">
              Log In
            </Link>
            <Link href="/register-clinic" className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold transition-all hover:-translate-y-0.5">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-24 pb-16 text-center max-w-3xl mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
        >
          Simple, transparent pricing
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-500 dark:text-slate-400 font-medium"
        >
          Start with a 14-day free trial. No credit card required. Cancel anytime.
        </motion.p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-32">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className={`relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border ${
                plan.recommended 
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/20 scale-100 md:scale-105 z-10' 
                  : 'border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 h-10">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-slate-500 dark:text-slate-400 font-medium">/month</span>}
              </div>
              
              <Link
                href="/register-clinic"
                className={`w-full py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 mb-8 ${
                  plan.recommended
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/30 hover:-translate-y-0.5'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Start 14-Day Free Trial
              </Link>
              
              <div className="space-y-4">
                <p className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4">What's included</p>
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{feature}</span>
                  </div>
                ))}
                {plan.missing.map(feature => (
                  <div key={feature} className="flex items-center gap-3 opacity-50">
                    <X className="w-5 h-5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 font-medium line-through">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
