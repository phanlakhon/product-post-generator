'use client';

import React, { useState } from 'react';
import { FacebookPostContent } from '@/lib/types';
import { FacebookIcon } from '@/components/Icons';
import { Copy, Check, ThumbsUp, MessageSquare, Share2, Globe } from 'lucide-react';

interface FacebookCardProps {
  data: FacebookPostContent;
  onCopy: (text: string, label: string) => void;
}

export const FacebookCard: React.FC<FacebookCardProps> = ({ data, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(data.fullPost, 'Facebook Post copied!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <FacebookIcon className="w-4 h-4 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                Facebook Post
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Long-form
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Formatted with emojis, bullet lists & clear CTA link
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Copied Post</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Facebook Post</span>
            </>
          )}
        </button>
      </div>

      {/* Facebook Card Mockup Body */}
      <div className="bg-neutral-50/80 dark:bg-neutral-950/60 rounded-2xl p-4 sm:p-5 border border-neutral-100 dark:border-neutral-800">
        {/* User Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            FB
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                Affiliate Daily Review
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <span>Just now</span>
              <span>·</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed font-sans mb-4">
          {data.fullPost}
        </div>

        {/* Engagement Footer */}
        <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-around text-neutral-500 text-xs font-medium">
          <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors py-1 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
            <ThumbsUp className="w-4 h-4" /> Like
          </button>
          <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors py-1 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
            <MessageSquare className="w-4 h-4" /> Comment
          </button>
          <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors py-1 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
};
