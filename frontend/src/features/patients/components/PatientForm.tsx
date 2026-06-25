'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Must be exactly 10 digits'),
  age: z.number().min(0, 'Must be positive'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  address: z.string().optional(),
  height: z.number().min(1, 'Required'),
  weight: z.number().min(1, 'Required'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
});

type FormData = z.infer<typeof schema>;

export const PatientForm = ({ onSubmit, defaultValues, loading }: any) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Name <span className="text-red-500">*</span></label>
        <input placeholder="e.g. Aarav Patel" {...register('name')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
        {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Age <span className="text-red-500">*</span></label>
           <input type="number" placeholder="30" {...register('age', { valueAsNumber: true })} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
           {errors.age && <span className="text-xs text-red-500 mt-1">{errors.age.message}</span>}
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Gender <span className="text-red-500">*</span></label>
           <select {...register('gender')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
           </select>
           {errors.gender && <span className="text-xs text-red-500 mt-1">{errors.gender.message}</span>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Mobile Number <span className="text-red-500">*</span></label>
        <input 
          placeholder="9876543210" 
          maxLength={10}
          onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10); }}
          {...register('mobileNumber')} 
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" 
        />
        {errors.mobileNumber && <span className="text-xs text-red-500 mt-1">{errors.mobileNumber.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Address</label>
        <textarea placeholder="Enter full residential address..." {...register('address')} rows={3} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Height (cm) <span className="text-red-500">*</span></label>
          <input type="number" placeholder="170" {...register('height', { valueAsNumber: true })} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
          {errors.height && <span className="text-xs text-red-500 mt-1">{errors.height.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Weight (kg) <span className="text-red-500">*</span></label>
          <input type="number" placeholder="70" {...register('weight', { valueAsNumber: true })} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors" />
          {errors.weight && <span className="text-xs text-red-500 mt-1">{errors.weight.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Blood Group</label>
          <select {...register('bloodGroup')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors">
            <option value="">Select...</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="pt-4">
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-colors">
          {loading ? 'Saving...' : 'Save Patient'}
        </button>
      </div>
    </form>
  );
};
