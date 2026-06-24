'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Stethoscope, Calendar, Settings, LogOut, BarChart2, CreditCard } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';
import { logoutUser, getCurrentUser } from '@/features/auth/api/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: Home, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { name: 'Doctors', href: '/dashboard/doctors', icon: Stethoscope, roles: ['CLINIC_ADMIN', 'RECEPTIONIST'] },
  { name: 'Patients', href: '/dashboard/patients', icon: Users, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { name: 'Staff', href: '/dashboard/staff', icon: Users, roles: ['CLINIC_ADMIN'] },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart2, roles: ['CLINIC_ADMIN'] },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard, roles: ['CLINIC_ADMIN'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      await logoutUser();
      queryClient.removeQueries({ queryKey: ['currentUser'] });
    } catch (error) {
      console.error('Logout API failed, forcing client redirect', error);
      queryClient.removeQueries({ queryKey: ['currentUser'] });
    } finally {
      router.push('/login');
    }
  };

  return (
    <aside className={`fixed left-0 inset-y-0 z-40 w-64 border-r border-slate-200/60 bg-[#FAFAFA] dark:border-neutral-800/60 dark:bg-[#050505] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 flex flex-col print:hidden`}>
      <div className="flex items-center gap-3 px-6 py-6 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 text-white dark:text-black font-bold shadow-sm text-xs">
          C
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Clinixy</span>
      </div>

      <div className="flex-1 min-h-0 px-3 overflow-y-auto custom-scrollbar pb-4">
         <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-500 mb-2">Menu</p>
         <nav className="space-y-0.5">
           <LayoutGroup>
             {navItems.filter(item => !user?.role || item.roles.includes(user.role)).map((item) => {
               const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}`));
               return (
                 <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="relative block group">
                   {isActive && (
                     <motion.div
                       layoutId="sidebar-active"
                       className="absolute inset-0 rounded-md bg-white dark:bg-[#1A1A1A] shadow-sm border border-slate-200/50 dark:border-neutral-800/50"
                       transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                     >
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-slate-900 dark:bg-white" />
                     </motion.div>
                   )}
                   <div
                     className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                       isActive
                         ? 'text-slate-900 dark:text-white'
                         : 'text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5'
                     }`}
                   >
                     <item.icon className={`h-4 w-4 transition-colors duration-200 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-neutral-300'}`} />
                     {item.name}
                   </div>
                 </Link>
               );
             })}
           </LayoutGroup>
         </nav>
      </div>

      <div className="p-4 border-t border-slate-200/60 dark:border-neutral-800/60">
        <div className="flex items-center gap-3 mb-4 px-2">
           <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-neutral-300">
             {user?.name?.charAt(0) || 'A'}
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'Admin User'}</p>
             <p className="text-xs text-slate-500 dark:text-neutral-500 truncate">{user?.email || 'admin@clinic.com'}</p>
           </div>
        </div>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-neutral-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
