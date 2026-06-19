'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Printer, Loader2, ArrowLeft } from 'lucide-react';
import { createPrescription, getPrescriptionByAppointment, updatePrescription } from '../api/prescriptions';
import toast from 'react-hot-toast';

const schema = z.object({
  medicines: z.array(z.object({
    name: z.string().min(1, 'Required'),
    dosage: z.string().min(1, 'Required'),
    frequency: z.string().min(1, 'Required'),
    duration: z.string().min(1, 'Required'),
  })).min(1, 'Add at least one medicine'),
  instructions: z.string().optional(),
  notes: z.string().optional(),
});

export const PrescriptionBuilder = ({ appointment, onBack }: { appointment: any, onBack: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState(false);
  const [fetchedPrescription, setFetchedPrescription] = useState<any>(null);

  const { register, control, handleSubmit, reset, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
      instructions: '',
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "medicines" });

  useEffect(() => {
    fetchPrescription();
  }, [appointment._id]);

  const fetchPrescription = async () => {
    setLoading(true);
    try {
      const res = await getPrescriptionByAppointment(appointment._id);
      if (res.data) {
        setExistingId(res.data._id);
        setFetchedPrescription(res.data);
        reset({
          medicines: res.data.medicines,
          instructions: res.data.instructions || '',
          notes: res.data.notes || ''
        });
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load prescription');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        appointmentId: appointment._id,
        patientId: appointment.patientId?._id || appointment.patientId,
        doctorId: appointment.doctorId?._id || appointment.doctorId,
      };

      if (existingId) {
        await updatePrescription(existingId, payload);
        toast.success('Prescription updated');
      } else {
        const res = await createPrescription(payload);
        setExistingId(res.data._id);
        toast.success('Prescription created');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  if (printMode) {
    const printMedicines = getValues('medicines') || [];
    const printInstructions = getValues('instructions');
    const patient = fetchedPrescription?.patientId || appointment.patientId;
    const doctor = fetchedPrescription?.doctorId || appointment.doctorId;

    return (
      <div className="bg-white dark:bg-white text-black p-8 rounded-xl h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-8 border-b pb-4 border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{doctor?.name}</h1>
            <p className="text-slate-600 font-medium">{doctor?.specialization || 'Doctor'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-indigo-600 tracking-widest">PRESCRIPTION</h2>
            <p className="text-sm text-slate-500 mt-1">Date: {appointment.appointmentDate}</p>
          </div>
        </div>
        
        <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-500">Patient Name:</span> <span className="font-semibold block">{patient?.name || 'N/A'}</span></div>
            <div><span className="text-slate-500">Age / Gender:</span> <span className="font-semibold block">{patient?.age || '-'} / {patient?.gender || '-'}</span></div>
            <div><span className="text-slate-500">Contact:</span> <span className="font-semibold block">{patient?.mobileNumber || 'N/A'}</span></div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 border-b border-slate-200 pb-2">Rx</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-600">
                <th className="py-2 w-2/5">Medicine Name</th>
                <th className="py-2">Dosage</th>
                <th className="py-2">Frequency</th>
                <th className="py-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {printMedicines.map((med: any, index: number) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-3 font-semibold text-slate-900">{med.name}</td>
                  <td className="py-3 text-slate-700">{med.dosage}</td>
                  <td className="py-3 text-slate-700">{med.frequency}</td>
                  <td className="py-3 text-slate-700">{med.duration}</td>
                </tr>
              ))}
              {printMedicines.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-slate-500 text-center">No medicines added</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {printInstructions && (
          <div className="mb-8">
            <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Instructions</h4>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{printInstructions}</p>
          </div>
        )}

        <div className="flex justify-between mt-12 gap-4">
          <button onClick={() => setPrintMode(false)} className="px-4 py-2 bg-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 print:hidden">Back to Editor</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 print:hidden flex items-center gap-2"><Printer className="w-4 h-4" /> Print</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-neutral-800 pb-4">
        <button onClick={onBack} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Prescription Builder</h3>
          <p className="text-xs text-slate-500">For {appointment.patientId?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white">Medicines (Rx)</h4>
            <button type="button" onClick={() => append({ name: '', dosage: '', frequency: '', duration: '' })} className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium">
              <Plus className="w-3.5 h-3.5" /> Add Medicine
            </button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="p-3 bg-slate-50 dark:bg-[#1A1A1A] rounded-lg border border-slate-200 dark:border-neutral-800 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Medicine Name <span className="text-red-500">*</span></label>
                    <input {...register(`medicines.${index}.name`)} placeholder="e.g. Paracetamol" className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-black dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Dosage <span className="text-red-500">*</span></label>
                    <input {...register(`medicines.${index}.dosage`)} placeholder="e.g. 500mg" className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-black dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Frequency <span className="text-red-500">*</span></label>
                    <input {...register(`medicines.${index}.frequency`)} placeholder="e.g. 1-0-1 (After Food)" className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-black dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Duration <span className="text-red-500">*</span></label>
                    <input {...register(`medicines.${index}.duration`)} placeholder="e.g. 5 days" className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-black dark:text-white outline-none" />
                  </div>
                </div>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400 shadow-sm">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.medicines && <span className="text-xs text-red-500 mt-1">{errors.medicines.message as string}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">General Instructions</label>
          <textarea {...register('instructions')} rows={2} placeholder="Drink plenty of water..." className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Private Notes (Not printed)</label>
          <textarea {...register('notes')} rows={2} placeholder="Internal notes for next visit..." className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 resize-none" />
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-neutral-800">
          <button type="button" onClick={() => setPrintMode(true)} disabled={!existingId} className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:bg-black dark:text-neutral-200 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50">
            <Printer className="w-4 h-4" /> Print Preview
          </button>
          <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : existingId ? 'Update Prescription' : 'Save Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};
