'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, CreditCard, ShieldAlert, LogOut, Tag } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, logoutUser } from '@/features/auth/api/auth';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Clinics', href: '/admin/clinics', icon: Building2 },
    { name: 'Plans', href: '/admin/plans', icon: Tag },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Audit Logs', href: '/admin/audit', icon: ShieldAlert },
  ];

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      queryClient.removeQueries({ queryKey: ['currentUser'] });
    } catch (error) {
      console.error('Logout API failed, forcing client redirect', error);
      queryClient.removeQueries({ queryKey: ['currentUser'] });
    } finally {
      router.push('/login');
    }
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'SUPER_ADMIN') {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#0A0A0A] flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white tracking-tight">Super Admin</span>
        </div>
        
        <nav className="flex-1 min-h-0 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-slate-800 text-white' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#111] border-b border-slate-200 dark:border-neutral-800 flex items-center px-6 justify-between shrink-0">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Global Administration</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              SA
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
