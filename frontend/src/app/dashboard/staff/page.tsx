'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStaff, createStaff, updateStaff, deleteStaff } from '@/features/staff/api/staff';
import { getDoctors } from '@/features/doctors/api/doctors';
import { Users, UserPlus, Trash2, Mail, Shield, User, Loader2, Key, Edit2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function StaffPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'RECEPTIONIST', doctorId: '', status: 'ACTIVE' });

  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery({ 
    queryKey: ['staff'], 
    queryFn: getStaff 
  });

  const { data: doctorsData } = useQuery({ 
    queryKey: ['doctors', '', 1], 
    queryFn: () => getDoctors('', 1, 100),
    enabled: showForm
  });

  const addMut = useMutation({
    mutationFn: createStaff,
    onSuccess: (res) => {
      toast.success(res.message || 'Staff created successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      closeForm();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add staff')
  });

  const updateMut = useMutation({
    mutationFn: (data: {id: string, payload: any}) => updateStaff(data.id, data.payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Staff updated successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      closeForm();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update staff')
  });

  const deleteMut = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success('Staff deleted');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setDeleteId(null);
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Failed to delete staff');
      setDeleteId(null);
    }
  });

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', email: '', password: '', role: 'RECEPTIONIST', doctorId: '', status: 'ACTIVE' });
  };

  const handleEdit = (staff: any) => {
    setForm({
      name: staff.name,
      email: staff.email,
      password: '', // Don't populate password on edit
      role: staff.role,
      doctorId: staff.doctorId?._id || '',
      status: staff.status
    });
    setEditingId(staff._id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.role === 'DOCTOR' && !form.doctorId) {
      toast.error('Please select a doctor profile to link to this account');
      return;
    }
    
    if (editingId) {
      updateMut.mutate({ id: editingId, payload: form });
    } else {
      addMut.mutate(form);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Management</h2>
          <p className="text-slate-500 dark:text-neutral-400">Manage access and roles for your clinic staff.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" /> Add Staff
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {editingId ? 'Edit Staff Account' : 'Create New Staff Account'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Full Name</label>
                <input required disabled={!!editingId || form.role === 'DOCTOR'} value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm ${!!editingId || form.role === 'DOCTOR' ? 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white'}`} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Email Address</label>
                <input required type="email" disabled={!!editingId || form.role === 'DOCTOR'} value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={`w-full px-3 py-2 rounded-lg text-sm border ${!!editingId || form.role === 'DOCTOR' ? 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white'}`} placeholder="john@clinic.com" />
                {editingId && <p className="text-[10px] text-slate-500 mt-1">Email cannot be changed.</p>}
                {!editingId && form.role === 'DOCTOR' && <p className="text-[10px] text-slate-500 mt-1">Auto-filled from Doctor profile.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Role</label>
                <select value={form.role} onChange={e => {
                  const role = e.target.value;
                  if (role !== 'DOCTOR') {
                    setForm({...form, role, doctorId: '', name: '', email: ''});
                  } else {
                    setForm({...form, role});
                  }
                }} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm dark:text-white">
                  <option value="RECEPTIONIST">Receptionist (Front Desk)</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="CLINIC_ADMIN">Clinic Admin (Full Access)</option>
                </select>
              </div>
              {form.role === 'DOCTOR' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Link to Doctor Profile</label>
                  <select required value={form.doctorId} onChange={e => {
                    const docId = e.target.value;
                    const doc = doctorsData?.data?.find((d: any) => d._id === docId);
                    if (doc && !editingId) {
                      setForm({...form, doctorId: docId, name: doc.name, email: doc.email});
                    } else {
                      setForm({...form, doctorId: docId});
                    }
                  }} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm dark:text-white">
                    <option value="">Select a doctor...</option>
                    {doctorsData?.data?.map((d: any) => (
                      <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">This links their login to their appointment schedule.</p>
                </div>
              )}
              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm dark:text-white">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive (Suspended)</option>
                  </select>
                </div>
              )}
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Initial Password</label>
                  <input required type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm dark:text-white" placeholder="Secret@123" minLength={6} />
                </div>
              )}
            </div>

            {!editingId && (
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg flex items-start gap-2 text-sm mt-4">
                <Key className="w-4 h-4 mt-0.5 shrink-0" />
                <p>The staff member will use this password to log in. They can change it later in their settings.</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={addMut.isPending || updateMut.isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                {(addMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : null} 
                {editingId ? 'Save Changes' : 'Create Account'}
              </button>
              <button type="button" onClick={closeForm} className="px-4 py-2 border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 rounded-lg text-sm font-medium text-slate-700 dark:text-neutral-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#0A0A0A] border-b border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created On</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
            {isLoadingStaff ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading staff...</td></tr>
            ) : staffList.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No staff members found.</td></tr>
            ) : (
              staffList.map((staff: any) => (
                <tr key={staff._id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-600 dark:text-neutral-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{staff.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{staff.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border
                      ${staff.role === 'CLINIC_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50' : ''}
                      ${staff.role === 'DOCTOR' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' : ''}
                      ${staff.role === 'RECEPTIONIST' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50' : ''}
                    `}>
                      <Shield className="w-3 h-3" />
                      {staff.role.replace('_', ' ')}
                    </span>
                    {staff.doctorId && <div className="text-xs text-slate-500 mt-1">Linked: Dr. {staff.doctorId.name}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${staff.status === 'ACTIVE' ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' : 'text-slate-600 bg-slate-50'}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-neutral-400">
                    {format(new Date(staff.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(staff)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Staff"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteId(staff._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove Staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Staff Account?</h3>
            </div>
            <p className="text-slate-500 dark:text-neutral-400 mb-6">
              Are you sure you want to permanently remove this staff member? They will instantly lose all access to the clinic dashboard. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-900"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteMut.mutate(deleteId)}
                disabled={deleteMut.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
