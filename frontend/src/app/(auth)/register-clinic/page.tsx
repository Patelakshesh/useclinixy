'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, User, Phone, MapPin, Globe, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';

const registerSchema = z.object({
  clinicName: z.string().min(3, 'Clinic name is required'),
  subdomain: z.string().min(3, 'Subdomain must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  address: z.string().min(2, 'Address is required'),
  phone: z.string().regex(/^\d{10}$/, 'Must be exactly 10 digits'),
  adminName: z.string().min(2, 'Name is required'),
  adminEmail: z.string().email('Valid email is required'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterClinic() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocal = hostname.includes('localhost');
    const isVercel = hostname.includes('vercel.app');
    
    if (!isLocal && !isVercel) {
      if (hostname !== 'useclinixy.online' && hostname !== 'www.useclinixy.online') {
        window.location.href = 'https://useclinixy.online/register-clinic';
      }
    }
  }, []);

  const { register, handleSubmit, formState: { errors }, watch, setError, clearErrors } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const subdomain = watch('subdomain');
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSubdomain(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/clinic/check-subdomain/${subdomain}`);
        if (res.data.available) {
          setSubdomainAvailable(true);
          clearErrors('subdomain');
        } else {
          setSubdomainAvailable(false);
          setError('subdomain', { type: 'manual', message: 'This subdomain is already taken. Please try another one.' });
        }
      } catch (err) {
        console.error('Failed to check subdomain', err);
      } finally {
        setCheckingSubdomain(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [subdomain, setError, clearErrors]);

  const onSubmit = async (data: RegisterFormValues) => {
    if (subdomainAvailable === false) return;
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/clinic/register`, data);
      if (res.data.success) {
        toast.success(res.data.message || 'Clinic registered successfully!');
        
        // Redirect them directly to their brand new workspace domain!
        const isLocal = window.location.hostname.includes('localhost');
        if (isLocal) {
          router.push('/login');
        } else {
          window.location.href = `https://${data.subdomain}.useclinixy.online/login`;
        }
      }
    } catch (error: any) {
      if (error.response?.data?.message === 'Subdomain already in use') {
        setError('subdomain', { type: 'manual', message: 'This subdomain is already taken. Please try another one.' });
      } else if (error.response?.data?.message === 'Email already registered') {
        setError('adminEmail', { type: 'manual', message: 'This email is already registered. Try logging in.' });
      } else {
        toast.error(error.response?.data?.message || 'Failed to register clinic');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-xl border border-slate-200/60 dark:border-neutral-800/60 overflow-hidden">
        
        {/* Left Side: Information */}
        <div className="hidden md:flex flex-col justify-center bg-blue-600 p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Building2 className="w-64 h-64 transform translate-x-12 -translate-y-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 font-bold">
                C
              </div>
              <span className="text-xl font-bold tracking-tight">Clinixy</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Start your 14-day free trial.</h2>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Join thousands of healthcare professionals who trust our platform to manage their practice efficiently and securely.
            </p>
            <ul className="space-y-4">
               {['Unlimited Appointments', 'Multi-tenant Security', 'Patient Medical Records', 'WhatsApp Notifications'].map(item => (
                 <li key={item} className="flex items-center gap-3">
                   <div className="h-5 w-5 rounded-full bg-blue-500/50 flex items-center justify-center shrink-0">
                     <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                   </div>
                   <span className="font-medium">{item}</span>
                 </li>
               ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 relative">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h2>
          <p className="text-slate-500 dark:text-neutral-400 text-sm mb-8">Set up your clinic and admin profile to get started.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Clinic Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    {...register('clinicName')}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
                    placeholder="City Hospital"
                  />
                </div>
                {errors.clinicName && <p className="text-xs text-red-500 mt-1">{errors.clinicName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Public Subdomain <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    {...register('subdomain')}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
                    placeholder="cityhospital"
                  />
                  {checkingSubdomain && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {subdomain && !errors.subdomain && subdomainAvailable && !checkingSubdomain && (
                  <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">✓ Available! Your portal: https://{subdomain}.useclinixy.online/</p>
                )}
                {errors.subdomain && <p className="text-xs text-red-500 mt-1">{errors.subdomain.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  {...register('address')}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
                  placeholder="123 Medical Drive, New York, NY"
                />
              </div>
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Admin Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    {...register('adminName')}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
                {errors.adminName && <p className="text-xs text-red-500 mt-1">{errors.adminName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Admin Phone <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    maxLength={10}
                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10); }}
                    {...register('phone')}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
                    placeholder="9876543210"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Admin Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  {...register('adminEmail')}
                  type="email"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
                  placeholder="admin@cityhospital.com"
                />
              </div>
              {errors.adminEmail && <p className="text-xs text-red-500 mt-1">{errors.adminEmail.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  {...register('adminPassword')}
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.adminPassword && <p className="text-xs text-red-500 mt-1">{errors.adminPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-neutral-400 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium dark:text-blue-400">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
