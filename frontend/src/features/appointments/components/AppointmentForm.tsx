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
  paymentMode: z.enum(['CASH', 'ONLINE', 'PENDING']).default('PENDING'),
  isEmergency: z.boolean().default(false),
  feesApplied: z.number().min(0, 'Required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const AppointmentForm = ({ onSubmit, defaultValues, loading, onCreateNewPatient, newPatientAdded }: any) => {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const coeff = 1000 * 60 * 15;
  const rounded = new Date(Math.round(now.getTime() / coeff) * coeff);
  const currentTime = rounded.toTimeString().split(' ')[0].substring(0, 5); // HH:mm

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({ 
    resolver: zodResolver(schema), 
    defaultValues: {
      appointmentDate: currentDate,
      appointmentTime: currentTime,
      paymentMode: 'PENDING',
      isEmergency: false,
      feesApplied: 0,
      ...defaultValues 
    } 
  });
  
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    getDoctors('', 1, 1000).then(res => setDoctors(res.data));
    getPatients('', 1, 1000).then(res => setPatients(res.data));
    // Import getAppointments locally to fetch patient history
    import('@/features/appointments/api/appointments').then(m => {
       m.getAppointments('', 1, 1000).then(res => setAppointments(res.data));
    });
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
    label: p.uhid ? `[${p.uhid}] ${p.name}` : p.name
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

      {watch('doctorId') && (() => {
         const d: any = doctors.find((doc: any) => doc._id === watch('doctorId'));
         if (!d) return null;
         
         // Auto-calculate fee based on patient history and emergency status
         let calculatedFee = d.newPatientFee || 0;
         let statusText = "New Patient";
         
         const pId = watch('patientId');
         const isEmg = watch('isEmergency');
         
         if (pId) {
            const hasCompletedVisit = appointments.some(app => app.patientId?._id === pId && (app.status === 'COMPLETED' || app.status === 'CONFIRMED'));
            if (hasCompletedVisit) {
               calculatedFee = d.oldPatientFee || 0;
               statusText = "Old Patient";
            }
         }
         if (isEmg) {
            calculatedFee = d.emergencyFee || 0;
            statusText = "Emergency Case";
         }

         // Update form value seamlessly without triggering infinite loop
         setTimeout(() => {
            if (watch('feesApplied') !== calculatedFee) {
               setValue('feesApplied', calculatedFee);
            }
         }, 0);

         return (
           <div className="bg-blue-50 dark:bg-[#151c2f] border border-blue-100 dark:border-blue-900/50 rounded-lg p-3 flex flex-col gap-3">
              <span className="text-blue-800 dark:text-blue-400 font-medium whitespace-nowrap">Fee Structure Overview:</span>
              <div className="grid grid-cols-3 gap-2">
                 <div className="flex flex-col items-center justify-center bg-white dark:bg-[#1A1A1A] py-1.5 rounded shadow-sm border border-slate-100 dark:border-neutral-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold leading-tight">New</span>
                    <span className="text-slate-900 dark:text-white font-medium leading-tight">₹{d.newPatientFee || 0}</span>
                 </div>
                 <div className="flex flex-col items-center justify-center bg-white dark:bg-[#1A1A1A] py-1.5 rounded shadow-sm border border-slate-100 dark:border-neutral-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold leading-tight">Old</span>
                    <span className="text-slate-900 dark:text-white font-medium leading-tight">₹{d.oldPatientFee || 0}</span>
                 </div>
                 <div className="flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 py-1.5 rounded shadow-sm border border-red-100 dark:border-red-900/30">
                    <span className="text-[10px] text-red-600 dark:text-red-400 uppercase font-semibold leading-tight">Emg</span>
                    <span className="text-red-700 dark:text-red-300 font-bold leading-tight">₹{d.emergencyFee || 0}</span>
                 </div>
              </div>
           </div>
         );
      })()}

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
            <input type="time" step="900" {...register('appointmentTime')} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none dark:[color-scheme:dark]" />
            {errors.appointmentTime && <span className="text-xs text-red-500 mt-1">{errors.appointmentTime.message}</span>}
         </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Payment Mode</label>
          <select {...register('paymentMode')} className="w-full mt-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600">
            <option value="PENDING">Pending (Pay Later)</option>
            <option value="CASH">Cash</option>
            <option value="ONLINE">Online (UPI/Card)</option>
          </select>
        </div>
        <div className="flex flex-col">
           <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">Final Amount</label>
           <div className="relative mt-auto">
              <span className="absolute left-3 top-2 text-sm text-slate-500">₹</span>
              <input type="number" {...register('feesApplied', { valueAsNumber: true })} readOnly className="w-full rounded-md border border-slate-200 bg-slate-100 dark:bg-neutral-900 pl-6 pr-3 py-2 text-sm font-bold text-slate-900 dark:text-white dark:border-neutral-800 outline-none cursor-not-allowed" />
           </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isEmergency" {...register('isEmergency')} className="hidden peer" />
        <label htmlFor="isEmergency" className="w-5 h-5 border-2 border-slate-300 dark:border-neutral-600 rounded flex items-center justify-center peer-checked:bg-red-500 peer-checked:border-red-500 cursor-pointer transition-colors">
          <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </label>
        <label htmlFor="isEmergency" className="text-sm font-bold text-red-600 dark:text-red-400 cursor-pointer">
          Emergency Case (High Priority)
        </label>
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
