'use client';

import React, { useState } from 'react';
import { ThreadsPostContent } from '@/lib/types';
import { ThreadsIcon } from '@/components/Icons';
import { Copy, Check, Heart, MessageCircle, Repeat, Send, BadgeCheck } from 'lucide-react';

interface ThreadsCardProps {
  data: ThreadsPostContent;
  onCopy: (text: string, label: string) => void;
}

export const ThreadsCard: React.FC<ThreadsCardProps> = ({ data, onCopy }) => {
  const [copiedBlock, setCopiedBlock] = useState<'main' | 'reply' | 'all' | null>(null);

  const fullThreadsText = `${data.mainPost}\n\n---\n${data.replyPost}`;

  const handleCopy = (text: string, type: 'main' | 'reply' | 'all', label: string) => {
    onCopy(text, label);
    setCopiedBlock(type);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <ThreadsIcon className="w-4 h-4 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                Threads Post
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                Meta Threads
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Clean text-first post without emojis + reply link
            </p>
          </div>
        </div>

        <button
          onClick={() => handleCopy(fullThreadsText, 'all', 'Full Threads Post copied!')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
        >
          {copiedBlock === 'all' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Copied All</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Threads Post</span>
            </>
          )}
        </button>
      </div>

      {/* Threads Visual Mockup */}
      <div className="space-y-0 relative">
        {/* Vertical Thread Connector Line */}
        <div className="absolute left-5 top-12 bottom-12 w-0.5 bg-neutral-200 dark:bg-neutral-800 z-0" />

        {/* ----------------- BLOCK 1: MAIN THREAD POST ----------------- */}
        <div className="relative z-10 flex items-start gap-3 pb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm border-2 border-white dark:border-neutral-900">
            T
          </div>
          <div className="flex-1 min-w-0 bg-neutral-50/80 dark:bg-neutral-950/60 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  affiliate_review_th
                </span>
                <BadgeCheck className="w-4 h-4 text-neutral-800 dark:text-neutral-200 fill-current" />
                <span className="text-xs text-neutral-400">· 2m</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Block 1: Review (No Link)
              </span>
            </div>

            {/* Content */}
            <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed font-sans mb-3">
              {data.mainPost}
            </p>

            {/* Engagement Icons */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 text-neutral-400 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 hover:text-rose-500 cursor-pointer">
                  <Heart className="w-3.5 h-3.5" /> 84
                </span>
                <span className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                  <MessageCircle className="w-3.5 h-3.5" /> 16
                </span>
                <span className="flex items-center gap-1 hover:text-emerald-500 cursor-pointer">
                  <Repeat className="w-3.5 h-3.5" /> 12
                </span>
                <span className="flex items-center gap-1 hover:text-sky-500 cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                </span>
              </div>

              <button
                onClick={() => handleCopy(data.mainPost, 'main', 'Threads Main Post copied!')}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {copiedBlock === 'main' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Block 1</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ----------------- BLOCK 2: REPLY LINK POST ----------------- */}
        <div className="relative z-10 flex items-start gap-3 pt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm border-2 border-white dark:border-neutral-900">
            T
          </div>
          <div className="flex-1 min-w-0 bg-neutral-100/70 dark:bg-neutral-950/80 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  affiliate_review_th
                </span>
                <BadgeCheck className="w-4 h-4 text-neutral-800 dark:text-neutral-200 fill-current" />
                <span className="text-xs text-neutral-400">· Reply</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
                Block 2: Reply Link
              </span>
            </div>

            {/* Content */}
            <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed font-sans mb-3">
              {data.replyPost}
            </p>

            {/* Engagement Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 text-neutral-400 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> 42
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> 5
                </span>
              </div>

              <button
                onClick={() => handleCopy(data.replyPost, 'reply', 'Threads Reply Post copied!')}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {copiedBlock === 'reply' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Block 2</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
