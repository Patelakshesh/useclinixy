'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, LoginFormData } from '../schemas/auth.schema';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loginUser, getCurrentUser } from '../api/auth';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

export const LoginForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('expired') === 'true') {
        setError('Your subscription has expired. Please log in as Clinic Admin to renew.');
      }
    }
    
    if (!isUserLoading && user) {
      if (user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isUserLoading, user, router]);

  if (!isUserLoading && user) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 pt-10 pb-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginUser(data);
      const userObj = res.data?.user;
      
      // 1. Enforce Domain Security
      const hostname = window.location.hostname;
      const isLocal = hostname.includes('localhost');
      const isVercel = hostname.includes('vercel.app');
      
      if (!isLocal && !isVercel) {
        if (userObj?.role === 'SUPER_ADMIN') {
          if (hostname !== 'useclinixy.online' && hostname !== 'www.useclinixy.online') {
            throw new Error('Super Admins must log in at the main useclinixy.online portal.');
          }
        } else {
          const expectedDomain = `${userObj?.clinicId?.subdomain}.useclinixy.online`;
          
          if (hostname !== expectedDomain && userObj?.clinicId?.subdomain) {
            // MAGIC: Automatically seamlessly redirect them to their clinic's workspace with the token!
            window.location.href = `https://${expectedDomain}/auth-sync?token=${res.data.token}`;
            return; // Stop execution here because the browser is navigating away
          }
        }
      }

      // 2. Proceed with Login
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      // CRITICAL: Clear the cached error so the next page starts with a clean loading state
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      
      if (userObj?.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      // DO NOT setIsLoading(false) here, so the button stays spinning until Next.js unmounts the page
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md p-8 bg-white dark:bg-[#111111] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 dark:border-neutral-800"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-2">Sign in to your clinic dashboard</p>
      </div>

      {error && (
        <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
            placeholder="admin@clinic.com"
          />
          {errors.email && <span className="text-xs text-red-500 mt-1.5 block">{errors.email.message}</span>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300">Password</label>
            <Link href="/forgot-password" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <span className="text-xs text-red-500 mt-1.5 block">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-offset-[#111111] disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-neutral-400 mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800">
          Don't have an account?{' '}
          <Link href="/register-clinic" className="text-blue-600 hover:underline font-medium dark:text-blue-400">
            Start free trial
          </Link>
        </p>
      </form>
    </motion.div>
  );
};
