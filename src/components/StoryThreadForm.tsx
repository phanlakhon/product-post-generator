'use client';

import React, { useState, useEffect } from 'react';
import { StoryThreadInput, ThreadCategory, Tone, AIProvider } from '@/lib/types';
import { fetchRandomTopic } from '@/lib/aiGenerator';
import {
  BookOpen,
  FileText,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
  Key,
  Bot,
  ChevronDown,
  ChevronUp,
  Ghost,
  Newspaper,
  Lightbulb,
  ShoppingBag,
  MessageSquareQuote,
  Layers,
  Dices
} from 'lucide-react';

interface StoryThreadFormProps {
  input: StoryThreadInput;
  onChange: (input: StoryThreadInput) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  errors: { topic?: string; apiKey?: string };
}

export const StoryThreadForm: React.FC<StoryThreadFormProps> = ({
  input,
  onChange,
  onSubmit,
  isLoading,
  errors,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRandomizing, setIsRandomizing] = useState<boolean>(false);

  const handleRandomizeTopic = async () => {
    setIsRandomizing(true);
    try {
      const res = await fetchRandomTopic(input.category, input.provider, input.apiKey);
      if (res.topic) {
        onChange({
          ...input,
          topic: res.topic,
          details: res.details || input.details,
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRandomizing(false);
    }
  };

  useEffect(() => {
    const currentProvider = input.provider || 'openai';
    const savedKey = localStorage.getItem(`${currentProvider}_api_key`);
    if (savedKey && !input.apiKey) {
      onChange({ ...input, apiKey: savedKey });
    }
  }, [input.provider]);

  const handleProviderChange = (provider: AIProvider) => {
    const savedKey = localStorage.getItem(`${provider}_api_key`) || '';
    onChange({ ...input, provider, apiKey: savedKey });
  };

  const handleApiKeyChange = (key: string) => {
    const provider = input.provider || 'openai';
    localStorage.setItem(`${provider}_api_key`, key);
    onChange({ ...input, apiKey: key });
  };

  const selectedProvider = input.provider || 'openai';

  const categories: { id: ThreadCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'horror', label: 'เรื่องผี / ลี้ลับ', icon: <Ghost className="w-4 h-4 text-purple-500" />, desc: 'เรื่องสยองขวัญ ปะติดปะต่อปม' },
    { id: 'news', label: 'สรุปข่าว / ดราม่า', icon: <Newspaper className="w-4 h-4 text-sky-500" />, desc: 'สรุปกระแส ลำดับเหตุการณ์' },
    { id: 'knowledge', label: 'สาระความรู้ / How-to', icon: <Lightbulb className="w-4 h-4 text-amber-500" />, desc: 'ทริกชีวิต เทคนิคใช้งาน' },
    { id: 'review', label: 'รีวิวป้ายยา (Affiliate)', icon: <ShoppingBag className="w-4 h-4 text-orange-500" />, desc: 'ลองจริง พิกัดสินค้า' },
    { id: 'general', label: 'เรื่องเล่าทั่วไป', icon: <MessageSquareQuote className="w-4 h-4 text-emerald-500" />, desc: 'ประสบการณ์ ข้อคิด ฮาๆ' },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
              Story Thread Configuration
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              สร้างเธรตเล่าเรื่องหลากสเต็ป (เรื่องผี/ข่าว/สาระ/ป้ายยา)
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* 1. Category Picker */}
        <div>
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2 block">
            หมวดหมู่เธรตเล่าเรื่อง <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ ...input, category: cat.id })}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  input.category === cat.id
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-100 ring-2 ring-amber-500/20 shadow-sm'
                    : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="mt-0.5 shrink-0">{cat.icon}</div>
                <div>
                  <div className="text-xs font-bold leading-snug">{cat.label}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-normal">
                    {cat.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Topic Input */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Story Topic / Title (หัวข้อเรื่องที่ต้องการเล่า) <span className="text-rose-500">*</span>
            </span>
            <button
              type="button"
              disabled={isRandomizing}
              onClick={handleRandomizeTopic}
              className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 flex items-center gap-1 px-2.5 py-1 bg-amber-100/80 dark:bg-amber-950/90 border border-amber-300/80 dark:border-amber-800 rounded-lg transition-all cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
            >
              <Dices className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isRandomizing ? 'animate-spin' : ''}`} />
              <span>{isRandomizing ? 'กำลังสุ่มเรื่องจริง...' : '🎲 สุ่มหัวข้อเรื่องจริง'}</span>
            </button>
          </label>
          <input
            type="text"
            placeholder={
              input.category === 'horror'
                ? 'เช่น เรื่องเล่าสยองขวัญหอพักเก่าชั้น 4'
                : input.category === 'news'
                ? 'เช่น สรุปประเด็นดราม่าร้อนประจำวัน'
                : input.category === 'knowledge'
                ? 'เช่น 5 ทริกบริหารเวลาประหยัดเวลาวันละ 2 ชั่วโมง'
                : input.category === 'review'
                ? 'เช่น มหากาพย์กู้ผิวแห้งคันข้ามคืนด้วยมอยเจอร์ไรเซอร์ AMT'
                : 'เช่น ประสบการณ์เที่ยวต่างประเทศครั้งแรกคนเดียว'
            }
            value={input.topic}
            onChange={(e) => onChange({ ...input, topic: e.target.value })}
            className={`w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-neutral-100 rounded-xl border ${
              errors.topic
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-neutral-200 dark:border-neutral-800 focus:border-amber-500 dark:focus:border-amber-500'
            } focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-neutral-400`}
          />
          {errors.topic && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.topic}
            </p>
          )}
        </div>

        {/* 3. Story Outline / Details */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Story Details & Outline (รายละเอียด/ปมสำคัญ) <span className="text-neutral-400 font-normal">(Optional)</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-normal">
              {input.details.length}/500
            </span>
          </label>
          <textarea
            rows={3}
            maxLength={500}
            placeholder="ใส่รายละเอียดสำคัญ ปมผี จุดพีค หรือข้อเท็จจริงที่อยากให้ AI นำไปแต่งเรื่องต่อ..."
            value={input.details}
            onChange={(e) => onChange({ ...input, details: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-neutral-100 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:border-amber-500 dark:focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-neutral-400 resize-none"
          />
        </div>

        {/* 4. Reference Link or Affiliate URL (Optional) */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            <span className="flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-amber-500" />
              Reference Link / Affiliate URL <span className="text-neutral-400 font-normal">(Optional)</span>
            </span>
          </label>
          <input
            type="text"
            placeholder="https://s.shopee.co.th/... (หากต้องการให้ใส่ลิงก์พิกัดในบล็อกสุดท้าย)"
            value={input.url || ''}
            onChange={(e) => onChange({ ...input, url: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-neutral-100 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-neutral-400"
          />
        </div>

        {/* 5. Thread Length Selector */}
        <div>
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            จำนวนบล็อกในเธรต (Thread Length)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange({ ...input, threadLength: num })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  input.threadLength === num
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-amber-400'
                }`}
              >
                {num} บล็อก
              </button>
            ))}
          </div>
        </div>

        {/* 6. Tone of Voice Selector */}
        <div>
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2 block">
            Tone of Voice (โทนการเล่า)
          </label>
          <select
            value={input.tone}
            onChange={(e) => onChange({ ...input, tone: e.target.value as Tone })}
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-neutral-100 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all cursor-pointer font-medium"
          >
            <option value="qa_answer">Real Human Comment / Reply (ฟีลป้ายยา/พูดคุย)</option>
            <option value="storytelling">Storytelling & Suspense (เล่าเรื่องสนุกตื่นเต้น)</option>
            <option value="reviewer">Reviewer Analysis (วิเคราะห์สไตล์ผู้เชี่ยวชาญ)</option>
            <option value="friendly">Friendly & Casual (เป็นกันเองสบายๆ)</option>
            <option value="hard_sale">Hard Sale & Urgency (กระตุ้นดีลโปรโมชั่น)</option>
          </select>
        </div>

        {/* 7. AI Model Settings (Collapsible) */}
        <div className="p-4 bg-gradient-to-br from-amber-50/50 via-neutral-50 to-orange-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-amber-950/20 border border-amber-200/60 dark:border-neutral-800 rounded-xl transition-all">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-amber-500" />
              <span>AI Model Settings (Optional API Key)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {selectedProvider === 'openai' ? 'ChatGPT' : 'Gemini'}
              </span>
              {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </div>
          </button>

          {isOpen && (
            <div className="mt-3.5 pt-3.5 border-t border-neutral-200/60 dark:border-neutral-800 space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleProviderChange('openai')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedProvider === 'openai'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-amber-400'
                  }`}
                >
                  🤖 ChatGPT (OpenAI)
                </button>
                <button
                  type="button"
                  onClick={() => handleProviderChange('gemini')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedProvider === 'gemini'
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-orange-400'
                  }`}
                >
                  ✨ Google Gemini
                </button>
              </div>

              <div>
                <input
                  type="password"
                  placeholder={
                    selectedProvider === 'openai'
                      ? 'วาง OpenAI API Key (sk-proj-...)'
                      : 'วาง Gemini API Key (AIzaSy...)'
                  }
                  value={input.apiKey || ''}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 rounded-lg border border-neutral-300 dark:border-neutral-800 focus:border-amber-500 focus:outline-none font-mono placeholder:font-sans placeholder:text-neutral-400 shadow-inner"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating Story Thread...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200 fill-current" />
              <span>Generate Story Thread ({input.threadLength} Blocks)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
