import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0A] p-4">
      <LoginForm />
    </div>
  );
}
