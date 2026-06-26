'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { getCalendarAppointments, updateAppointmentStatus } from '../api/appointments';
import { SlideOver } from '@/components/shared/SlideOver';
import { AppointmentDetails } from './AppointmentDetails';
import toast from 'react-hot-toast';

export const AdvancedCalendar = ({ doctors }: { doctors: any[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, view, selectedDoctor]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let start, end;
      if (view === 'month') {
        start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      } else {
        start = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        end = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      }

      const res = await getCalendarAppointments(start, end, selectedDoctor);
      setAppointments(res.data || []);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const daysInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const daysInWeek = useMemo(() => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const renderMonthView = () => (
    <div className="grid grid-cols-7 border-t border-l border-slate-200 dark:border-neutral-800 flex-1 bg-slate-50 dark:bg-neutral-900/20">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
        <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 border-b border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-black">
          {day}
        </div>
      ))}
      {daysInMonth.map((day, idx) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayAppointments = appointments.filter(app => app.appointmentDate === dayStr);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isToday = isSameDay(day, new Date());

        return (
          <div key={idx} className={`min-h-[100px] p-1 border-r border-b border-slate-200 dark:border-neutral-800 flex flex-col ${!isCurrentMonth ? 'bg-slate-50 text-slate-400 dark:bg-neutral-900/50 dark:text-neutral-600' : 'bg-white text-slate-900 dark:bg-black dark:text-white'}`}>
            <div className={`text-xs font-medium self-end px-2 py-0.5 rounded-full ${isToday ? 'bg-indigo-600 text-white' : ''}`}>
              {format(day, 'd')}
            </div>
            <div className="flex-1 overflow-y-auto mt-1 space-y-1 scrollbar-hide">
              {dayAppointments.slice(0, 4).map(app => (
                <div 
                  key={app._id} 
                  onClick={() => { setSelectedAppointment(app); setIsDrawerOpen(true); }}
                  className={`text-[10px] truncate px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity ${
                    app.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50' :
                    app.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50' :
                    app.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' :
                    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-slate-300 dark:border-neutral-700'
                  }`}
                >
                  {app.appointmentTime} - {app.patientId?.name.split(' ')[0]}
                </div>
              ))}
              {dayAppointments.length > 4 && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setView('week');
                    setCurrentDate(day);
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-neutral-300 text-center font-medium cursor-pointer"
                >
                  +{dayAppointments.length - 4} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    return (
      <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden relative">
        <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/20 sticky top-0 z-10">
          <div className="py-2 border-r border-slate-200 dark:border-neutral-800"></div>
          {daysInWeek.map(day => (
            <div key={day.toISOString()} className="py-2 text-center border-r border-slate-200 dark:border-neutral-800">
              <div className="text-xs font-semibold text-slate-500">{format(day, 'EEE')}</div>
              <div className={`text-lg font-medium mt-0.5 ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-slate-900 dark:text-white'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] relative">
            {/* Hours Column */}
            <div className="border-r border-slate-200 dark:border-neutral-800">
              {hours.map(hour => (
                <div key={hour} className="h-16 border-b border-slate-200 dark:border-neutral-800 text-[10px] text-slate-400 text-right pr-2 pt-1 font-medium">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {daysInWeek.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayAppointments = appointments.filter(app => app.appointmentDate === dayStr);

              return (
                <div key={day.toISOString()} className="border-r border-slate-200 dark:border-neutral-800 relative">
                  {hours.map(hour => (
                    <div key={hour} className="h-16 border-b border-slate-100 dark:border-neutral-800/50"></div>
                  ))}
                  {/* Appointments Blocks */}
                  {dayAppointments.map(app => {
                    const [hour, min] = app.appointmentTime.split(':').map(Number);
                    const top = ((hour - 8) * 64) + ((min / 60) * 64);
                    const height = ((app.duration || 15) / 60) * 64;
                    if (hour < 8 || hour >= 21) return null; // Outside visible hours
                    
                    return (
                      <div 
                        key={app._id}
                        onClick={() => { setSelectedAppointment(app); setIsDrawerOpen(true); }}
                        className={`absolute left-1 right-1 rounded-md border p-1.5 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                          app.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                          app.status === 'COMPLETED' ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                          app.status === 'CANCELLED' ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' :
                          'bg-white text-slate-800 border-slate-200 dark:bg-neutral-800 dark:text-slate-200 dark:border-neutral-700'
                        }`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className="text-[10px] font-semibold truncate leading-tight">{app.patientId?.name}</div>
                        <div className="text-[9px] opacity-80 truncate leading-tight mt-0.5">{app.appointmentTime} - {app.doctorId?.name}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedAppointment) return;
    try {
      await updateAppointmentStatus(selectedAppointment._id, status);
      toast.success('Status updated');
      fetchAppointments();
      setSelectedAppointment({ ...selectedAppointment, status });
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-neutral-800 print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-neutral-900 rounded-lg p-1">
            <button onClick={handlePrev} className="p-1 rounded-md hover:bg-white dark:hover:bg-neutral-800 transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-neutral-300" />
            </button>
            <button onClick={handleToday} className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white">
              Today
            </button>
            <button onClick={handleNext} className="p-1 rounded-md hover:bg-white dark:hover:bg-neutral-800 transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-neutral-300" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white w-48">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="text-sm bg-transparent border-none outline-none font-medium text-slate-700 dark:text-neutral-300 focus:ring-0 cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-neutral-900">All Doctors</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id} className="bg-white dark:bg-neutral-900">{d.name}</option>
              ))}
            </select>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-neutral-800 mx-2"></div>

          <div className="flex bg-slate-100 dark:bg-neutral-900 rounded-lg p-1">
            <button 
              onClick={() => setView('month')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'month' ? 'bg-white shadow-sm text-slate-900 dark:bg-neutral-800 dark:text-white' : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'week' ? 'bg-white shadow-sm text-slate-900 dark:bg-neutral-800 dark:text-white' : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative print:hidden">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}
        {view === 'month' ? renderMonthView() : renderWeekView()}
      </div>

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Appointment Details"
      >
        <AppointmentDetails 
          appointment={selectedAppointment} 
          onStatusChange={handleStatusChange} 
        />
      </SlideOver>
    </div>
  );
};
