'use client';

import { useEffect, useState } from 'react';
import { getPatients } from '@/features/patients/api/patients';
import { DataTable } from '@/components/shared/DataTable';

export default function PatientsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
         const res = await getPatients(search);
         setData(res.data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
    };
    const delayDebounceFn = setTimeout(() => { fetchPatients(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <DataTable 
      title="Patients"
      columns={['Name', 'Age & Gender', 'Contact', 'Address', 'Actions']}
      data={data}
      loading={loading}
      onSearch={setSearch}
      onAddClick={() => alert('Add Patient Slide-out Drawer will open here')}
      addButtonLabel="Add Patient"
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
             <button className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">Edit</button>
          </td>
        </>
      )}
    />
  );
}
