'use client';

import { Bell, Search, Calendar, Users, Stethoscope, Menu, Settings, Home, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/features/auth/api/auth';

interface HeaderProps {
  toggleSidebar?: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const allLinks = [
    { title: 'Overview', href: '/dashboard', icon: Home, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { title: 'View Appointments', href: '/dashboard/appointments', icon: Calendar, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { title: 'Advanced Calendar', href: '/dashboard/calendar', icon: Calendar, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { title: 'Manage Doctors', href: '/dashboard/doctors', icon: Stethoscope, roles: ['CLINIC_ADMIN', 'RECEPTIONIST'] },
    { title: 'Patient Records', href: '/dashboard/patients', icon: Users, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { title: 'Manage Staff', href: '/dashboard/staff', icon: Users, roles: ['CLINIC_ADMIN'] },
    { title: 'Billing & Subscriptions', href: '/dashboard/billing', icon: Settings, roles: ['CLINIC_ADMIN'] },
    { title: 'Account Settings', href: '/dashboard/settings', icon: Settings, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  ];

  const allowedLinks = allLinks.filter(link => !user?.role || link.roles.includes(user.role));
  const searchResults = allowedLinks.filter(link => link.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-neutral-800 dark:bg-black/60 print:hidden">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="sm:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="relative group" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors z-20 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            className="relative h-9 w-[160px] sm:w-64 md:w-80 rounded-md border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-900 transition-all z-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 z-10 pointer-events-none">
             <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">⌘</kbd>
             <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">K</kbd>
          </div>
          
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                className="absolute left-0 top-[calc(100%+8px)] w-full rounded-xl border border-slate-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-[#111111] overflow-hidden"
              >
                <div className="p-2">
                  <p className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-neutral-500">Quick Links</p>
                  {searchResults.length > 0 ? searchResults.map((item) => (
                    <Link key={item.title} href={item.href} onClick={() => setIsSearchOpen(false)}>
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800/80 transition-colors">
                        <item.icon className="h-4 w-4 text-slate-400" />
                        {item.title}
                      </div>
                    </Link>
                  )) : (
                    <div className="px-3 py-4 text-center text-sm text-slate-500 dark:text-neutral-400">
                      No results found for &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-slate-200 dark:border-neutral-800 ring-2 ring-transparent hover:ring-slate-200 dark:hover:ring-neutral-700 transition-all">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Avatar" className="h-full w-full object-cover bg-slate-100 dark:bg-neutral-900" />
        </div>
      </div>
    </header>
  );
};
