'use client';

import { useState, useEffect } from 'react';
import { AdvancedCalendar } from '@/features/appointments/components/AdvancedCalendar';
import { getDoctors } from '@/features/doctors/api/doctors';
import { Loader2 } from 'lucide-react';

export default function CalendarPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await getDoctors('', 1, 100);
        setDoctors(res.data || []);
      } catch (error) {
        console.error('Failed to load doctors', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Calendar</h1>
      </div>
      <div className="flex-1 rounded-xl border border-slate-200 bg-white dark:border-neutral-800 dark:bg-black overflow-hidden flex flex-col">
        <AdvancedCalendar doctors={doctors} />
      </div>
    </div>
  );
}
