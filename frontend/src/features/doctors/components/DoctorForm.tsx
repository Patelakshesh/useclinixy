'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Must be exactly 10 digits'),
  specialization: z.string().min(1, 'Specialization is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  experience: z.number().min(0, 'Must be positive'),
  newPatientFee: z.number().min(0, 'Must be positive'),
  oldPatientFee: z.number().min(0, 'Must be positive'),
  emergencyFee: z.number().min(0, 'Must be positive'),
});

type FormData = z.infer<typeof schema>;

export const DoctorForm = ({ onSubmit, defaultValues, loading }: any) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Name <span className="text-red-500">*</span></label>
        <input placeholder="Dr. John Doe" {...register('name')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
        {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Email <span className="text-red-500">*</span></label>
        <input type="email" placeholder="doctor@clinic.com" {...register('email')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
        {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Mobile Number <span className="text-red-500">*</span></label>
        <input 
          placeholder="+1 234 567 8900" 
          maxLength={10}
          onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10); }}
          {...register('mobileNumber')} 
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" 
        />
        {errors.mobileNumber && <span className="text-xs text-red-500 mt-1">{errors.mobileNumber.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Specialization <span className="text-red-500">*</span></label>
        <input placeholder="e.g. Cardiologist" {...register('specialization')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
        {errors.specialization && <span className="text-xs text-red-500 mt-1">{errors.specialization.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Qualification <span className="text-red-500">*</span></label>
        <input placeholder="e.g. MBBS, MD" {...register('qualification')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
        {errors.qualification && <span className="text-xs text-red-500 mt-1">{errors.qualification.message}</span>}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Experience (Yrs) <span className="text-red-500">*</span></label>
          <input type="number" placeholder="5" {...register('experience', { valueAsNumber: true })} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
          {errors.experience && <span className="text-xs text-red-500 mt-1">{errors.experience.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">New Patient Fee (₹) <span className="text-red-500">*</span></label>
          <input type="number" placeholder="500" {...register('newPatientFee', { valueAsNumber: true })} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
          {errors.newPatientFee && <span className="text-xs text-red-500 mt-1">{errors.newPatientFee.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Old Patient Fee (₹) <span className="text-red-500">*</span></label>
          <input type="number" placeholder="300" {...register('oldPatientFee', { valueAsNumber: true })} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
          {errors.oldPatientFee && <span className="text-xs text-red-500 mt-1">{errors.oldPatientFee.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Emergency Fee (₹) <span className="text-red-500">*</span></label>
          <input type="number" placeholder="1000" {...register('emergencyFee', { valueAsNumber: true })} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
          {errors.emergencyFee && <span className="text-xs text-red-500 mt-1">{errors.emergencyFee.message}</span>}
        </div>
      </div>
      

      <div className="pt-2 text-xs text-slate-500 dark:text-neutral-400">
        Note: You can configure the doctor's detailed working hours, shifts, and leaves from the main Doctors list by clicking the "Manage Schedule" action.
      </div>

      <div className="pt-4 flex gap-3">
        <button type="button" onClick={handleSubmit((data) => onSubmit(data, false))} disabled={loading} className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-colors">
          {loading ? 'Saving...' : 'Save Doctor'}
        </button>
        {!defaultValues && (
          <button type="button" onClick={handleSubmit((data) => onSubmit(data, true))} disabled={loading} className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-[#1A1A1A] dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors">
            {loading ? 'Saving...' : 'Save & Add Schedule'}
          </button>
        )}
      </div>
    </form>
  );
};
