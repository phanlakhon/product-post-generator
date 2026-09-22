'use client';

import React from 'react';
import { AppMode } from '@/lib/types';
import { Sparkles, BookOpen } from 'lucide-react';

interface NavigationTabsProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex items-center justify-center mb-6 sm:mb-8">
      <div className="inline-flex items-center p-1.5 bg-neutral-200/80 dark:bg-neutral-900 border border-neutral-300/70 dark:border-neutral-800 rounded-2xl shadow-inner gap-1 max-w-full overflow-x-auto">
        {/* Mode 1: Quick Post Generator */}
        <button
          onClick={() => onModeChange('post_generator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            mode === 'post_generator'
              ? 'bg-white dark:bg-neutral-800 text-orange-600 dark:text-orange-400 shadow-md border border-neutral-200/80 dark:border-neutral-700'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
          <span>Quick Post Generator</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-900">
            X / FB / Threads
          </span>
        </button>

        {/* Mode 2: Story Thread Generator */}
        <button
          onClick={() => onModeChange('story_thread')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            mode === 'story_thread'
              ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-md border border-neutral-200/80 dark:border-neutral-700'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Story Thread Generator</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-900">
            เธรตเล่าเรื่อง (ผี/ข่าว/ป้ายยา)
          </span>
        </button>
      </div>
    </div>
  );
};
