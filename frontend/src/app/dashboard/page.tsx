'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats, getRecentActivities } from '@/features/dashboard/api/dashboard';
import { Users, Stethoscope, Calendar, Clock, ArrowUpRight, TrendingUp, Plus, UserPlus, CalendarPlus, Activity, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/features/auth/api/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    todaysAppointments: 0,
    upcomingAppointments: 0,
    chartData: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await getDashboardStats();
        setStats(statsData);
        
        const activitiesData = await getRecentActivities();
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleDownloadReport = () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," 
          + "Metric,Value\n"
          + `Total Doctors,${stats.totalDoctors}\n`
          + `Total Patients,${stats.totalPatients}\n`
          + `Today's Appointments,${stats.todaysAppointments}\n`
          + `Upcoming Appointments,${stats.upcomingAppointments}\n`;
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Clinic_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const statCards = [
    { title: 'Total Doctors', value: stats.totalDoctors, icon: Stethoscope, trend: '+12%', trendUp: true, sparkline: [10, 25, 15, 30, 20, 40, 50] },
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, trend: '+5%', trendUp: true, sparkline: [20, 10, 30, 15, 40, 25, 45] },
    { title: "Today's Appointments", value: stats.todaysAppointments, icon: Clock, trend: '+2', trendUp: true, sparkline: [5, 15, 10, 20, 15, 25, 30] },
    { title: 'Upcoming', value: stats.upcomingAppointments, icon: Calendar, trend: '-1%', trendUp: false, sparkline: [40, 30, 45, 25, 35, 20, 15] },
  ];

  const chartData = stats.chartData || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h1>
           <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Here&apos;s what&apos;s happening in your clinic today.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <button onClick={handleDownloadReport} className="flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-neutral-800 dark:bg-[#111] dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-neutral-800 active:scale-95">
             <ArrowUpRight className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
             Export
           </button>
           {user?.role !== 'DOCTOR' && (
             <Link href="/dashboard/appointments" className="flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 sm:py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95">
               <Plus className="h-4 w-4" />
               Booking
             </Link>
           )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md dark:border-neutral-800/80 dark:bg-[#0A0A0A] hover:border-slate-300 dark:hover:border-neutral-700 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                   {card.title}
                 </p>
                 <div className="mt-2 flex items-baseline gap-2">
                   {loading ? (
                     <div className="h-8 w-16 animate-pulse rounded bg-slate-100 dark:bg-neutral-800/50" />
                   ) : (
                     <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                       {card.value}
                     </h3>
                   )}
                 </div>
               </div>
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-[#111] group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <card.icon className="h-5 w-5 text-slate-400 dark:text-neutral-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
               </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs">
               <div className={`flex items-center gap-1 font-medium ${card.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-neutral-500'}`}>
                 {card.trendUp ? <TrendingUp className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                 {card.trend}
                 <span className="text-slate-400 dark:text-neutral-600 font-normal ml-1">vs last month</span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="col-span-1 lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-neutral-800/80 dark:bg-[#0A0A0A] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
             <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Appointment Volume</h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Daily patient intake metrics (Last 7 Days)</p>
             </div>
          </div>
          <div className="h-[300px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#888" opacity={0.15} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#222', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}
                  labelStyle={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}
                  cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAppointments)" activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Schedule & Recent Activity Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-neutral-800/80 dark:bg-[#0A0A0A] overflow-hidden flex flex-col"
        >
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-neutral-800/50 flex justify-between items-center">
             <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">Latest system events</p>
             </div>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
             <div className="space-y-6">
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-800/50 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 w-3/4 bg-slate-100 dark:bg-neutral-800/50 rounded animate-pulse" />
                          <div className="h-2 w-1/2 bg-slate-50 dark:bg-neutral-900/50 rounded animate-pulse" />
                        </div>
                    </div>
                  ))
                ) : activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                     <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-[#111] flex items-center justify-center mb-3">
                        <Activity className="h-6 w-6 text-slate-300 dark:text-neutral-600" />
                     </div>
                     <p className="text-sm font-medium text-slate-900 dark:text-white">No recent activity</p>
                     <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">Check back later.</p>
                  </div>
                ) : (
                  activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="flex items-start gap-4 group">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-neutral-800/50 text-slate-500 dark:text-neutral-400 border border-slate-100 dark:border-neutral-800">
                         {act.type === 'APPOINTMENT' ? <Calendar className="w-4 h-4" /> : act.type === 'STAFF' ? <Shield className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                         <p className="text-sm text-slate-700 dark:text-neutral-300 leading-tight">
                           {act.description.replace('with Dr. Dr.', 'with Dr.')}
                         </p>
                         <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">
                           {new Date(act.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                         </p>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
         {user?.role !== 'DOCTOR' ? (
           <>
             <Link href="/dashboard/patients" className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm hover:shadow-md dark:border-neutral-800/80 dark:bg-[#0A0A0A] hover:border-slate-300 dark:hover:border-neutral-700 transition-all group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                   <UserPlus className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Register Patient</h3>
                   <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Add a new patient record</p>
                </div>
             </Link>
             <Link href="/dashboard/appointments" className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm hover:shadow-md dark:border-neutral-800/80 dark:bg-[#0A0A0A] hover:border-slate-300 dark:hover:border-neutral-700 transition-all group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                   <CalendarPlus className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Book Appointment</h3>
                   <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Schedule a new visit</p>
                </div>
             </Link>
           </>
         ) : (
           <>
             <Link href="/dashboard/patients" className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm hover:shadow-md dark:border-neutral-800/80 dark:bg-[#0A0A0A] hover:border-slate-300 dark:hover:border-neutral-700 transition-all group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                   <Users className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-sm font-semibold text-slate-900 dark:text-white">View Patients</h3>
                   <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Browse patient records</p>
                </div>
             </Link>
             <Link href="/dashboard/calendar" className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm hover:shadow-md dark:border-neutral-800/80 dark:bg-[#0A0A0A] hover:border-slate-300 dark:hover:border-neutral-700 transition-all group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                   <Calendar className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-sm font-semibold text-slate-900 dark:text-white">My Schedule</h3>
                   <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">View today's appointments</p>
                </div>
             </Link>
           </>
         )}
         
         {user?.role === 'CLINIC_ADMIN' && (
           <Link href="/dashboard/doctors" className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm hover:shadow-md dark:border-neutral-800/80 dark:bg-[#0A0A0A] hover:border-slate-300 dark:hover:border-neutral-700 transition-all group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                 <Plus className="h-5 w-5" />
              </div>
              <div>
                 <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Add Doctor</h3>
                 <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Onboard medical staff</p>
              </div>
           </Link>
         )}
      </motion.div>
    </div>
  );
}
