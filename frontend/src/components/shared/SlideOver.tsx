'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const SlideOver = ({ isOpen, onClose, title, children }: SlideOverProps) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity print:hidden"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-black sm:w-[450px] print:static print:w-full print:max-w-none print:shadow-none print:border-none print:bg-white print:text-black"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-neutral-800 shrink-0 print:hidden">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 print:p-0 print:overflow-visible">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
