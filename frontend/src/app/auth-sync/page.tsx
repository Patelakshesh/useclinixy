'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function AuthSyncContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, '/dashboard');
      router.push('/dashboard');
    } else {
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

export default function AuthSyncPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0A]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    }>
      <AuthSyncContent />
    </Suspense>
  );
}
