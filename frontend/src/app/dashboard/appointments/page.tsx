'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAppointments, createAppointment, updateAppointmentStatus, updateAppointment } from '@/features/appointments/api/appointments';
import { DataTable } from '@/components/shared/DataTable';
import { SlideOver } from '@/components/shared/SlideOver';
import { AppointmentForm } from '@/features/appointments/components/AppointmentForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/features/auth/api/auth';
import toast from 'react-hot-toast';

export default function AppointmentsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  // Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });
  const isDoctor = user?.role === 'DOCTOR';

  const fetchAppointments = useCallback(async (page = 1, currentLimit = limit) => {
    setLoading(true);
    try {
       const res = await getAppointments(search, page, currentLimit);
       setData(res.data);
       setPagination(res.pagination);
    } catch (err) {
       console.error(err);
       toast.error('Failed to load appointments');
    } finally {
       setLoading(false);
    }
  }, [search, limit]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchAppointments(1, limit); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, limit, fetchAppointments]);

  const handleCreateOrUpdate = async (formData: any) => {
    setFormLoading(true);
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment._id, formData);
        toast.success('Appointment updated successfully');
      } else {
        await createAppointment(formData);
        toast.success('Appointment booked successfully');
      }
      setIsDrawerOpen(false);
      setEditingAppointment(null);
      fetchAppointments(1);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to save appointment';
      toast.error(errMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (app: any) => {
    setEditingAppointment({
      ...app,
      doctorId: app.doctorId?._id,
      patientId: app.patientId?._id
    });
    setIsDrawerOpen(true);
  };

  const handleCancelClick = (id: string) => {
    setAppointmentToCancel(id);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    try {
       await updateAppointmentStatus(appointmentToCancel, 'CANCELLED');
       setData((prev: any) => prev.map((app: any) => app._id === appointmentToCancel ? { ...app, status: 'CANCELLED' } : app));
       toast.success(`Appointment Cancelled`);
       setIsCancelModalOpen(false);
    } catch (err) {
       console.error('Failed to cancel', err);
       toast.error('Failed to cancel appointment');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
     try {
        await updateAppointmentStatus(id, newStatus);
        setData((prev: any) => prev.map((app: any) => app._id === id ? { ...app, status: newStatus } : app));
        toast.success(`Status updated to ${newStatus}`);
     } catch (err) {
        console.error('Failed to update status', err);
        toast.error('Failed to update status');
     }
  };

  const getStatusColor = (status: string) => {
     switch(status) {
        case 'CONFIRMED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        default: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
     }
  };

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        <DataTable 
          title="Appointments"
          columns={isDoctor ? ['Date & Time', 'Patient', 'Status'] : ['Date & Time', 'Patient', 'Doctor', 'Status', 'Actions']}
          data={data}
          loading={loading}
          onSearch={setSearch}
          onAddClick={isDoctor ? undefined : () => { setEditingAppointment(null); setIsDrawerOpen(true); }}
          addButtonLabel={isDoctor ? undefined : "Book Appointment"}
          pagination={pagination}
          onPageChange={(page) => fetchAppointments(page, limit)}
          onLimitChange={(newLimit) => setLimit(newLimit)}
          renderRow={(app) => (
            <>
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                <div className="flex flex-col">
                   <span>{new Date(app.appointmentDate).toLocaleDateString()}</span>
                   <span className="text-slate-500 text-xs">{app.appointmentTime}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                 <div className="font-medium text-slate-900 dark:text-white">{app.patientId?.name || 'Unknown'}</div>
                 <div className="text-xs text-slate-500">{app.patientId?.mobileNumber}</div>
              </td>
              {!isDoctor && (
                <td className="px-6 py-4">
                   <div className="font-medium text-slate-900 dark:text-white">{app.doctorId?.name || 'Unknown'}</div>
                   <div className="text-xs text-slate-500">{app.doctorId?.specialization}</div>
                </td>
              )}
              <td className="px-6 py-4">
                 <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                 </span>
              </td>
              {!isDoctor && (
                <td className="px-6 py-4 flex items-center gap-2">
                   <select 
                      className="text-sm border border-slate-200 rounded p-1 dark:bg-black dark:border-neutral-800 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors"
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                   >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                   </select>
                   <button onClick={() => handleEditClick(app)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium ml-2 transition-colors">Edit</button>
                   {app.status !== 'CANCELLED' && (
                     <button onClick={() => handleCancelClick(app._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors">Cancel</button>
                   )}
                </td>
              )}
            </>
          )}
        />
      </div>

      <SlideOver isOpen={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); setEditingAppointment(null); }} title={editingAppointment ? "Edit Appointment" : "Book Appointment"}>
        <AppointmentForm onSubmit={handleCreateOrUpdate} loading={formLoading} defaultValues={editingAppointment} />
      </SlideOver>

      <ConfirmDialog 
        isOpen={isCancelModalOpen}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone and the patient will be notified."
        onConfirm={confirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
        loading={formLoading}
      />
    </>
  );
}
