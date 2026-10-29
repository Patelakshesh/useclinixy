'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminFeedbacks, updateFeedbackStatus, deleteFeedback } from '@/features/admin/api/admin';
import { 
  MessageSquareHeart, Star, Sparkles, Lightbulb, Bug, MessageSquare, 
  Search, Filter, CheckCircle2, Clock, Trash2, Phone, Mail, 
  ChevronLeft, ChevronRight, Building2, User, MessageCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  FEATURE_REQUEST: { label: 'Feature Request', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  IMPROVEMENT: { label: 'Improvement', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  BUG: { label: 'Bug Report', icon: Bug, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  GENERAL: { label: 'General', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: 'New', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  IN_REVIEW: { label: 'In Review', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  RESOLVED: { label: 'Implemented / Resolved', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  CLOSED: { label: 'Closed', color: 'text-slate-700 dark:text-neutral-400', bg: 'bg-slate-100 dark:bg-neutral-800' },
};

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminFeedback', page, statusFilter, categoryFilter, searchTerm],
    queryFn: () => getAdminFeedbacks({
      page,
      limit: 15,
      status: statusFilter,
      category: categoryFilter,
      search: searchTerm,
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateFeedbackStatus(id, { status }),
    onSuccess: () => {
      toast.success('Feedback status updated');
      queryClient.invalidateQueries({ queryKey: ['adminFeedback'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFeedback(id),
    onSuccess: () => {
      toast.success('Feedback deleted');
      queryClient.invalidateQueries({ queryKey: ['adminFeedback'] });
    },
    onError: () => toast.error('Failed to delete feedback'),
  });

  const feedbacks = data?.feedbacks || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const kpis = data?.kpis || { totalCount: 0, newCount: 0, featureRequestsCount: 0, avgRating: 5.0 };

  const cleanPhone = (phone: string) => (phone ? phone.replace(/[^0-9]/g, '') : '');

  const getWhatsAppLink = (feedback: any) => {
    const rawPhone = feedback.clinicId?.mobileNumber || feedback.clinicId?.phone;
    const phone = cleanPhone(rawPhone);
    if (!phone) return null;
    const formattedPhone = phone.startsWith('91') || phone.length > 10 ? phone : `91${phone}`;
    const doctorName = feedback.userName || 'Doctor';
    const message = encodeURIComponent(`Hello ${doctorName}, thank you for your feedback on Clinixy regarding "${feedback.category}". We wanted to follow up with you:`);
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareHeart className="w-6 h-6 text-pink-600" />
            Clinic Feedback & Product Ideas
          </h2>
          <p className="text-slate-500 dark:text-neutral-400 text-sm">
            Review feature requests, bug reports, and suggestions submitted by clinics to shape the platform roadmap.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Total Feedbacks</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{kpis.totalCount}</div>
        </div>

        <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Average Rating</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 flex items-baseline gap-1.5">
            <span>{kpis.avgRating}</span>
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">New & Unreviewed</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{kpis.newCount}</div>
        </div>

        <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Feature Requests</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{kpis.featureRequestsCount}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by clinic name, doctor name, email, or keywords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 ml-1" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 text-sm bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="FEATURE_REQUEST">Feature Requests</option>
              <option value="IMPROVEMENT">Improvements</option>
              <option value="BUG">Bug Reports</option>
              <option value="GENERAL">General</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 text-sm bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedbacks List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-neutral-900 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-500 bg-white dark:bg-[#111] rounded-2xl border border-rose-200">
          Failed to load feedbacks. Please try again.
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111] rounded-2xl border border-slate-100 dark:border-neutral-800">
          <MessageSquare className="w-12 h-12 text-slate-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No feedbacks found</h3>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Feedbacks submitted by clinics and doctors will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb: any) => {
            const cat = CATEGORY_CONFIG[fb.category] || CATEGORY_CONFIG.GENERAL;
            const status = STATUS_CONFIG[fb.status] || STATUS_CONFIG.NEW;
            const CatIcon = cat.icon;
            const waLink = getWhatsAppLink(fb);

            return (
              <div
                key={fb._id}
                className="bg-white dark:bg-[#111] p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm hover:border-slate-300 dark:hover:border-neutral-700 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Category badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${cat.bg}`}>
                      <CatIcon className="w-3.5 h-3.5" />
                      {cat.label}
                    </span>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 ml-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= fb.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-neutral-800'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-xs text-slate-400 dark:text-neutral-500">
                      • {format(new Date(fb.createdAt), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      value={fb.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: fb._id, status: e.target.value })}
                      disabled={updateStatusMutation.isPending}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${status.bg} ${status.color}`}
                    >
                      <option value="NEW">New</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>

                    <button
                      onClick={() => {
                        if (confirm('Delete this feedback?')) {
                          deleteMutation.mutate(fb._id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-100 dark:border-neutral-800/80">
                  <p className="text-sm text-slate-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    {fb.message}
                  </p>
                </div>

                {/* Author & Clinic details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-neutral-400 pt-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-neutral-300">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span>{fb.clinicName || fb.clinicId?.name || 'Clinic Account'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{fb.userName}</span>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
                        {fb.userRole}
                      </span>
                    </div>

                    {fb.userEmail && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${fb.userEmail}`} className="hover:text-blue-600 dark:hover:text-blue-400 underline-offset-2 hover:underline">
                          {fb.userEmail}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Reach out button */}
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors self-start sm:self-auto"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      Chat on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-[#111] px-4 py-3 rounded-2xl border border-slate-100 dark:border-neutral-800 text-sm">
          <div className="text-slate-500 dark:text-neutral-400">
            Page {page} of {totalPages} ({total} feedbacks total)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-neutral-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-neutral-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
