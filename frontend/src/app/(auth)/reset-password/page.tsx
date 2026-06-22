import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0A] p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
