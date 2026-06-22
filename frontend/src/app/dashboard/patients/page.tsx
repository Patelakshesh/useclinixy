'use client';

import { useEffect, useState, useCallback } from 'react';
import { getPatients, createPatient, updatePatient, deletePatient } from '@/features/patients/api/patients';
import { DataTable } from '@/components/shared/DataTable';
import { SlideOver } from '@/components/shared/SlideOver';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PatientForm } from '@/features/patients/components/PatientForm';
import { Trash2, Edit, UserCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/features/auth/api/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PatientsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });
  const isDoctor = user?.role === 'DOCTOR';

  const fetchPatients = useCallback(async (page = 1, currentLimit = limit) => {
    setLoading(true);
    try {
       const res = await getPatients(search, page, currentLimit);
       setData(res.data);
       setPagination(res.pagination);
    } catch (err) {
       console.error(err);
       toast.error('Failed to load patients');
    } finally {
       setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchPatients(1, limit); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, limit, fetchPatients]);

  const handleSubmitForm = async (formData: any) => {
    setFormLoading(true);
    try {
      if (editData) {
        await updatePatient(editData._id, formData);
        toast.success('Patient updated successfully');
      } else {
        await createPatient(formData);
        toast.success('Patient added successfully');
      }
      setIsDrawerOpen(false);
      fetchPatients(pagination.page);
    } catch (error: any) {
      console.error(error);
      const backendMessage = error.response?.data?.message;
      toast.error(backendMessage || `Failed to ${editData ? 'update' : 'create'} patient`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (patient: any) => {
    setEditData(patient);
    setIsDrawerOpen(true);
  };

  const handleAddClick = () => {
    setEditData(null);
    setIsDrawerOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleteLoading(true);
    try {
      await deletePatient(selectedId);
      toast.success('Patient deleted successfully');
      setIsDeleteOpen(false);
      fetchPatients(pagination.page);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete patient');
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
          title="Patients"
          columns={isDoctor ? ['Name', 'Age & Gender', 'Contact', 'Address', 'Profile'] : ['Name', 'Age & Gender', 'Contact', 'Address', 'Actions']}
          data={data}
          loading={loading}
          onSearch={setSearch}
          onAddClick={isDoctor ? undefined : handleAddClick}
          addButtonLabel={isDoctor ? undefined : "Add Patient"}
          pagination={pagination}
          onPageChange={(page) => fetchPatients(page, limit)}
          onLimitChange={(newLimit) => setLimit(newLimit)}
          renderRow={(patient) => (
            <>
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {patient.name.charAt(0)}
                   </div>
                   {patient.name}
                </div>
              </td>
              <td className="px-6 py-4">
                 {patient.age} Yrs • <span className="capitalize">{patient.gender.toLowerCase()}</span>
              </td>
              <td className="px-6 py-4 font-medium">{patient.mobileNumber}</td>
              <td className="px-6 py-4 truncate max-w-[200px]" title={patient.address || 'N/A'}>
                 {patient.address || 'N/A'}
              </td>
              <td className="px-6 py-4">
                 <div className="flex items-center gap-3">
                   <Link href={`/dashboard/patients/${patient._id}`} className="text-slate-400 hover:text-indigo-500 transition-colors" title="View Profile">
                     <UserCircle className="h-4 w-4" />
                   </Link>
                   {!isDoctor && (
                     <>
                       <button onClick={() => handleEditClick(patient)} className="text-slate-400 hover:text-blue-500 transition-colors" title="Edit">
                         <Edit className="h-4 w-4" />
                       </button>
                       <button onClick={() => confirmDelete(patient._id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                         <Trash2 className="h-4 w-4" />
                       </button>
                     </>
                   )}
                 </div>
              </td>
            </>
          )}
        />
      </div>

      <SlideOver isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editData ? "Edit Patient" : "Add New Patient"}>
        <PatientForm key={editData?._id || 'new'} defaultValues={editData} onSubmit={handleSubmitForm} loading={formLoading} />
      </SlideOver>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Patient"
        description="Are you sure you want to delete this patient? All associated records may be affected."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
        loading={deleteLoading}
      />
    </>
  );
}
