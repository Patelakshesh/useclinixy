'use client';

import Link from 'next/link';
import { Activity, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight transition-colors">Clinixy</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-6">
          <ThemeToggle />
          <Link 
            href="/login" 
            className="text-sm sm:text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors"
          >
            Log In
          </Link>
          <Link 
            href="/register-clinic" 
            className="px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold transition-all hover:shadow-xl hover:shadow-slate-900/20 dark:hover:shadow-white/20 hover:-translate-y-0.5 flex items-center gap-1 sm:gap-2 text-xs sm:text-base whitespace-nowrap"
          >
            Start Free <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
