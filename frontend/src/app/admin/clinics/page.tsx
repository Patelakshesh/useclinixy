'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllClinics, updateClinicStatus } from '@/features/admin/api/admin';
import { Search, MoreVertical, Ban, CheckCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminClinics() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [clinicToSuspend, setClinicToSuspend] = useState<any>(null);

  const { data: clinics = [], isLoading } = useQuery({
    queryKey: ['adminClinics'],
    queryFn: getAllClinics,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateClinicStatus(id, status),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const filteredClinics = clinics.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Clinics Directory</h2>
          <p className="text-slate-500 dark:text-neutral-400">Manage all tenant clinics on the platform.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search clinics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0A0A0A] border-b border-slate-100 dark:border-neutral-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Clinic & Domain</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Created On</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading clinics...</td>
                </tr>
              ) : filteredClinics.map((clinic: any) => (
                <tr key={clinic._id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      {clinic.name}
                    </div>
                    <a href={`https://useclinixy.vercel.app/booking/${clinic.subdomain}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                      useclinixy.vercel.app/booking/{clinic.subdomain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700 dark:text-neutral-300">{clinic.email}</div>
                    <div className="text-xs text-slate-500 dark:text-neutral-500">{clinic.phone}</div>
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
                  <td className="px-6 py-4 text-right">
                    {clinic.status !== 'SUSPENDED' ? (
                      <button 
                        onClick={() => setClinicToSuspend(clinic)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Suspend
                      </button>
                    ) : (
                      <button 
                        onClick={() => statusMutation.mutate({ id: clinic._id, status: 'ACTIVE' })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && filteredClinics.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-neutral-400">
                    No clinics found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      {clinicToSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-500 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-full">
                <Ban className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Suspend Clinic</h3>
            </div>
            
            <p className="text-slate-600 dark:text-neutral-300 mb-6">
              Are you sure you want to suspend <span className="font-semibold text-slate-900 dark:text-white">{clinicToSuspend.name}</span>? 
              They will instantly lose access to their dashboard, and patients will not be able to book new appointments.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setClinicToSuspend(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  statusMutation.mutate({ id: clinicToSuspend._id, status: 'SUSPENDED' });
                  setClinicToSuspend(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Yes, Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
