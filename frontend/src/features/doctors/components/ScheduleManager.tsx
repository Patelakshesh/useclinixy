'use client';

import { useState, useEffect } from 'react';
import { updateDoctor, getDoctorLeaves, createDoctorLeave, deleteDoctorLeave } from '../api/doctors';
import { Loader2, Plus, Trash2, CalendarX2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ScheduleManager = ({ doctor, onSuccess }: { doctor: any; onSuccess: () => void }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'leaves'>('schedule');
  const [loading, setLoading] = useState(false);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);

  const [newLeave, setNewLeave] = useState({ startDate: '', endDate: '', reason: '' });
  
  // Delete Leave Dialog State
  const [deleteLeaveId, setDeleteLeaveId] = useState<string | null>(null);
  const [isDeleteLeaveOpen, setIsDeleteLeaveOpen] = useState(false);

  useEffect(() => {
    // Initialize schedule
    if (doctor.schedule && doctor.schedule.length > 0) {
      setSchedule(doctor.schedule);
    } else {
      setSchedule(DAYS.map(day => ({
        day,
        isWorkingDay: false,
        shifts: []
      })));
    }
    fetchLeaves();
  }, [doctor]);

  const fetchLeaves = async () => {
    setLeavesLoading(true);
    try {
      const res = await getDoctorLeaves(doctor._id);
      setLeaves(res.data || []);
    } catch (error) {
      toast.error('Failed to load leaves');
    } finally {
      setLeavesLoading(false);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].isWorkingDay = !newSchedule[dayIndex].isWorkingDay;
    if (newSchedule[dayIndex].isWorkingDay && newSchedule[dayIndex].shifts.length === 0) {
      newSchedule[dayIndex].shifts = [{ startTime: '09:00', endTime: '17:00' }];
    }
    setSchedule(newSchedule);
  };

  const handleAddShift = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].shifts.push({ startTime: '09:00', endTime: '17:00' });
    setSchedule(newSchedule);
  };

  const handleRemoveShift = (dayIndex: number, shiftIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].shifts.splice(shiftIndex, 1);
    setSchedule(newSchedule);
  };

  const handleShiftChange = (dayIndex: number, shiftIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].shifts[shiftIndex][field] = value;
    setSchedule(newSchedule);
  };

  const handleSaveSchedule = async () => {
    // Validate shifts
    for (const day of schedule) {
      if (day.isWorkingDay) {
        if (day.shifts.length === 0) {
          return toast.error(`Please add at least one shift for ${day.day} or mark it as off.`);
        }
        const sortedShifts = [...day.shifts].sort((a, b) => a.startTime.localeCompare(b.startTime));
        for (let i = 0; i < sortedShifts.length; i++) {
          if (sortedShifts[i].startTime >= sortedShifts[i].endTime) {
             return toast.error(`Shift end time must be after start time on ${day.day}`);
          }
          if (i > 0 && sortedShifts[i].startTime < sortedShifts[i-1].endTime) {
             return toast.error(`Shifts cannot overlap on ${day.day}`);
          }
        }
      }
    }

    setLoading(true);
    try {
      await updateDoctor(doctor._id, { schedule });
      toast.success('Schedule updated successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLeave.endDate < newLeave.startDate) {
      return toast.error('End date cannot be before start date');
    }
    setLoading(true);
    try {
      await createDoctorLeave(doctor._id, newLeave);
      toast.success('Leave added successfully');
      setNewLeave({ startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to add leave');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeave = async () => {
    if (!deleteLeaveId) return;
    setLoading(true);
    try {
      await deleteDoctorLeave(doctor._id, deleteLeaveId);
      toast.success('Leave removed');
      setIsDeleteLeaveOpen(false);
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to remove leave');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteLeave = (id: string) => {
    setDeleteLeaveId(id);
    setIsDeleteLeaveOpen(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-slate-200 dark:border-neutral-800 mb-4 px-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-300'}`}
        >
          Working Hours
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'leaves' ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-300'}`}
        >
          Leaves & Holidays
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {schedule.map((dayObj, dIndex) => (
              <div key={dayObj.day} className="border border-slate-200 dark:border-neutral-800 rounded-lg p-4 bg-slate-50/50 dark:bg-[#111]">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={dayObj.isWorkingDay} 
                      onChange={() => handleToggleDay(dIndex)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-neutral-700 dark:bg-neutral-800 w-4 h-4"
                    />
                    <span className="font-medium text-slate-900 dark:text-white">{dayObj.day}</span>
                  </label>
                  {dayObj.isWorkingDay && (
                    <button 
                      onClick={() => handleAddShift(dIndex)}
                      className="text-xs flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Shift
                    </button>
                  )}
                </div>

                {dayObj.isWorkingDay && dayObj.shifts.map((shift: any, sIndex: number) => (
                  <div key={sIndex} className="flex items-center gap-2 mt-2 pl-7">
                    <input 
                      type="time" 
                      value={shift.startTime}
                      onChange={(e) => handleShiftChange(dIndex, sIndex, 'startTime', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-neutral-700 dark:bg-black dark:text-white dark:[color-scheme:dark] outline-none"
                    />
                    <span className="text-slate-400 text-xs">to</span>
                    <input 
                      type="time" 
                      value={shift.endTime}
                      onChange={(e) => handleShiftChange(dIndex, sIndex, 'endTime', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-neutral-700 dark:bg-black dark:text-white dark:[color-scheme:dark] outline-none"
                    />
                    <button 
                      onClick={() => handleRemoveShift(dIndex, sIndex)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
            <div className="pt-4 pb-8">
              <button onClick={handleSaveSchedule} disabled={loading} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-colors">
                {loading ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="space-y-6">
            <form onSubmit={handleAddLeave} className="border border-slate-200 dark:border-neutral-800 rounded-lg p-4 bg-slate-50/50 dark:bg-[#111]">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Add Leave/Holiday</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Start Date</label>
                  <input min={todayStr} required type="date" value={newLeave.startDate} onChange={e => setNewLeave({...newLeave, startDate: e.target.value})} className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-black dark:text-white dark:[color-scheme:dark] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">End Date</label>
                  <input min={newLeave.startDate || todayStr} required type="date" value={newLeave.endDate} onChange={e => setNewLeave({...newLeave, endDate: e.target.value})} className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-black dark:text-white dark:[color-scheme:dark] outline-none" />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs text-slate-500 mb-1">Reason (Optional)</label>
                <input type="text" placeholder="e.g. Vacation" value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})} className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-black dark:text-white outline-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-300 disabled:opacity-50 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700">
                Add Leave
              </button>
            </form>

            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Upcoming Leaves</h4>
              {leavesLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
              ) : leaves.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500 border border-slate-200 dark:border-neutral-800 rounded-lg bg-slate-50/50 dark:bg-[#111]">
                  <CalendarX2 className="w-8 h-8 mx-auto text-slate-300 dark:text-neutral-600 mb-2" />
                  No leaves scheduled
                </div>
              ) : (
                <div className="space-y-2">
                  {leaves.map(leave => (
                    <div key={leave._id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-black">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                        {leave.reason && <div className="text-xs text-slate-500">{leave.reason}</div>}
                      </div>
                      <button type="button" onClick={() => confirmDeleteLeave(leave._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteLeaveOpen}
        title="Delete Leave"
        description="Are you sure you want to delete this leave? The doctor will be available for booking on these dates."
        onConfirm={handleDeleteLeave}
        onCancel={() => setIsDeleteLeaveOpen(false)}
        loading={loading}
      />
    </div>
  );
};
