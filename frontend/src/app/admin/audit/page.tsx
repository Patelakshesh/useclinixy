'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/features/admin/api/admin';
import { ShieldAlert, Clock, Search, User } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import { AdminPagination } from '@/components/admin/AdminPagination';

export default function AdminAuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: getAuditLogs,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredLogs = useMemo(() => {
    return (logs || []).filter((log: any) => {
      const action = log.action || '';
      const userName = log.userId?.name || '';
      const userEmail = log.userId?.email || '';
      const detailsStr = typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '');

      return (
        action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detailsStr.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [logs, searchTerm]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-600" />
            Audit & Security Logs
          </h2>
          <p className="text-slate-500 dark:text-neutral-400 text-sm">
            System-wide security tracking, status updates, and administrative activities.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by action, user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0A0A0A] border-b border-slate-100 dark:border-neutral-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">User / Initiator</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Action Taken</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-neutral-400">Loading audit logs...</td>
                </tr>
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {log.userId?.name || 'System / Automated'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400">{log.userId?.email || 'System'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold font-mono bg-slate-100 text-slate-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-neutral-400 max-w-sm truncate">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-slate-50 dark:bg-neutral-900 text-slate-400 rounded-full flex items-center justify-center mb-3">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 dark:text-neutral-400">No audit logs found matching your filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredLogs.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 15, 25, 50]}
          />
        )}
      </div>
    </div>
  );
}
