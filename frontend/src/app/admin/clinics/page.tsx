'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllClinics, updateClinicStatus, getAdminPlans, assignManualSubscription, deleteClinic } from '@/features/admin/api/admin';
import { 
  Search, Ban, CheckCircle, ExternalLink, CreditCard, Trash2, 
  Phone, Mail, MessageCircle, User, Clock, MapPin, Eye, X, Building2, Sparkles, AlertTriangle
} from 'lucide-react';
import { format, differenceInDays, isAfter } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminPagination } from '@/components/admin/AdminPagination';

export default function AdminClinics() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'TRIAL' | 'EXPIRING' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  
  // Modals
  const [selectedClinicDetails, setSelectedClinicDetails] = useState<any>(null);
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

  // Calculate helpers for a clinic
  const getTrialInfo = (clinic: any) => {
    const sub = clinic.subscriptionId;
    if (!sub || !sub.currentPeriodEnd) {
      return { isTrial: clinic.status === 'TRIAL', daysLeft: null, expired: false };
    }
    const endDate = new Date(sub.currentPeriodEnd);
    const now = new Date();
    const daysLeft = differenceInDays(endDate, now);
    const expired = !isAfter(endDate, now);
    return {
      isTrial: clinic.status === 'TRIAL' || sub.planId?.name?.toLowerCase().includes('trial') || sub.razorpaySubscriptionId === 'manual_default_plan',
      daysLeft: Math.max(0, daysLeft),
      endDate,
      expired
    };
  };

  const isRecentSignup = (createdAt: string) => {
    const diff = differenceInDays(new Date(), new Date(createdAt));
    return diff <= 7;
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = clinics.length;
    const newSignups = clinics.filter((c: any) => isRecentSignup(c.createdAt)).length;
    const trials = clinics.filter((c: any) => c.status === 'TRIAL' || getTrialInfo(c).isTrial).length;
    const expiringSoon = clinics.filter((c: any) => {
      const info = getTrialInfo(c);
      return info.isTrial && info.daysLeft !== null && info.daysLeft <= 3 && !info.expired;
    }).length;
    const active = clinics.filter((c: any) => c.status === 'ACTIVE').length;
    const suspended = clinics.filter((c: any) => c.status === 'SUSPENDED').length;

    return { total, newSignups, trials, expiringSoon, active, suspended };
  }, [clinics]);

  // Filtered clinics
  const filteredClinics = useMemo(() => {
    return clinics.filter((c: any) => {
      const matchesSearch = 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.subdomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobileNumber?.includes(searchTerm) ||
        c.phone?.includes(searchTerm) ||
        c.ownerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      const trialInfo = getTrialInfo(c);

      switch (activeTab) {
        case 'NEW':
          return isRecentSignup(c.createdAt);
        case 'TRIAL':
          return c.status === 'TRIAL' || trialInfo.isTrial;
        case 'EXPIRING':
          return trialInfo.isTrial && trialInfo.daysLeft !== null && trialInfo.daysLeft <= 3 && !trialInfo.expired;
        case 'ACTIVE':
          return c.status === 'ACTIVE';
        case 'SUSPENDED':
          return c.status === 'SUSPENDED';
        default:
          return true;
      }
    });
  }, [clinics, searchTerm, activeTab]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to first page when search or tab filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const paginatedClinics = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredClinics.slice(startIndex, startIndex + pageSize);
  }, [filteredClinics, currentPage, pageSize]);

  const cleanPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  const getWhatsAppLink = (clinic: any) => {
    const phone = cleanPhone(clinic.mobileNumber || clinic.phone);
    if (!phone) return '#';
    const formattedPhone = phone.startsWith('91') || phone.length > 10 ? phone : `91${phone}`;
    const doctorName = clinic.ownerId?.name ? `Dr. ${clinic.ownerId.name}` : (clinic.name || 'Doctor');
    const message = encodeURIComponent(`Hello ${doctorName}, thank you for registering ${clinic.name} on Clinixy! We're here to help you get started with your clinic setup. Do you have any questions or would you like a quick walkthrough?`);
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Clinics & Registered Leads
          </h2>
          <p className="text-slate-500 dark:text-neutral-400 text-sm">
            View all registered clinics, doctor contact details, trial status, and reach out directly.
          </p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by doctor, clinic, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'ALL' ? 'bg-blue-50/50 border-blue-500 shadow-sm dark:bg-blue-950/20' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-neutral-800 hover:border-slate-300'}`}
        >
          <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase">Total Clinics</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.total}</div>
        </button>

        <button
          onClick={() => setActiveTab('NEW')}
          className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'NEW' ? 'bg-emerald-50/50 border-emerald-500 shadow-sm dark:bg-emerald-950/20' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-neutral-800 hover:border-slate-300'}`}
        >
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> New (7 Days)
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{metrics.newSignups}</div>
        </button>

        <button
          onClick={() => setActiveTab('TRIAL')}
          className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'TRIAL' ? 'bg-blue-50/50 border-blue-500 shadow-sm dark:bg-blue-950/20' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-neutral-800 hover:border-slate-300'}`}
        >
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">On Trial</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{metrics.trials}</div>
        </button>

        <button
          onClick={() => setActiveTab('EXPIRING')}
          className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'EXPIRING' ? 'bg-amber-50/50 border-amber-500 shadow-sm dark:bg-amber-950/20' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-neutral-800 hover:border-slate-300'}`}
        >
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Expiring Soon
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{metrics.expiringSoon}</div>
        </button>

        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'ACTIVE' ? 'bg-green-50/50 border-green-500 shadow-sm dark:bg-green-950/20' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-neutral-800 hover:border-slate-300'}`}
        >
          <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">Active Paid</div>
          <div className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">{metrics.active}</div>
        </button>

        <button
          onClick={() => setActiveTab('SUSPENDED')}
          className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'SUSPENDED' ? 'bg-red-50/50 border-red-500 shadow-sm dark:bg-red-950/20' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-neutral-800 hover:border-slate-300'}`}
        >
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Suspended</div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{metrics.suspended}</div>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0A0A0A] border-b border-slate-100 dark:border-neutral-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Clinic & Domain</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Doctor / Owner</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Quick Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Plan & Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading clinics directory...</td>
                </tr>
              ) : paginatedClinics.map((clinic: any) => {
                const trial = getTrialInfo(clinic);
                const isNew = isRecentSignup(clinic.createdAt);
                const phone = clinic.mobileNumber || clinic.phone;
                const ownerName = clinic.ownerId?.name || 'Doctor';
                const ownerEmail = clinic.email || clinic.ownerId?.email;

                return (
                  <tr key={clinic._id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/50 transition-colors group">
                    {/* Clinic & Domain */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {clinic.name}
                        {isNew && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <a 
                        href={`https://${clinic.subdomain}.useclinixy.online`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {clinic.subdomain}.useclinixy.online
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {clinic.address && (
                        <p className="text-xs text-slate-400 dark:text-neutral-500 truncate max-w-xs mt-1">
                          📍 {clinic.address}
                        </p>
                      )}
                    </td>

                    {/* Doctor / Owner */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {ownerName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                        {ownerEmail}
                      </div>
                      {phone && (
                        <div className="text-xs font-mono text-slate-600 dark:text-neutral-300 mt-0.5">
                          📞 {phone}
                        </div>
                      )}
                    </td>

                    {/* Direct 1-Click Contact Buttons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {phone && (
                          <a
                            href={getWhatsAppLink(clinic)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        )}
                        {phone && (
                          <a
                            href={`tel:${cleanPhone(phone)}`}
                            className="p-1.5 rounded-lg text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-neutral-300 dark:bg-neutral-800 transition-colors"
                            title="Call Phone"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {ownerEmail && (
                          <a
                            href={`mailto:${ownerEmail}?subject=Welcome to Clinixy - ${clinic.name}`}
                            className="p-1.5 rounded-lg text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Plan & Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${clinic.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${clinic.status === 'TRIAL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                          ${clinic.status === 'SUSPENDED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                        `}>
                          {clinic.status}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                          {clinic.subscriptionId?.planId?.name || 'Default Plan'}
                        </span>
                      </div>
                      {trial.isTrial && trial.daysLeft !== null && (
                        <div className="text-xs mt-1">
                          {trial.expired ? (
                            <span className="text-red-500 font-semibold">⚠️ Trial Expired</span>
                          ) : trial.daysLeft <= 3 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              ⏰ {trial.daysLeft} {trial.daysLeft === 1 ? 'day' : 'days'} left
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-neutral-400">
                              {trial.daysLeft} days trial left
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Registered Date */}
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-neutral-400">
                      <div>{format(new Date(clinic.createdAt), 'MMM d, yyyy')}</div>
                      <div className="text-[11px] text-slate-400">{format(new Date(clinic.createdAt), 'hh:mm a')}</div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedClinicDetails(clinic)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>

                        <button
                          onClick={() => {
                            setClinicToAssign(clinic);
                            const currentPlanId = clinic.subscriptionId?.planId?._id || clinic.subscriptionId?.planId || plans[0]?._id || '';
                            setSelectedPlanId(currentPlanId);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg transition-colors"
                          title="Assign Subscription Plan"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Plan
                        </button>

                        {clinic.status !== 'SUSPENDED' ? (
                          <button 
                            onClick={() => setClinicToSuspend(clinic)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 rounded-lg transition-colors"
                            title="Suspend Clinic"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => statusMutation.mutate({ id: clinic._id, status: 'ACTIVE' })}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 rounded-lg transition-colors"
                            title="Reactivate Clinic"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button 
                          onClick={() => setClinicToDelete(clinic)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg transition-colors"
                          title="Delete Clinic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!isLoading && filteredClinics.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-neutral-400">
                    No clinics found matching your current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && filteredClinics.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalItems={filteredClinics.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: Full Clinic Registration Details
      ───────────────────────────────────────────────────────────────────────────── */}
      {selectedClinicDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">Clinic Profile & Registration Lead</span>
                <h3 className="text-xl font-bold">{selectedClinicDetails.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedClinicDetails(null)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Doctor / Owner Card */}
              <div className="bg-slate-50 dark:bg-[#181818] p-5 rounded-2xl border border-slate-200/60 dark:border-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" /> Doctor / Owner Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs">Full Name:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedClinicDetails.ownerId?.name || 'Doctor (Clinic Owner)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Email Address:</span>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      <a href={`mailto:${selectedClinicDetails.email}`} className="hover:underline">
                        {selectedClinicDetails.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Phone / WhatsApp:</span>
                    <p className="font-semibold text-slate-900 dark:text-white font-mono">
                      {selectedClinicDetails.mobileNumber || selectedClinicDetails.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Registration Date:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {format(new Date(selectedClinicDetails.createdAt), 'MMMM d, yyyy (hh:mm a)')}
                    </p>
                  </div>
                </div>

                {/* Direct Action Bar */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-neutral-700 flex flex-wrap gap-2">
                  <a
                    href={getWhatsAppLink(selectedClinicDetails)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </a>
                  <a
                    href={`tel:${cleanPhone(selectedClinicDetails.mobileNumber || selectedClinicDetails.phone)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all"
                  >
                    <Phone className="w-4 h-4" /> Call Phone
                  </a>
                  <a
                    href={`mailto:${selectedClinicDetails.email}?subject=Welcome to Clinixy`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition-all"
                  >
                    <Mail className="w-4 h-4" /> Send Email
                  </a>
                </div>
              </div>

              {/* Clinic Information */}
              <div className="bg-slate-50 dark:bg-[#181818] p-5 rounded-2xl border border-slate-200/60 dark:border-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 mb-3 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" /> Clinic Setup Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs">Subdomain Booking Portal:</span>
                    <p className="mt-0.5">
                      <a 
                        href={`https://${selectedClinicDetails.subdomain}.useclinixy.online`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs"
                      >
                        {selectedClinicDetails.subdomain}.useclinixy.online
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Account Status:</span>
                    <p className="mt-0.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                        ${selectedClinicDetails.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                        ${selectedClinicDetails.status === 'TRIAL' ? 'bg-blue-100 text-blue-800' : ''}
                        ${selectedClinicDetails.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {selectedClinicDetails.status}
                      </span>
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 text-xs">Physical Address:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedClinicDetails.address || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription & Trial Details */}
              <div className="bg-slate-50 dark:bg-[#181818] p-5 rounded-2xl border border-slate-200/60 dark:border-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" /> Plan & Trial Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs">Assigned Plan:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedClinicDetails.subscriptionId?.planId?.name || '14-Day Free Trial'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Current Period End:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedClinicDetails.subscriptionId?.currentPeriodEnd ? 
                        format(new Date(selectedClinicDetails.subscriptionId.currentPeriodEnd), 'MMM d, yyyy') : 
                        'Active'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Days Remaining:</span>
                    <p className="font-semibold">
                      {(() => {
                        const trial = getTrialInfo(selectedClinicDetails);
                        if (trial.expired) return <span className="text-red-500 font-bold">Expired</span>;
                        if (trial.daysLeft !== null) {
                          return <span className={trial.daysLeft <= 3 ? 'text-amber-500 font-bold' : 'text-emerald-600 font-bold'}>{trial.daysLeft} days remaining</span>;
                        }
                        return <span className="text-slate-600">Active</span>;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0A0A0A] border-t border-slate-100 dark:border-neutral-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setClinicToAssign(selectedClinicDetails);
                  setSelectedClinicDetails(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" /> Change / Assign Plan
              </button>
              <button
                onClick={() => setSelectedClinicDetails(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-neutral-300 bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
