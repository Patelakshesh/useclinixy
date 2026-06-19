'use client';

import { useState, useEffect } from 'react';
import { getMedicalHistory, addMedicalHistory, deleteMedicalHistory, getVitals, addVitals, deleteVitals } from '../api/patients';
import { Activity, History, Trash2, Plus, LineChart as LineChartIcon, Thermometer, Heart, Weight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export const PatientProfile = ({ patient }: { patient: any }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'vitals'>('overview');
  
  const [history, setHistory] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [newHistory, setNewHistory] = useState({ condition: '', diagnosisDate: '', notes: '' });
  const [newVitals, setNewVitals] = useState({ date: new Date().toISOString().split('T')[0], bloodPressure: '', heartRate: '', temperature: '', weight: '', height: '' });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'history'|'vitals'|null>(null);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'vitals') fetchVitals();
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const res = await getMedicalHistory(patient._id);
      setHistory(res.data || []);
    } catch (e) {
      toast.error('Failed to load medical history');
    }
  };

  const fetchVitals = async () => {
    try {
      const res = await getVitals(patient._id);
      setVitals(res.data || []);
    } catch (e) {
      toast.error('Failed to load vitals');
    }
  };

  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addMedicalHistory(patient._id, newHistory);
      toast.success('History added');
      setNewHistory({ condition: '', diagnosisDate: '', notes: '' });
      fetchHistory();
    } catch (e) {
      toast.error('Failed to add history');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addVitals(patient._id, newVitals);
      toast.success('Vitals added');
      setNewVitals({ date: new Date().toISOString().split('T')[0], bloodPressure: '', heartRate: '', temperature: '', weight: '', height: '' });
      fetchVitals();
    } catch (e) {
      toast.error('Failed to add vitals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;
    setLoading(true);
    try {
      if (deleteType === 'history') {
        await deleteMedicalHistory(patient._id, deleteId);
        fetchHistory();
      } else {
        await deleteVitals(patient._id, deleteId);
        fetchVitals();
      }
      toast.success('Deleted successfully');
      setDeleteId(null);
      setDeleteType(null);
    } catch (e) {
      toast.error('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Info */}
      <div className="w-full md:w-80 flex-shrink-0">
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold text-2xl flex items-center justify-center">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{patient.name}</h2>
              <div className="text-sm text-slate-500 dark:text-neutral-400">{patient.mobileNumber}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider mb-1">Age</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">{patient.age} years</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider mb-1">Gender</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white capitalize">{patient.gender?.toLowerCase()}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider mb-1">Blood Group</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">{patient.bloodGroup || 'Not Specified'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider mb-1">Address</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">{patient.address || 'Not Specified'}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-[#111] dark:text-neutral-300 dark:hover:bg-neutral-900 border border-slate-200 dark:border-neutral-800'}`}>
            Overview
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-colors ${activeTab === 'history' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-[#111] dark:text-neutral-300 dark:hover:bg-neutral-900 border border-slate-200 dark:border-neutral-800'}`}>
            <History className="w-4 h-4" /> Medical History
          </button>
          <button onClick={() => setActiveTab('vitals')} className={`flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-colors ${activeTab === 'vitals' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-[#111] dark:text-neutral-300 dark:hover:bg-neutral-900 border border-slate-200 dark:border-neutral-800'}`}>
            <Activity className="w-4 h-4" /> Vitals & Metrics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-xl p-6 h-full flex flex-col items-center justify-center text-slate-500">
            <Activity className="w-12 h-12 text-slate-300 dark:text-neutral-700 mb-4" />
            <p>Select Medical History or Vitals to manage patient records.</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <form onSubmit={handleAddHistory} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-500"/> Add Record</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">Condition/Diagnosis <span className="text-red-500">*</span></label>
                  <input required placeholder="e.g. Hypertension" value={newHistory.condition} onChange={e => setNewHistory({...newHistory, condition: e.target.value})} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-black dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">Date <span className="text-red-500">*</span></label>
                  <input required type="date" value={newHistory.diagnosisDate} onChange={e => setNewHistory({...newHistory, diagnosisDate: e.target.value})} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-black dark:text-white dark:[color-scheme:dark] outline-none focus:border-slate-400 dark:focus:border-neutral-600" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">Notes</label>
                <textarea rows={2} placeholder="Additional details..." value={newHistory.notes} onChange={e => setNewHistory({...newHistory, notes: e.target.value})} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-black dark:text-white outline-none focus:border-slate-400 dark:focus:border-neutral-600 resize-none" />
              </div>
              <button type="submit" disabled={loading} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-colors">
                {loading ? 'Saving...' : 'Save Record'}
              </button>
            </form>

            <div className="relative border-l border-slate-200 dark:border-neutral-800 ml-3 pl-6 space-y-6">
              {history.map((item) => (
                <div key={item._id} className="relative">
                  <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#111]" />
                  <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{item.condition}</h4>
                        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">{new Date(item.diagnosisDate).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => { setDeleteType('history'); setDeleteId(item._id); }} className="text-slate-400 hover:text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.notes && <p className="text-sm text-slate-600 dark:text-neutral-400 mt-2">{item.notes}</p>}
                  </div>
                </div>
              ))}
              {history.length === 0 && <div className="text-sm text-slate-500 pt-4">No medical history recorded.</div>}
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleAddVitals} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-500"/> Log Vitals</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">Date</label>
                    <input required type="date" value={newVitals.date} onChange={e => setNewVitals({...newVitals, date: e.target.value})} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-black dark:text-white dark:[color-scheme:dark] outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">Blood Pressure</label>
                      <input placeholder="120/80" value={newVitals.bloodPressure} onChange={e => setNewVitals({...newVitals, bloodPressure: e.target.value})} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-black dark:text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">Heart Rate (bpm)</label>
                      <input type="number" placeholder="72" value={newVitals.heartRate} onChange={e => setNewVitals({...newVitals, heartRate: e.target.value})} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-black dark:text-white outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">Temp (°F)</label>
                      <input type="number" step="0.1" placeholder="98.6" value={newVitals.temperature} onChange={e => setNewVitals({...newVitals, temperature: e.target.value})} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-black dark:text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">Weight (kg)</label>
                      <input type="number" step="0.1" placeholder="70" value={newVitals.weight} onChange={e => setNewVitals({...newVitals, weight: e.target.value})} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-black dark:text-white outline-none" />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Saving...' : 'Save Vitals'}
                </button>
              </form>

              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><LineChartIcon className="w-4 h-4 text-blue-500"/> Heart Rate Trend</h3>
                <div className="flex-1 min-h-[200px]">
                  {vitals.filter(v => v.heartRate).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...vitals].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} vertical={false} />
                        <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} stroke="#888" />
                        <YAxis tick={{fontSize: 10}} stroke="#888" width={30} />
                        <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px', color: '#fff'}} />
                        <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={{fill: '#ef4444', r: 4}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">Not enough data to display chart.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-neutral-400">
                  <thead className="bg-slate-50 dark:bg-neutral-900/50 text-xs uppercase text-slate-500 dark:text-neutral-500 border-b border-slate-200 dark:border-neutral-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">BP</th>
                      <th className="px-4 py-3 font-medium">Heart Rate</th>
                      <th className="px-4 py-3 font-medium">Temp</th>
                      <th className="px-4 py-3 font-medium">Weight</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                    {vitals.map(v => (
                      <tr key={v._id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{new Date(v.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{v.bloodPressure || '-'}</td>
                        <td className="px-4 py-3">{v.heartRate ? `${v.heartRate} bpm` : '-'}</td>
                        <td className="px-4 py-3">{v.temperature ? `${v.temperature} °F` : '-'}</td>
                        <td className="px-4 py-3">{v.weight ? `${v.weight} kg` : '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => { setDeleteType('vitals'); setDeleteId(v._id); }} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {vitals.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No vitals logged yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title={`Delete ${deleteType === 'history' ? 'Medical History' : 'Vitals'} Record`}
        description="Are you sure you want to delete this record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => { setDeleteId(null); setDeleteType(null); }}
        loading={loading}
      />
    </div>
  );
};
