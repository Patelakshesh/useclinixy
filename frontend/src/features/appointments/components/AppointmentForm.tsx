'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
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

export const AppointmentForm = ({ onSubmit, defaultValues, loading, onCreateNewPatient, newPatientAdded }: any) => {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues });
  
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    getDoctors('', 1, 1000).then(res => setDoctors(res.data));
  }, []);

  useEffect(() => {
    getPatients('', 1, 1000).then(res => setPatients(res.data));
  }, []);

  useEffect(() => {
    if (newPatientAdded) {
      getPatients('', 1, 1000).then(res => {
        setPatients(res.data);
        setValue('patientId', newPatientAdded._id, { shouldValidate: true });
      });
    }
  }, [newPatientAdded, setValue]);

  const patientOptions = patients.map((p: any) => ({
    value: p._id,
    label: `${p.name} (${p.mobileNumber})`
  }));

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
        <Controller
          name="patientId"
          control={control}
          render={({ field }) => (
            <CreatableSelect
              {...field}
              isClearable
              options={patientOptions}
              value={patientOptions.find(o => o.value === field.value) || null}
              onChange={(selected: any) => field.onChange(selected ? selected.value : '')}
              onCreateOption={(inputValue) => {
                if (onCreateNewPatient) onCreateNewPatient(inputValue);
              }}
              placeholder="Search or type to create new patient..."
              formatCreateLabel={(inputValue) => `Create new patient: "${inputValue}"`}
              className="text-sm react-select-container"
              classNamePrefix="react-select"
              classNames={{
                control: ({ isFocused }) => 
                  `!bg-slate-50 dark:!bg-[#1A1A1A] !border !border-slate-200 dark:!border-neutral-800 !min-h-[38px] !rounded-md !shadow-none ${isFocused ? '!border-slate-400 dark:!border-neutral-600' : ''}`,
                menu: () => `!bg-white dark:!bg-[#1A1A1A] !border !border-slate-200 dark:!border-neutral-800 !shadow-lg !rounded-md !mt-1`,
                menuList: () => `!p-1`,
                option: ({ isFocused, isSelected }) => 
                  `!cursor-pointer !text-sm !rounded-sm !py-2 !px-3 ${isSelected ? '!bg-blue-600 !text-white' : isFocused ? '!bg-slate-100 dark:!bg-neutral-800 !text-slate-900 dark:!text-white' : '!bg-transparent !text-slate-700 dark:!text-slate-200'}`,
                singleValue: () => `!text-slate-900 dark:!text-white`,
                input: () => `!text-slate-900 dark:!text-white`,
                placeholder: () => `!text-slate-400 dark:!text-slate-500`,
                indicatorSeparator: () => `!bg-slate-200 dark:!bg-neutral-800`,
                dropdownIndicator: () => `!text-slate-400 dark:!text-slate-500 hover:!text-slate-600 dark:hover:!text-slate-300`,
                clearIndicator: () => `!text-slate-400 dark:!text-slate-500 hover:!text-slate-600 dark:hover:!text-slate-300`
              }}
            />
          )}
        />
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
