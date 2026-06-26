'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllClinics, updateClinicStatus, getAdminPlans, assignManualSubscription, deleteClinic } from '@/features/admin/api/admin';
import { Search, MoreVertical, Ban, CheckCircle, ExternalLink, CreditCard, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminClinics() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [clinicToSuspend, setClinicToSuspend] = useState<any>(null);
  const [clinicToDelete, setClinicToDelete] = useState<any>(null);
  const [clinicToAssign, setClinicToAssign] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');

  const { data: clinics = [], isLoading } = useQuery({
    queryKey: ['adminClinics'],
    queryFn: getAllClinics,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['adminPlans'],
    queryFn: getAdminPlans,
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClinic(id),
    onSuccess: (data) => {
      toast.success(data.message);
      setClinicToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete clinic');
    }
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assignManualSubscription(id, data),
    onSuccess: (data) => {
      toast.success(data.message);
      setClinicToAssign(null);
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign subscription');
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
                    <a href={`https://${clinic.subdomain}.useclinixy.online`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                      {clinic.subdomain}.useclinixy.online
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
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setClinicToAssign(clinic);
                          const currentPlanId = clinic.subscriptionId?.planId || plans.find((p: any) => p.name.toLowerCase().includes('starter'))?._id || plans[0]?._id || '';
                          setSelectedPlanId(currentPlanId);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Assign Plan
                      </button>
                      {clinic.status !== 'SUSPENDED' ? (
                        <button 
                          onClick={() => setClinicToSuspend(clinic)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 rounded-lg transition-colors"
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
                      <button 
                        onClick={() => setClinicToDelete(clinic)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
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
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
              >
                Yes, Suspend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clinicToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-500 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Clinic</h3>
            </div>
            
            <p className="text-slate-600 dark:text-neutral-300 mb-6">
              Are you sure you want to permanently delete <span className="font-semibold text-slate-900 dark:text-white">{clinicToDelete.name}</span>? 
              This will completely remove the clinic and all its associated data (patients, doctors, appointments, etc.) from the platform permanently. This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setClinicToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteMutation.mutate(clinicToDelete._id);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Subscription Modal */}
      {clinicToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-full">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assign Subscription</h3>
            </div>
            
            <p className="text-slate-600 dark:text-neutral-300 mb-4 text-sm">
              Manually assign a subscription plan to <span className="font-semibold text-slate-900 dark:text-white">{clinicToAssign.name}</span>. This will activate their account.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Select Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600"
                >
                  {plans.map((p: any) => (
                    <option key={p._id} value={p._id}>{p.name} (₹{p.price}/{p.interval})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Payment Method Used (Offline)</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-[#1A1A1A] dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="COMPLIMENTARY">Complimentary (Free)</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setClinicToAssign(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                disabled={assignMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={() => assignMutation.mutate({ id: clinicToAssign._id, data: { planId: selectedPlanId, paymentMethod } })}
                disabled={assignMutation.isPending || !selectedPlanId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign Plan & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
