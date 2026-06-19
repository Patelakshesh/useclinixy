'use client';

import { useEffect, useState } from 'react';
import { getAppointments, updateAppointmentStatus } from '@/features/appointments/api/appointments';
import { DataTable } from '@/components/shared/DataTable';

export default function AppointmentsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
         const res = await getAppointments(search);
         setData(res.data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
    };
    const delayDebounceFn = setTimeout(() => { fetchAppointments(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleStatusChange = async (id: string, newStatus: string) => {
     try {
        await updateAppointmentStatus(id, newStatus);
        setData((prev: any) => prev.map((app: any) => app._id === id ? { ...app, status: newStatus } : app));
     } catch (err) {
        console.error('Failed to update status', err);
        alert('Failed to update status');
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
    <DataTable 
      title="Appointments"
      columns={['Date & Time', 'Patient', 'Doctor', 'Status', 'Actions']}
      data={data}
      loading={loading}
      onSearch={setSearch}
      onAddClick={() => alert('Book Appointment Slider')}
      addButtonLabel="Book Appointment"
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
          <td className="px-6 py-4">
             <div className="font-medium text-slate-900 dark:text-white">{app.doctorId?.name || 'Unknown'}</div>
             <div className="text-xs text-slate-500">{app.doctorId?.specialization}</div>
          </td>
          <td className="px-6 py-4">
             <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(app.status)}`}>
                {app.status}
             </span>
          </td>
          <td className="px-6 py-4">
             <select 
                className="text-sm border border-slate-200 rounded p-1 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white outline-none focus:ring-1 focus:ring-slate-900"
                value={app.status}
                onChange={(e) => handleStatusChange(app._id, e.target.value)}
             >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
             </select>
          </td>
        </>
      )}
    />
  );
}
