'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
            <div className="h-3 bg-neutral-100 dark:bg-neutral-800/60 rounded w-1/4" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
          <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
          <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-4/6" />
        </div>
        <div className="h-10 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl w-full" />
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
            <div className="h-3 bg-neutral-100 dark:bg-neutral-800/60 rounded w-1/5" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
          <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{ onDemoClick: () => void }> = ({ onDemoClick }) => {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-8 sm:p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[420px]">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-400 mb-4 shadow-inner">
        <Sparkles className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
      </div>
      <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 mb-1">
        Ready to Generate Social Posts
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-6 leading-relaxed">
        Paste your affiliate product link on the left panel, pick target platforms, and click <span className="font-semibold text-neutral-800 dark:text-neutral-200">"Generate Posts"</span> to create formatted mockups automatically.
      </p>

      <button
        onClick={onDemoClick}
        type="button"
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer shadow-sm active:scale-95"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Try Demo Preset</span>
      </button>
    </div>
  );
};
