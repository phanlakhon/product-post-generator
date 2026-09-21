'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-3 rounded-xl shadow-2xl border border-neutral-800 dark:border-neutral-200 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
      <span className="text-sm font-medium tracking-tight">{message}</span>
    </div>
  );
};
