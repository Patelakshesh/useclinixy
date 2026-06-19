'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/features/admin/api/admin';
import { ShieldAlert, Download, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAuditLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: getAuditLogs,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h2>
           <p className="text-slate-500 dark:text-neutral-400">System-wide security and activity monitoring.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0A0A0A]">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-neutral-400">Loading audit logs...</td>
                </tr>
              ) : logs?.length > 0 ? (
                logs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{log.userId?.name || 'System'}</div>
                      <div className="text-xs text-slate-500">{log.userId?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 dark:bg-neutral-800 dark:text-neutral-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-neutral-400 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-slate-50 dark:bg-neutral-900 text-slate-400 rounded-full flex items-center justify-center mb-3">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 dark:text-neutral-400">No audit logs recorded yet.</p>
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
