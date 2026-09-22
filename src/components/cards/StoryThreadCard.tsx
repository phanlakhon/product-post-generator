'use client';

import React, { useState } from 'react';
import { StoryThreadResult, ThreadCategory } from '@/lib/types';
import { Copy, Check, Heart, MessageCircle, Repeat, Send, BadgeCheck, Ghost, Newspaper, Lightbulb, ShoppingBag, MessageSquareQuote } from 'lucide-react';

interface StoryThreadCardProps {
  data: StoryThreadResult;
  onCopy: (text: string, label: string) => void;
}

export const StoryThreadCard: React.FC<StoryThreadCardProps> = ({ data, onCopy }) => {
  const [copiedBlock, setCopiedBlock] = useState<number | 'all' | null>(null);

  const fullThreadText = data.blocks.map((b) => b.content).join('\n\n---\n\n');

  const handleCopy = (text: string, blockId: number | 'all', label: string) => {
    onCopy(text, label);
    setCopiedBlock(blockId);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const getCategoryBadge = (cat: ThreadCategory) => {
    switch (cat) {
      case 'horror':
        return {
          icon: <Ghost className="w-3.5 h-3.5 text-purple-400" />,
          label: 'เรื่องผี / สยองขวัญ',
          style: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        };
      case 'news':
        return {
          icon: <Newspaper className="w-3.5 h-3.5 text-sky-400" />,
          label: 'สรุปข่าว / ดราม่า',
          style: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        };
      case 'knowledge':
        return {
          icon: <Lightbulb className="w-3.5 h-3.5 text-amber-400" />,
          label: 'สาระความรู้ / How-to',
          style: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'review':
        return {
          icon: <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />,
          label: 'รีวิวป้ายยา / Affiliate',
          style: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        };
      case 'general':
      default:
        return {
          icon: <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'เรื่องเล่าทั่วไป',
          style: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
    }
  };

  const badge = getCategoryBadge(data.category);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden">
      {/* Card Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1">
                {data.title}
              </h3>
              <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border inline-flex items-center gap-1 ${badge.style}`}>
                {badge.icon}
                <span>{badge.label}</span>
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Generated {data.blocks.length} connected thread blocks
            </p>
          </div>
        </div>

        <button
          onClick={() => handleCopy(fullThreadText, 'all', 'Copied Entire Story Thread!')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors cursor-pointer shrink-0"
        >
          {copiedBlock === 'all' ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
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

      {/* Connected Thread Blocks */}
      <div className="space-y-0 relative">
        {/* Connector Line */}
        <div className="absolute left-5 top-12 bottom-12 w-0.5 bg-neutral-200 dark:bg-neutral-800 z-0" />

        {data.blocks.map((block) => (
          <div key={block.stepIndex} className="relative z-10 flex items-start gap-3 pb-6 last:pb-0">
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm border-2 border-white dark:border-neutral-900">
              {block.stepIndex}
            </div>

            {/* Block Body */}
            <div className="flex-1 min-w-0 bg-neutral-50/80 dark:bg-neutral-950/60 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    story_thread_creator
                  </span>
                  <BadgeCheck className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-xs text-neutral-400">· Step {block.stepIndex}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      block.content.length <= 270
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : block.content.length <= 280
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse font-bold'
                    }`}
                  >
                    {block.content.length}/280 chars{' '}
                    {block.content.length <= 270
                      ? '✓'
                      : block.content.length <= 280
                      ? '⚠️ ชิดโควตา'
                      : '❌ เกิน 280 ตัวอักษร'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {block.label}
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed font-sans mb-3">
                {block.content}
              </p>

              {/* Engagement Bar & Copy Button */}
              <div className="flex items-center justify-between pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/80 text-neutral-400 text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 hover:text-rose-500 cursor-pointer">
                    <Heart className="w-3.5 h-3.5" /> {40 + block.stepIndex * 12}
                  </span>
                  <span className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                    <MessageCircle className="w-3.5 h-3.5" /> {8 + block.stepIndex * 2}
                  </span>
                  <span className="flex items-center gap-1 hover:text-emerald-500 cursor-pointer">
                    <Repeat className="w-3.5 h-3.5" /> {5 + block.stepIndex * 3}
                  </span>
                  <span className="flex items-center gap-1 hover:text-sky-500 cursor-pointer">
                    <Send className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(block.content, block.stepIndex, `Block ${block.stepIndex} copied!`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    {copiedBlock === block.stepIndex ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Block {block.stepIndex}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
