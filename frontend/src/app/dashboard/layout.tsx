'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getCurrentUser } from '@/features/auth/api/auth';

// Define allowed routes for each role
const ROLE_ROUTES: Record<string, string[]> = {
  CLINIC_ADMIN: ['/dashboard', '/dashboard/calendar', '/dashboard/appointments', '/dashboard/doctors', '/dashboard/patients', '/dashboard/reports', '/dashboard/billing', '/dashboard/settings', '/dashboard/staff'],
  DOCTOR: ['/dashboard', '/dashboard/calendar', '/dashboard/appointments', '/dashboard/patients', '/dashboard/settings'],
  RECEPTIONIST: ['/dashboard', '/dashboard/calendar', '/dashboard/appointments', '/dashboard/doctors', '/dashboard/patients', '/dashboard/settings'],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
        return;
      }

      // Check if the user is allowed to access the current route
      const allowedRoutes = ROLE_ROUTES[user.role as string] || [];
      const isAllowed = allowedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
      
      if (!isAllowed) {
        // Redirect to dashboard overview if they try to access an unauthorized page
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user || user.role === 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-neutral-100 flex relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 sm:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 w-full min-w-0 sm:pl-64 print:pl-0 flex flex-col min-h-screen">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
