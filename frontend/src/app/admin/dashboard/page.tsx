'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '@/features/admin/api/admin';
import { Building2, Activity, AlertTriangle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: getDashboardMetrics,
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-neutral-800 rounded-xl"></div>)}
      </div>
      <div className="h-96 bg-slate-200 dark:bg-neutral-800 rounded-xl mt-6"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500">Failed to load dashboard metrics. Are you a Super Admin?</div>;
  }

  const kpis = data?.kpis;
  const recentClinics = data?.recentClinics || [];

  const statCards = [
    { title: 'Total Clinics', value: kpis?.totalClinics || 0, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Active Subscriptions', value: kpis?.activeClinics || 0, icon: Activity, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { title: 'Suspended Clinics', value: kpis?.suspendedClinics || 0, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { title: 'Monthly Revenue', value: `$${(kpis?.mrr || 0).toLocaleString()}`, icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h2>
        <p className="text-slate-500 dark:text-neutral-400">Global metrics for your SaaS platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#111] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-neutral-400">{stat.title}</h3>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-neutral-800">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Recent Signups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0A0A0A]">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Clinic Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Subdomain</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {recentClinics.map((clinic: any) => (
                <tr key={clinic._id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{clinic.name}</div>
                    <div className="text-xs text-slate-500 dark:text-neutral-400">{clinic.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-neutral-300">
                    useclinixy.vercel.app/booking/{clinic.subdomain}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-neutral-300">
                    <span className="font-medium">{clinic.subscriptionId?.planId?.name || 'Free Trial'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${clinic.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                      ${clinic.status === 'TRIAL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                      ${clinic.status === 'SUSPENDED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                    `}>
                      {clinic.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-neutral-400">
                    {format(new Date(clinic.createdAt), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
              {recentClinics.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-neutral-400">
                    No clinics have registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
