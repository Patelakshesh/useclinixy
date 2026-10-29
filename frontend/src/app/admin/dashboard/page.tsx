'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '@/features/admin/api/admin';
import { Building2, Activity, AlertTriangle, IndianRupee, ArrowRight, MessageCircle, Phone, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

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
    { title: 'Monthly Revenue', value: `₹${(kpis?.mrr || 0).toLocaleString()}`, icon: IndianRupee, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  const cleanPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  const getWhatsAppLink = (clinic: any) => {
    const phone = cleanPhone(clinic.mobileNumber || clinic.phone);
    if (!phone) return '#';
    const formattedPhone = phone.startsWith('91') || phone.length > 10 ? phone : `91${phone}`;
    const doctorName = clinic.ownerId?.name ? `Dr. ${clinic.ownerId.name}` : 'Doctor';
    const message = encodeURIComponent(`Hello ${doctorName}, thank you for registering ${clinic.name} on Clinixy! How can we help you get started?`);
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h2>
        <p className="text-slate-500 dark:text-neutral-400">Global metrics & new clinic registrations for Clinixy SaaS.</p>
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
        <div className="px-6 py-5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Clinic Signups</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">Newest clinics registered on the platform</p>
          </div>
          <Link 
            href="/admin/clinics" 
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group"
          >
            View All Clinics & Leads 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0A0A0A]">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Clinic & Domain</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Doctor / Owner</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Quick Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Plan & Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {recentClinics.map((clinic: any) => {
                const phone = clinic.mobileNumber || clinic.phone;
                const ownerName = clinic.ownerId?.name || 'Doctor';
                const ownerEmail = clinic.email || clinic.ownerId?.email;

                return (
                  <tr key={clinic._id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{clinic.name}</div>
                      <a 
                        href={`https://${clinic.subdomain}.useclinixy.online`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {clinic.subdomain}.useclinixy.online
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {ownerName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400">{ownerEmail}</div>
                      {phone && <div className="text-xs font-mono text-slate-600 dark:text-neutral-400">📞 {phone}</div>}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {phone && (
                          <a
                            href={getWhatsAppLink(clinic)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        )}
                        {phone && (
                          <a
                            href={`tel:${cleanPhone(phone)}`}
                            className="p-1.5 rounded-lg text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-neutral-300 dark:bg-neutral-800 transition-colors"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-neutral-300">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${clinic.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${clinic.status === 'TRIAL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                          ${clinic.status === 'SUSPENDED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                        `}>
                          {clinic.status}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{clinic.subscriptionId?.planId?.name || 'Free Trial'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-neutral-400">
                      <div>{format(new Date(clinic.createdAt), 'MMM d, yyyy')}</div>
                      <div className="text-[11px] text-slate-400">{format(new Date(clinic.createdAt), 'hh:mm a')}</div>
                    </td>
                  </tr>
                );
              })}
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
