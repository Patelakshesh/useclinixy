'use client';

import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  title: string;
  columns: string[];
  data: any[];
  loading: boolean;
  onSearch: (value: string) => void;
  onAddClick: () => void;
  addButtonLabel?: string;
  renderRow: (item: any) => React.ReactNode;
  pagination?: { page: number; pages: number; total: number; limit: number };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const DataTable = ({ title, columns, data, loading, onSearch, onAddClick, addButtonLabel = 'Add New', renderRow, pagination, onPageChange, onLimitChange }: DataTableProps) => {
  const getPageNumbers = () => {
    if (!pagination) return [];
    const current = pagination.page;
    const last = pagination.pages;
    const delta = 2;
    const left = current - delta;
    const right = current + delta + 1;
    const range = [];
    
    for (let i = 1; i <= last; i++) {
      if (i === 1 || i === last || (i >= left && i < right)) {
        range.push(i);
      }
    }

    let l;
    const rangeWithDots = [];
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        <button
          onClick={onAddClick}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-colors shadow-sm"
        >
          {addButtonLabel}
        </button>
      </div>

      <div className="flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-black">
        <div className="relative w-72 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Search records..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-slate-300 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:text-white dark:focus:border-neutral-700 transition-all focus:ring-4 focus:ring-slate-100 dark:focus:ring-neutral-900"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-b-xl border border-t-0 border-slate-200 bg-white dark:border-neutral-800 dark:bg-black shadow-sm">
        <table className="w-full whitespace-nowrap text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 border-b border-slate-200 dark:bg-[#0A0A0A] dark:border-neutral-800">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-100">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                   <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-slate-400">No records found. Try adjusting your search.</td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-slate-50 dark:hover:bg-[#0A0A0A] transition-colors">
                  {renderRow(item)}
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-neutral-800 dark:bg-[#0A0A0A] gap-4">
           <div className="flex items-center gap-4 text-sm text-slate-500">
             {pagination ? (
               <>
                 <span>Showing <span className="font-medium text-slate-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-slate-900 dark:text-white">{pagination.total}</span> results</span>
                 {onLimitChange && (
                   <div className="flex items-center gap-2">
                     <select 
                       value={pagination.limit}
                       onChange={(e) => onLimitChange(Number(e.target.value))}
                       className="border border-slate-200 rounded p-1 dark:bg-black dark:border-neutral-800 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors"
                     >
                       <option value={5}>5</option>
                       <option value={10}>10</option>
                       <option value={25}>25</option>
                       <option value={50}>50</option>
                     </select>
                   </div>
                 )}
               </>
             ) : (
               <span>Showing <span className="font-medium text-slate-900 dark:text-white">{data.length}</span> results</span>
             )}
           </div>
           
           {pagination && onPageChange && pagination.pages > 1 && (
             <div className="flex items-center gap-1">
                <button 
                  disabled={pagination.page <= 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex items-center px-2 gap-1">
                  {getPageNumbers().map((pageNum, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : null}
                      disabled={pageNum === '...'}
                      className={`min-w-[32px] h-[32px] flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        pageNum === pagination.page 
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black' 
                          : pageNum === '...' 
                            ? 'text-slate-400 cursor-default' 
                            : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => onPageChange(pagination.page + 1)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
