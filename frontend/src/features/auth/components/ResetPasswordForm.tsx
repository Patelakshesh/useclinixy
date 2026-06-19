'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordSchema, ResetPasswordFormData } from '../schemas/auth.schema';
import { resetPassword } from '../api/auth';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token }
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await resetPassword(data);
      toast.success('Password has been reset successfully');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-8 bg-white dark:bg-[#111] rounded-2xl border border-red-200 dark:border-red-900/30">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Invalid Reset Link</h2>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">No reset token found in the URL. Please request a new password reset link.</p>
        <Link href="/forgot-password" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md p-8 bg-white dark:bg-[#111111] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 dark:border-neutral-800"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Create new password</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-2">Your new password must be different from previously used passwords.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register('token')} />
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">New Password</label>
          <div className="relative">
            <input
              {...register('newPassword')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all pr-10"
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
          {errors.newPassword && <span className="text-xs text-red-500 mt-1.5 block">{errors.newPassword.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <span className="text-xs text-red-500 mt-1.5 block">{errors.confirmPassword.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-offset-[#111111] disabled:opacity-50 active:scale-95"
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </motion.div>
  );
};
