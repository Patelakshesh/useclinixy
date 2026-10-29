'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50]
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 bg-slate-50/70 px-6 py-4 dark:border-neutral-800 dark:bg-[#0E0E0E] gap-4">
      {/* Left: Summary and Page Size Selector */}
      <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
        <span>
          Showing <span className="font-semibold text-slate-900 dark:text-white">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span> results
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-neutral-800">
            <span className="text-xs">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1); // Reset to page 1 on limit change
              }}
              className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => (
              <button
                key={idx}
                onClick={() => typeof p === 'number' && onPageChange(p)}
                disabled={p === '...'}
                className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  p === currentPage
                    ? 'bg-blue-600 text-white shadow-sm'
                    : p === '...'
                    ? 'text-slate-400 dark:text-neutral-600 cursor-default'
                    : 'text-slate-600 dark:text-neutral-300 hover:bg-slate-200/70 dark:hover:bg-neutral-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
