'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/features/dashboard/api/dashboard';
import { Users, Stethoscope, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    todaysAppointments: 0,
    upcomingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'text-blue-500' },
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-emerald-500' },
    { title: "Today's Appointments", value: stats.todaysAppointments, icon: Clock, color: 'text-orange-500' },
    { title: 'Upcoming Appointments', value: stats.upcomingAppointments, icon: Calendar, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#111111]"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg bg-slate-50 p-3 dark:bg-neutral-900 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">{card.title}</p>
                {loading ? (
                  <div className="mt-1 h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-neutral-800" />
                ) : (
                  <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {card.value}
                  </h3>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Skeleton for chart / list layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#111111] h-[400px]">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Activity Overview</h2>
          <div className="h-full w-full bg-slate-50 dark:bg-neutral-900 rounded flex items-center justify-center border border-dashed border-slate-200 dark:border-neutral-800">
             <span className="text-sm text-slate-500">Chart Placeholder</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#111111] h-[400px]">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Appointments</h2>
          <div className="space-y-4">
             {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 dark:border-neutral-800">
                   <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-neutral-800 animate-pulse" />
                   <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-slate-100 dark:bg-neutral-900 rounded animate-pulse" />
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
