import { Loader2, Calendar, Clock, User, Phone, Edit, Activity, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { PrescriptionBuilder } from './PrescriptionBuilder';

export const AppointmentDetails = ({ appointment, onStatusChange }: { appointment: any, onStatusChange: (status: string) => void }) => {
  const [view, setView] = useState<'details' | 'prescription'>('details');

  if (!appointment) return null;

  if (view === 'prescription') {
    return <PrescriptionBuilder appointment={appointment} onBack={() => setView('details')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold text-lg">
          {appointment.patientId?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{appointment.patientId?.name || 'Unknown Patient'}</h3>
          <div className="flex items-center text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
            <Phone className="w-3.5 h-3.5 mr-1" /> {appointment.patientId?.mobileNumber || 'N/A'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1"/> Date</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{appointment.appointmentDate}</div>
        </div>
        <div className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center"><Clock className="w-3.5 h-3.5 mr-1"/> Time</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{appointment.appointmentTime} ({appointment.duration || 30}m)</div>
        </div>
        <div className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center"><Stethoscope className="w-3.5 h-3.5 mr-1"/> Doctor</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{appointment.doctorId?.name || 'Unknown'}</div>
        </div>
        <div className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center"><Activity className="w-3.5 h-3.5 mr-1"/> Type</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{appointment.type?.toLowerCase().replace('_', ' ') || 'Consultation'}</div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Update Status</label>
        <div className="flex gap-2 bg-slate-100 dark:bg-[#1A1A1A] p-1 rounded-lg">
          {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                appointment.status === status 
                  ? 'bg-white shadow-sm text-slate-900 dark:bg-neutral-800 dark:text-white' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {appointment.notes && (
        <div>
          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Notes</h4>
          <p className="text-sm text-slate-600 dark:text-neutral-400 bg-slate-50 dark:bg-[#1A1A1A] p-3 rounded-lg border border-slate-200 dark:border-neutral-800">
            {appointment.notes}
          </p>
        </div>
      )}

      <div className="pt-6 border-t border-slate-200 dark:border-neutral-800 space-y-3">
        <button onClick={() => window.location.href = '/dashboard/appointments'} className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          <Edit className="w-4 h-4" /> Reschedule via Appointments
        </button>
        <button onClick={() => setView('prescription')} className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:bg-black dark:text-neutral-200 dark:hover:bg-neutral-900 transition-colors">
          Manage Prescription
        </button>
      </div>
    </div>
  );
};
