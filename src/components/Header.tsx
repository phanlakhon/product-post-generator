'use client';

import React from 'react';
import { Sparkles, Link2 } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoadSample }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Affiliate Auto-Poster Logo"
            className="w-9 h-9 rounded-xl object-cover shadow-md border border-orange-500/40 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg text-neutral-900 dark:text-neutral-50 tracking-tight leading-none">
                Affiliate Auto-Poster
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80">
                <Sparkles className="w-3 h-3 text-orange-500 fill-current" />
                Shopee Orange Edition
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
              Generate platform-optimized social posts with automatic link placement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer active:scale-95"
            title="Auto-fill example link & details"
          >
            <Link2 className="w-3.5 h-3.5 text-orange-500" />
            <span>Load Demo Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
