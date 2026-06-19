'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getClinicProfile, updateClinicProfile } from '@/features/clinic/api/clinic';
import { changePassword } from '@/features/auth/api/auth';
import { clinicProfileSchema, ClinicProfileFormData } from '@/features/clinic/schemas/clinic.schema';
import { changePasswordSchema, ChangePasswordFormData } from '@/features/auth/schemas/auth.schema';
import { Building2, KeyRound, Loader2, Eye, EyeOff, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const profileForm = useForm<ClinicProfileFormData>({
    resolver: zodResolver(clinicProfileSchema),
  });

  const securityForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getClinicProfile();
        if (res.data) {
          profileForm.reset({
            name: res.data.name,
            email: res.data.email,
            mobileNumber: res.data.mobileNumber,
            address: res.data.address,
            workingHours: res.data.workingHours || { start: '09:00', end: '17:00', days: [] },
            logo: res.data.logo || ''
          });
          if (res.data.logo) setLogoPreview(res.data.logo);
        }
      } catch (error) {
        toast.error('Failed to load clinic profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [profileForm]);

  const onProfileSubmit = async (data: ClinicProfileFormData) => {
    setIsSaving(true);
    try {
      await updateClinicProfile(data);
      toast.success('Clinic profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const onSecuritySubmit = async (data: ChangePasswordFormData) => {
    setIsSaving(true);
    try {
      await changePassword(data);
      toast.success('Password changed successfully');
      securityForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        profileForm.setValue('logo', base64String, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    profileForm.setValue('logo', '', { shouldDirty: true });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Manage your clinic profile and security preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-slate-100 text-slate-900 dark:bg-neutral-800 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Clinic Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-slate-100 text-slate-900 dark:bg-neutral-800 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-white'
              }`}
            >
              <KeyRound className="h-4 w-4" />
              Security
            </button>
          </nav>
        </aside>

        <main className="flex-1">
          {activeTab === 'profile' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-black">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Clinic Information</h2>
              
              <div className="mb-8 flex items-center gap-6">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-[#1A1A1A]">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Clinic Logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-neutral-500">
                      <Building2 className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 dark:border-neutral-800 dark:bg-[#111] dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors">
                      <UploadCloud className="h-4 w-4" />
                      Upload Logo
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    {logoPreview && (
                      <button onClick={handleRemoveLogo} type="button" className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
                        <X className="h-4 w-4" />
                        Delete Logo
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Clinic Name</label>
                    <input
                      {...profileForm.register('name')}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                    {profileForm.formState.errors.name && <span className="text-xs text-red-500 mt-1 block">{profileForm.formState.errors.name.message}</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Email Address</label>
                    <input
                      {...profileForm.register('email')}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                    {profileForm.formState.errors.email && <span className="text-xs text-red-500 mt-1 block">{profileForm.formState.errors.email.message}</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Mobile Number</label>
                    <input
                      {...profileForm.register('mobileNumber')}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                    {profileForm.formState.errors.mobileNumber && <span className="text-xs text-red-500 mt-1 block">{profileForm.formState.errors.mobileNumber.message}</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Address</label>
                    <input
                      {...profileForm.register('address')}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                    {profileForm.formState.errors.address && <span className="text-xs text-red-500 mt-1 block">{profileForm.formState.errors.address.message}</span>}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-neutral-800">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Working Hours</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Start Time</label>
                      <input
                        type="time"
                        {...profileForm.register('workingHours.start')}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all dark:[color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">End Time</label>
                      <input
                        type="time"
                        {...profileForm.register('workingHours.end')}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(day => (
                        <label key={day} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-neutral-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors">
                          <input
                            type="checkbox"
                            value={day}
                            {...profileForm.register('workingHours.days')}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-neutral-700 dark:bg-neutral-800"
                          />
                          <span className="text-sm text-slate-700 dark:text-neutral-300">{day}</span>
                        </label>
                      ))}
                    </div>
                    {profileForm.formState.errors.workingHours?.days && <span className="text-xs text-red-500 mt-2 block">{profileForm.formState.errors.workingHours.days.message}</span>}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-black">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Change Password</h2>
              <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      {...securityForm.register('currentPassword')}
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all pr-10"
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300">
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {securityForm.formState.errors.currentPassword && <span className="text-xs text-red-500 mt-1 block">{securityForm.formState.errors.currentPassword.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      {...securityForm.register('newPassword')}
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all pr-10"
                      placeholder="Enter new password"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300">
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {securityForm.formState.errors.newPassword && <span className="text-xs text-red-500 mt-1 block">{securityForm.formState.errors.newPassword.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      {...securityForm.register('confirmPassword')}
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all pr-10"
                      placeholder="Confirm new password"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300">
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {securityForm.formState.errors.confirmPassword && <span className="text-xs text-red-500 mt-1 block">{securityForm.formState.errors.confirmPassword.message}</span>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
