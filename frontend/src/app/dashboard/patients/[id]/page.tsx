'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PatientProfile } from '@/features/patients/components/PatientProfile';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getPatientById } from '@/features/patients/api/patients';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await getPatientById(id);
        setPatient(res.data);
      } catch (error) {
        console.error(error);
        router.push('/dashboard/patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#1A1A1A] dark:text-neutral-400 dark:hover:bg-[#222] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{patient?.name}'s Profile</h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400">Manage medical history, vitals, and appointments</p>
        </div>
      </div>
      
      <PatientProfile patient={patient} />
    </div>
  );
}
