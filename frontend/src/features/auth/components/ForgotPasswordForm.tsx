'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../schemas/auth.schema';
import { forgotPassword } from '../api/auth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setIsSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white dark:bg-[#111111] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 dark:border-neutral-800 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 mb-4">
          <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">Check your email</h2>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mb-6">We&apos;ve sent a password reset link to your email address.</p>
        <Link href="/login" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Return to login
        </Link>
      </motion.div>
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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Reset password</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-2">Enter your email and we&apos;ll send you a reset link</p>
      </div>

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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-offset-[#111111] disabled:opacity-50 active:scale-95"
        >
          {isLoading ? 'Sending link...' : 'Send reset link'}
        </button>

        <div className="text-center mt-4">
          <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
            Back to login
          </Link>
        </div>
      </form>
    </motion.div>
  );
};
