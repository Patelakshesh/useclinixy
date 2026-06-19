'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllSubscriptions } from '@/features/admin/api/admin';
import { CreditCard, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSubscriptions() {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: getAllSubscriptions,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Subscriptions</h2>
           <p className="text-slate-500 dark:text-neutral-400">Manage all clinic billing and active plans.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0A0A0A]">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Clinic</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Plan Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Period Start</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Period End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-neutral-400">Loading subscriptions...</td>
                </tr>
              ) : subscriptions?.length > 0 ? (
                subscriptions.map((sub: any) => (
                  <tr key={sub._id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{sub.clinicId?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{sub.clinicId?.subdomain || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{sub.planId?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500">${sub.planId?.price || 0} / {sub.planId?.interval?.toLowerCase() || 'month'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${sub.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                        ${sub.status === 'PAST_DUE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                      `}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-neutral-400">
                      {sub.currentPeriodStart ? format(new Date(sub.currentPeriodStart), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-neutral-400">
                      {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'MMM d, yyyy') : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-slate-50 dark:bg-neutral-900 text-slate-400 rounded-full flex items-center justify-center mb-3">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 dark:text-neutral-400">No active subscriptions found.</p>
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
