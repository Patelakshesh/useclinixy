'use client';

import { useQuery } from '@tanstack/react-query';
import { clinicApi } from '@/lib/api';
import { BarChart2, TrendingUp, Users, Calendar, Award } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-green-500',
  SCHEDULED: 'bg-blue-500',
  CANCELLED: 'bg-red-500',
  NO_SHOW: 'bg-amber-500',
};

const fetchReports = async () => {
  const res = await clinicApi.get('/dashboard/reports');
  return res.data.data;
};

export default function ReportsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['clinicReports'], queryFn: fetchReports });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-neutral-900 rounded-2xl" />)}
      </div>
    );
  }

  const trend = data?.appointmentTrend || [];
  const topDoctors = data?.topDoctors || [];
  const statusBreakdown = data?.statusBreakdown || [];
  const patientGrowth = data?.patientGrowth || [];

  const maxTrend = Math.max(...trend.map((t: any) => t.total), 1);
  const maxPatient = Math.max(...patientGrowth.map((p: any) => p.newPatients), 1);
  const totalStatusCount = statusBreakdown.reduce((s: number, r: any) => s + r.count, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h2>
        <p className="text-slate-500 dark:text-neutral-400">Insights into your clinic's performance over the last 6 months.</p>
      </div>

      {/* Appointment Trend Chart */}
      <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Appointment Trend (Last 6 Months)</h3>
        </div>
        {trend.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-neutral-500 py-8">No appointment data yet.</p>
        ) : (
          <div className="flex items-end gap-3 h-40">
            {trend.map((t: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5" style={{ height: '120px', justifyContent: 'flex-end' }}>
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                    style={{ height: `${(t.total / maxTrend) * 100}%` }}
                    title={`Total: ${t.total}`}
                  />
                </div>
                <span className="text-xs text-slate-400 dark:text-neutral-500">{MONTH_NAMES[t._id.month - 1]}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300">{t.total}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-4 mt-4 text-xs text-slate-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Total</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Cancelled</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Breakdown */}
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Status Breakdown</h3>
          </div>
          <div className="space-y-3">
            {statusBreakdown.map((s: any) => (
              <div key={s._id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-neutral-400">{s._id}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.count} ({Math.round((s.count / totalStatusCount) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${STATUS_COLORS[s._id] || 'bg-slate-400'} transition-all duration-700`}
                    style={{ width: `${(s.count / totalStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {statusBreakdown.length === 0 && <p className="text-center text-slate-400 dark:text-neutral-500 py-4">No data yet.</p>}
          </div>
        </div>

        {/* Top Doctors */}
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Top Doctors by Appointments</h3>
          </div>
          <div className="space-y-3">
            {topDoctors.map((doc: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-amber-700'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Dr. {doc.name}</p>
                  <p className="text-xs text-slate-500 dark:text-neutral-500">{doc.specialization}</p>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-neutral-300">{doc.count} appts</span>
              </div>
            ))}
            {topDoctors.length === 0 && <p className="text-center text-slate-400 dark:text-neutral-500 py-4">No data yet.</p>}
          </div>
        </div>
      </div>

      {/* Patient Growth */}
      <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">New Patients Per Month</h3>
        </div>
        {patientGrowth.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-neutral-500 py-8">No patient data yet.</p>
        ) : (
          <div className="flex items-end gap-3 h-32">
            {patientGrowth.map((p: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full" style={{ height: '80px', display: 'flex', alignItems: 'flex-end' }}>
                  <div
                    className="w-full bg-green-500 rounded-t-md transition-all duration-500"
                    style={{ height: `${(p.newPatients / maxPatient) * 100}%` }}
                    title={`New: ${p.newPatients}`}
                  />
                </div>
                <span className="text-xs text-slate-400 dark:text-neutral-500">{MONTH_NAMES[p._id.month - 1]}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300">{p.newPatients}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
