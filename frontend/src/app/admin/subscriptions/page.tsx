'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllSubscriptions } from '@/features/admin/api/admin';
import { CreditCard, Search, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import { AdminPagination } from '@/components/admin/AdminPagination';

export default function AdminSubscriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: getAllSubscriptions,
  });

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredSubscriptions = useMemo(() => {
    return (subscriptions || []).filter((sub: any) => {
      const clinicName = sub.clinicId?.name || '';
      const subdomain = sub.clinicId?.subdomain || '';
      const planName = sub.planId?.name || '';

      const matchesSearch =
        clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter !== 'ALL' && sub.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [subscriptions, searchTerm, statusFilter]);

  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSubscriptions.slice(startIndex, startIndex + pageSize);
  }, [filteredSubscriptions, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Subscriptions & Billing
          </h2>
          <p className="text-slate-500 dark:text-neutral-400 text-sm">
            Manage all clinic billing records, active plans, and subscription periods.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by clinic, plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'ACTIVE', 'CANCELLED', 'PAST_DUE', 'EXPIRED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111] text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-neutral-800 hover:border-slate-300'
            }`}
          >
            {tab === 'ALL' ? 'All Subscriptions' : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0A0A0A] border-b border-slate-100 dark:border-neutral-800">
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
              ) : paginatedSubscriptions.length > 0 ? (
                paginatedSubscriptions.map((sub: any) => (
                  <tr key={sub._id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{sub.clinicId?.name || 'Unknown Clinic'}</div>
                      {sub.clinicId?.subdomain && (
                        <a 
                          href={`https://${sub.clinicId.subdomain}.useclinixy.online`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {sub.clinicId.subdomain}.useclinixy.online
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{sub.planId?.name || 'Custom Plan'}</div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400">
                        ₹{(sub.planId?.price || 0).toLocaleString()} / {sub.planId?.interval?.toLowerCase() || 'month'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${sub.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                        ${sub.status === 'PAST_DUE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                        ${sub.status === 'EXPIRED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                      `}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-neutral-400">
                      {sub.currentPeriodStart ? format(new Date(sub.currentPeriodStart), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-neutral-400">
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
                    <p className="text-slate-500 dark:text-neutral-400">No subscriptions found matching your filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredSubscriptions.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalItems={filteredSubscriptions.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}
      </div>
    </div>
  );
}
