'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthSyncPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 1. Save the token to this specific subdomain's local storage
      localStorage.setItem('token', token);
      
      // 2. Clear the URL history so the token isn't sitting in the browser address bar
      window.history.replaceState({}, document.title, '/dashboard');
      
      // 3. Navigate into the dashboard safely
      router.push('/dashboard');
    } else {
      // If no token is provided, send them to login
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0A0A0A]">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Securely entering workspace...</h1>
      <p className="text-slate-500 text-sm mt-2">Please wait while we log you into your clinic.</p>
    </div>
  );
}
