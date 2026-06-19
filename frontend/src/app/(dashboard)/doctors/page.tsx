'use client';

import { useEffect, useState } from 'react';
import { getDoctors } from '@/features/doctors/api/doctors';
import { DataTable } from '@/components/shared/DataTable';

export default function DoctorsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
         const res = await getDoctors(search);
         setData(res.data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
    };
    const delayDebounceFn = setTimeout(() => { fetchDoctors(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <DataTable 
      title="Doctors"
      columns={['Name', 'Specialization', 'Contact', 'Fees', 'Status', 'Actions']}
      data={data}
      loading={loading}
      onSearch={setSearch}
      onAddClick={() => alert('Add Doctor Slide-out Drawer will open here')}
      addButtonLabel="Add Doctor"
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
          <td className="px-6 py-4 font-medium">${doc.consultationFees}</td>
          <td className="px-6 py-4">
             <span className={`px-2 py-1 text-xs rounded-full font-medium ${doc.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500' : 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300'}`}>
                {doc.status}
             </span>
          </td>
          <td className="px-6 py-4">
             <button className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">Edit</button>
          </td>
        </>
      )}
    />
  );
}
