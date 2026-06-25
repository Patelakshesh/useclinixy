'use client';
import { useEffect, useState, useCallback } from 'react';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '@/features/doctors/api/doctors';
import { DataTable } from '@/components/shared/DataTable';
import { SlideOver } from '@/components/shared/SlideOver';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DoctorForm } from '@/features/doctors/components/DoctorForm';
import { ScheduleManager } from '@/features/doctors/components/ScheduleManager';
import { Trash2, Edit, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // Schedule Drawer State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleDoctor, setScheduleDoctor] = useState<any>(null);

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDoctors = useCallback(async (page = 1, currentLimit = limit) => {
    setLoading(true);
    try {
       const res = await getDoctors(search, page, currentLimit);
       setData(res.data);
       setPagination(res.pagination);
    } catch (err) {
       console.error(err);
       toast.error('Failed to load doctors');
    } finally {
       setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchDoctors(1, limit); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, limit, fetchDoctors]);

  const handleSubmitForm = async (formData: any, openScheduleNext: boolean = false) => {
    setFormLoading(true);
    try {
      if (editData) {
        await updateDoctor(editData._id, formData);
        toast.success('Doctor updated successfully');
        setIsDrawerOpen(false);
        fetchDoctors(pagination.page);
      } else {
        const res = await createDoctor(formData);
        toast.success('Doctor added successfully');
        setIsDrawerOpen(false);
        fetchDoctors(pagination.page);
        
        if (openScheduleNext && res.data) {
          // Add a tiny delay to ensure drawer closing animation doesn't conflict
          setTimeout(() => {
            setScheduleDoctor(res.data);
            setIsScheduleOpen(true);
          }, 300);
        }
      }
    } catch (error: any) {
      console.error(error);
      const backendMessage = error.response?.data?.message;
      toast.error(backendMessage || `Failed to ${editData ? 'update' : 'create'} doctor`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (doc: any) => {
    setEditData(doc);
    setIsDrawerOpen(true);
  };

  const handleScheduleClick = (doc: any) => {
    setScheduleDoctor(doc);
    setIsScheduleOpen(true);
  };

  const handleAddClick = () => {
    setEditData(null);
    setIsDrawerOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleteLoading(true);
    try {
      await deleteDoctor(selectedId);
      toast.success('Doctor deleted successfully');
      setIsDeleteOpen(false);
      fetchDoctors(pagination.page);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete doctor');
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedId(id);
    setIsDeleteOpen(true);
  };

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        <DataTable 
          title="Doctors"
          columns={['Name', 'Specialization', 'Contact', 'Fees', 'Status', 'Actions']}
          data={data}
          loading={loading}
          onSearch={setSearch}
          onAddClick={handleAddClick}
          addButtonLabel="Add Doctor"
          pagination={pagination}
          onPageChange={(page) => fetchDoctors(page, limit)}
          onLimitChange={(newLimit) => setLimit(newLimit)}
          renderRow={(doc) => (
            <>
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {doc.name.charAt(0)}
                   </div>
                   {doc.name}
                </div>
              </td>
              <td className="px-6 py-4">{doc.specialization}</td>
              <td className="px-6 py-4">
                <div className="flex flex-col text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{doc.email}</span>
                  <span className="text-slate-400">{doc.mobileNumber}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="text-slate-700 dark:text-slate-300">New: <span className="font-medium">₹{doc.newPatientFee || 0}</span></span>
                  <span className="text-slate-700 dark:text-slate-300">Old: <span className="font-medium">₹{doc.oldPatientFee || 0}</span></span>
                  <span className="text-red-600 dark:text-red-400">Emg: <span className="font-medium">₹{doc.emergencyFee || 0}</span></span>
                </div>
              </td>
              <td className="px-6 py-4">
                 <span className={`px-2 py-1 text-xs rounded-full font-medium ${doc.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500' : 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300'}`}>
                    {doc.status}
                 </span>
              </td>
              <td className="px-6 py-4">
                 <div className="flex items-center gap-3">
                   <button 
                     onClick={() => handleScheduleClick(doc)} 
                     className={`relative text-slate-400 hover:text-indigo-500 transition-colors ${!doc.schedule?.some((s:any) => s.isWorkingDay) ? 'text-orange-400' : ''}`} 
                     title="Manage Schedule"
                   >
                     <CalendarClock className="h-4 w-4" />
                     {!doc.schedule?.some((s:any) => s.isWorkingDay) ? (
                       <span className="absolute -top-1 -right-1 flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                       </span>
                     ) : (
                       <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                         <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                       </span>
                     )}
                   </button>
                   <button onClick={() => handleEditClick(doc)} className="text-slate-400 hover:text-blue-500 transition-colors" title="Edit">
                     <Edit className="h-4 w-4" />
                   </button>
                   <button onClick={() => confirmDelete(doc._id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                     <Trash2 className="h-4 w-4" />
                   </button>
                 </div>
              </td>
            </>
          )}
        />
      </div>

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editData ? "Edit Doctor" : "Add New Doctor"}
      >
        <DoctorForm key={editData?._id || 'new'} defaultValues={editData} onSubmit={handleSubmitForm} loading={formLoading} />
      </SlideOver>

      <SlideOver
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title={`Manage Schedule: ${scheduleDoctor?.name || ''}`}
      >
        {scheduleDoctor && (
          <ScheduleManager 
            doctor={scheduleDoctor} 
            onSuccess={() => {
              setIsScheduleOpen(false);
              fetchDoctors(pagination.page);
            }} 
          />
        )}
      </SlideOver>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Doctor"
        description="Are you sure you want to delete this doctor? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
        loading={deleteLoading}
      />
    </>
  );
}
