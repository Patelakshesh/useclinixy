import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Login - Clinixy',
  description: 'Log in to your Clinixy account to manage your clinic, appointments, and patients.',
  alternates: {
    canonical: 'https://useclinixy.online/login',
  }
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0A] p-4">
      <LoginForm />
    </div>
  );
}
