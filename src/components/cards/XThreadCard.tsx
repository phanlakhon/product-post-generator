'use client';

import React, { useState } from 'react';
import { XPostContent } from '@/lib/types';
import { XTwitterIcon } from '@/components/Icons';
import { Copy, Check, MessageCircle, Repeat2, Heart, BadgeCheck } from 'lucide-react';

interface XThreadCardProps {
  data: XPostContent;
  onCopy: (text: string, label: string) => void;
}

export const XThreadCard: React.FC<XThreadCardProps> = ({ data, onCopy }) => {
  const [copiedBlock, setCopiedBlock] = useState<'main' | 'reply' | 'all' | null>(null);

  const handleCopy = (text: string, type: 'main' | 'reply' | 'all', label: string) => {
    onCopy(text, label);
    setCopiedBlock(type);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const fullThreadText = `${data.mainPost}\n\n---\n${data.replyPost}`;
  const charLength = data.mainPost.length;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm">
            <XTwitterIcon className="w-4 h-4 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                X (Twitter) Thread
              </h3>
              <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${
                charLength <= 280
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}>
                {charLength} / 280 chars {charLength <= 280 ? '✓ Fits Limit' : '⚠ Exceeds'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Short punchy review (under 280 chars) + reply link
            </p>
          </div>
        </div>

        <button
          onClick={() => handleCopy(fullThreadText, 'all', 'Full Twitter Thread copied!')}
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
              <span>Copy Entire Thread</span>
            </>
          )}
        </button>
      </div>

      {/* Thread Visual Mockup */}
      <div className="space-y-0 relative">
        {/* Vertical Timeline Thread Connector Line */}
        <div className="absolute left-5 top-12 bottom-12 w-0.5 bg-neutral-200 dark:bg-neutral-800 z-0" />

        {/* ----------------- BLOCK 1: MAIN POST (NO LINKS, UNDER 280 CHARS) ----------------- */}
        <div className="relative z-10 flex items-start gap-3 pb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm border-2 border-white dark:border-neutral-900">
            A
          </div>
          <div className="flex-1 min-w-0 bg-neutral-50/80 dark:bg-neutral-950/60 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Affiliate Pro
                </span>
                <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/20" />
                <span className="text-xs text-neutral-400">@affiliate_pro · 1m</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Block 1: Short Main Post ({charLength} chars)
              </span>
            </div>

            {/* Content */}
            <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed font-sans mb-3">
              {data.mainPost}
            </p>

            {/* Engagement & Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 text-neutral-400 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 hover:text-sky-500">
                  <MessageCircle className="w-3.5 h-3.5" /> 12
                </span>
                <span className="flex items-center gap-1 hover:text-emerald-500">
                  <Repeat2 className="w-3.5 h-3.5" /> 48
                </span>
                <span className="flex items-center gap-1 hover:text-rose-500">
                  <Heart className="w-3.5 h-3.5" /> 234
                </span>
              </div>

              <button
                onClick={() => handleCopy(data.mainPost, 'main', 'Main Post copied!')}
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

        {/* ----------------- BLOCK 2: REPLY POST (WITH LINK) ----------------- */}
        <div className="relative z-10 flex items-start gap-3 pt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm border-2 border-white dark:border-neutral-900">
            A
          </div>
          <div className="flex-1 min-w-0 bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl p-4 border border-sky-200/60 dark:border-sky-800/40">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Affiliate Pro
                </span>
                <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/20" />
                <span className="text-xs text-neutral-400">@affiliate_pro · Replying to @affiliate_pro</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Block 2: Reply Link
              </span>
            </div>

            {/* Content */}
            <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed font-sans mb-3">
              {data.replyPost}
            </p>

            {/* Engagement & Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-sky-200/50 dark:border-sky-900/50 text-neutral-400 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> 3
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> 89
                </span>
              </div>

              <button
                onClick={() => handleCopy(data.replyPost, 'reply', 'Reply Post copied!')}
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
