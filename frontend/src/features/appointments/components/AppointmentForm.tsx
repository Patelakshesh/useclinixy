'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { getDoctors } from '@/features/doctors/api/doctors';
import { getPatients } from '@/features/patients/api/patients';

const schema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  patientId: z.string().min(1, 'Patient is required'),
  appointmentDate: z.string().min(1, 'Date is required'),
  appointmentTime: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const AppointmentForm = ({ onSubmit, defaultValues, loading }: any) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues });
  
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    getDoctors('', 1, 1000).then(res => setDoctors(res.data));
    getPatients('', 1, 1000).then(res => setPatients(res.data));
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Doctor <span className="text-red-500">*</span></label>
        <select {...register('doctorId')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600">
           <option value="">Select Doctor</option>
           {doctors.map((d: any) => <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>)}
        </select>
        {errors.doctorId && <span className="text-xs text-red-500 mt-1">{errors.doctorId.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Patient <span className="text-red-500">*</span></label>
        <select {...register('patientId')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600">
           <option value="">Select Patient</option>
           {patients.map((p: any) => <option key={p._id} value={p._id}>{p.name} ({p.mobileNumber})</option>)}
        </select>
        {errors.patientId && <span className="text-xs text-red-500 mt-1">{errors.patientId.message}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Date <span className="text-red-500">*</span></label>
            <input min={new Date().toISOString().split('T')[0]} type="date" {...register('appointmentDate')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none dark:[color-scheme:dark]" />
            {errors.appointmentDate && <span className="text-xs text-red-500 mt-1">{errors.appointmentDate.message}</span>}
         </div>
         <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Time <span className="text-red-500">*</span></label>
            <input type="time" {...register('appointmentTime')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none dark:[color-scheme:dark]" />
            {errors.appointmentTime && <span className="text-xs text-red-500 mt-1">{errors.appointmentTime.message}</span>}
         </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Notes</label>
        <textarea placeholder="e.g. Patient has mild fever and cough..." {...register('notes')} rows={3} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400" />
      </div>
      <div className="pt-4">
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-colors">
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </div>
    </form>
  );
};
