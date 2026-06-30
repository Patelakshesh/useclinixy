'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminPlans, createAdminPlan, updateAdminPlan, deleteAdminPlan } from '@/features/admin/api/admin';
import { Plus, Pencil, Trash2, Check, X, Loader2, Users, UserCheck, MessageSquare, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultForm = {
  name: '', price: 0, discountPrice: 0, currency: 'INR', interval: 'MONTHLY', intervalCount: 1, priceId: 'plan_manual',
  isActive: true,
  isDefault: false,
  features: { maxDoctors: 1, maxPatients: 100, hasWhatsApp: false, hasOnlineBooking: false, hasGoogleMapsSetup: false },
};

export default function AdminPlansPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery({ queryKey: ['adminPlans'], queryFn: getAdminPlans });

  const createMut = useMutation({
    mutationFn: createAdminPlan,
    onSuccess: () => { toast.success('Plan created!'); queryClient.invalidateQueries({ queryKey: ['adminPlans'] }); resetForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create plan'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAdminPlan(id, data),
    onSuccess: () => { toast.success('Plan updated!'); queryClient.invalidateQueries({ queryKey: ['adminPlans'] }); resetForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update plan'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAdminPlan,
    onSuccess: () => { toast.success('Plan deleted!'); queryClient.invalidateQueries({ queryKey: ['adminPlans'] }); setDeleteConfirm(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete plan'),
  });

  const resetForm = () => { setShowForm(false); setEditingPlan(null); setForm(defaultForm); };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setForm({ name: plan.name, price: plan.price, discountPrice: plan.discountPrice || 0, currency: plan.currency, interval: plan.interval, intervalCount: plan.intervalCount || 1, priceId: plan.priceId, isActive: plan.isActive, isDefault: plan.isDefault || false, features: { ...plan.features, hasGoogleMapsSetup: plan.features.hasGoogleMapsSetup || false } });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) { updateMut.mutate({ id: editingPlan._id, data: form }); }
    else { createMut.mutate(form); }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription Plans</h2>
          <p className="text-slate-500 dark:text-neutral-400">Create and manage pricing tiers for your SaaS.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> New Plan
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Plan Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g. Starter, Growth, Enterprise" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Price (₹) *</label>
                <input required type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Discount Offer Price (₹)</label>
                <input type="number" min={0} value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                  placeholder="Leave 0 if no discount" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Duration Value (e.g. 14, 1, 3)</label>
                <input type="number" min={1} value={form.intervalCount} onChange={e => setForm({ ...form, intervalCount: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Duration Type</label>
                <select value={form.interval} onChange={e => setForm({ ...form, interval: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="MINUTES">Minutes</option>
                  <option value="HOURLY">Hours</option>
                  <option value="DAILY">Days</option>
                  <option value="WEEKLY">Weeks</option>
                  <option value="MONTHLY">Months</option>
                  <option value="YEARLY">Years</option>
                  <option value="3_YEARS">Fixed 3 Years</option>
                  <option value="LIFETIME">Lifetime</option>
                </select>
              </div>
              <div>
                <label className="flex justify-between items-center text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                  Max Doctors
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-normal text-blue-600 dark:text-blue-400">
                    <input type="checkbox" checked={form.features.maxDoctors === 999} onChange={(e) => setForm({ ...form, features: { ...form.features, maxDoctors: e.target.checked ? 999 : 1 } })} className="w-3 h-3 rounded accent-blue-600" />
                    Unlimited
                  </label>
                </label>
                <input type="number" min={1} disabled={form.features.maxDoctors === 999} value={form.features.maxDoctors === 999 ? '' : (form.features.maxDoctors ?? '')} onChange={e => setForm({ ...form, features: { ...form.features, maxDoctors: e.target.value === '' ? '' as any : parseInt(e.target.value) } })}
                  placeholder={form.features.maxDoctors === 999 ? 'Unlimited' : ''}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50" />
              </div>
              <div>
                <label className="flex justify-between items-center text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                  Max Patients
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-normal text-blue-600 dark:text-blue-400">
                    <input type="checkbox" checked={form.features.maxPatients >= 999999} onChange={(e) => setForm({ ...form, features: { ...form.features, maxPatients: e.target.checked ? 999999 : 100 } })} className="w-3 h-3 rounded accent-blue-600" />
                    Unlimited
                  </label>
                </label>
                <input type="number" min={1} disabled={form.features.maxPatients >= 999999} value={form.features.maxPatients >= 999999 ? '' : (form.features.maxPatients ?? '')} onChange={e => setForm({ ...form, features: { ...form.features, maxPatients: e.target.value === '' ? '' as any : parseInt(e.target.value) } })}
                  placeholder={form.features.maxPatients >= 999999 ? 'Unlimited' : ''}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Razorpay Price ID</label>
                <input value={form.priceId} onChange={e => setForm({ ...form, priceId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="plan_xxxxxxxx" />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.features.hasWhatsApp} onChange={e => setForm({ ...form, features: { ...form.features, hasWhatsApp: e.target.checked } })}
                  className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm text-slate-700 dark:text-neutral-300 font-medium flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-green-500" /> WhatsApp Notifications</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.features.hasOnlineBooking} onChange={e => setForm({ ...form, features: { ...form.features, hasOnlineBooking: e.target.checked } })}
                  className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm text-slate-700 dark:text-neutral-300 font-medium flex items-center gap-1.5"><Globe className="w-4 h-4 text-blue-500" /> Public Booking Portal</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.features.hasGoogleMapsSetup} onChange={e => setForm({ ...form, features: { ...form.features, hasGoogleMapsSetup: e.target.checked } })}
                  className="w-4 h-4 rounded accent-indigo-600" />
                <span className="text-sm text-slate-700 dark:text-neutral-300 font-medium flex items-center gap-1.5"><Globe className="w-4 h-4 text-indigo-500" /> Google Maps Setup</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm text-slate-700 dark:text-neutral-300 font-medium">Plan is Active</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded accent-purple-600" />
                <span className="text-sm text-slate-700 dark:text-neutral-300 font-medium text-purple-600 dark:text-purple-400">Default Registration Plan</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingPlan ? 'Save Changes' : 'Create Plan'}
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2.5 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-neutral-900 rounded-2xl animate-pulse" />)}
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: any) => (
            <div key={plan._id} className={`relative bg-white dark:bg-[#111] rounded-2xl border-2 shadow-sm p-6 flex flex-col ${plan.isDefault ? 'border-purple-500 shadow-purple-500/10' : plan.isActive ? 'border-slate-100 dark:border-neutral-800' : 'border-dashed border-slate-200 dark:border-neutral-700 opacity-60'}`}>
              {!plan.isActive && <span className="absolute top-3 right-3 text-xs bg-slate-100 dark:bg-neutral-800 text-slate-500 px-2 py-0.5 rounded-full">Inactive</span>}
              {plan.isDefault && <span className="absolute top-3 right-3 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-semibold border border-purple-200 dark:border-purple-800/50">Default Plan</span>}
              
              <div className="mb-4 mt-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="flex flex-col mt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      ₹{(plan.discountPrice && plan.discountPrice > 0 ? plan.discountPrice : plan.price).toLocaleString()}
                    </span>
                    {plan.discountPrice > 0 && (
                      <span className="text-sm text-slate-400 line-through">₹{plan.price.toLocaleString()}</span>
                    )}
                  </div>
                  <span className="text-slate-500 text-sm">
                    {plan.interval === 'LIFETIME' ? 'Lifetime' : `per ${plan.intervalCount > 1 ? plan.intervalCount + ' ' : ''}${plan.interval.replace('_', ' ').toLowerCase()}`}
                  </span>
                </div>
              </div>

              <ul className="flex-1 space-y-2 text-sm text-slate-600 dark:text-neutral-400 mb-6">
                <li className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500 shrink-0" /> {plan.features.maxDoctors === 999 ? 'Unlimited' : (plan.features.maxDoctors || 0)} Doctors</li>
                <li className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-purple-500 shrink-0" /> {plan.features.maxPatients >= 999999 ? 'Unlimited' : (plan.features.maxPatients || 0).toLocaleString()} Patients</li>
                <li className={`flex items-center gap-2 ${plan.features.hasWhatsApp ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-neutral-600 line-through'}`}>
                  <MessageSquare className="w-4 h-4 shrink-0" /> WhatsApp Notifications
                </li>
                <li className={`flex items-center gap-2 ${plan.features.hasOnlineBooking ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-neutral-600 line-through'}`}>
                  {plan.features.hasOnlineBooking ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} Public Booking Portal
                </li>
                <li className={`flex items-center gap-2 ${plan.features.hasGoogleMapsSetup ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-neutral-600 line-through'}`}>
                  {plan.features.hasGoogleMapsSetup ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} Google Maps Setup
                </li>
              </ul>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(plan)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 dark:border-neutral-800 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                {deleteConfirm === plan._id ? (
                  <div className="flex gap-1">
                    <button onClick={() => deleteMut.mutate(plan._id)} disabled={deleteMut.isPending}
                      className="px-3 py-2 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 disabled:opacity-60">
                      {deleteMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Confirm
                    </button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-3 py-2 text-xs font-medium border border-slate-200 dark:border-neutral-700 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-400 transition-colors">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(plan._id)} className="px-3 py-2 text-sm font-medium border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-100 dark:border-neutral-800 p-16 text-center">
          <p className="text-slate-500 dark:text-neutral-400">No plans created yet. Click "New Plan" to get started.</p>
        </div>
      )}
    </div>
  );
}
