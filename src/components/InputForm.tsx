'use client';

import React, { useState, useEffect } from 'react';
import { FormInput, Platform, Tone, AIProvider } from '@/lib/types';
import { XTwitterIcon, FacebookIcon, ThreadsIcon } from '@/components/Icons';
import { 
  Link, 
  ShoppingBag,
  FileText, 
  CheckSquare, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  SlidersHorizontal,
  Key,
  Bot,
  ChevronDown,
  ChevronUp,
  X as ClearIcon
} from 'lucide-react';

interface InputFormProps {
  input: FormInput;
  onChange: (input: FormInput) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  errors: { url?: string; productName?: string; platforms?: string; apiKey?: string };
}

export const InputForm: React.FC<InputFormProps> = ({
  input,
  onChange,
  onSubmit,
  isLoading,
  errors,
}) => {
  // Default collapsible state to closed/collapsed (false)
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Auto load saved API key from localStorage based on provider
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

  const handlePlatformToggle = (platform: Platform) => {
    const current = input.platforms;
    const exists = current.includes(platform);
    let updated: Platform[];
    if (exists) {
      updated = current.filter((p) => p !== platform);
    } else {
      updated = [...current, platform];
    }
    onChange({ ...input, platforms: updated });
  };

  const handleSelectAllPlatforms = () => {
    if (input.platforms.length === 3) {
      onChange({ ...input, platforms: [] });
    } else {
      onChange({ ...input, platforms: ['x', 'facebook', 'threads'] });
    }
  };

  const selectedProvider = input.provider || 'openai';

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/80 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
              Post Generator Configuration
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Enter your affiliate link and target platforms
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* 1. AI Provider Selector & API Key (Collapsible, Default = Closed) */}
        <div className="p-4 bg-gradient-to-br from-orange-50/50 via-neutral-50 to-amber-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-orange-950/20 border border-orange-200/60 dark:border-neutral-800 rounded-xl transition-all">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-orange-500" />
              <span>AI Model Settings (Optional API Key)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                {selectedProvider === 'openai' ? 'ChatGPT' : 'Gemini'}
              </span>
              {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </div>
          </button>

          {isOpen && (
            <div className="mt-3.5 pt-3.5 border-t border-neutral-200/60 dark:border-neutral-800 space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-2">
                {/* ChatGPT OpenAI */}
                <button
                  type="button"
                  onClick={() => handleProviderChange('openai')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedProvider === 'openai'
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-orange-400'
                  }`}
                >
                  <span>🤖 ChatGPT (OpenAI)</span>
                </button>

                {/* Google Gemini */}
                <button
                  type="button"
                  onClick={() => handleProviderChange('gemini')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedProvider === 'gemini'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-amber-400'
                  }`}
                >
                  <span>✨ Google Gemini</span>
                </button>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                    <Key className="w-3 h-3 text-orange-500" />
                    {selectedProvider === 'openai' ? 'OpenAI API Key (sk-...)' : 'Gemini API Key (AIzaSy...)'}
                    <span className="text-neutral-400 font-normal ml-1">(Optional if set in .env)</span>
                  </label>
                </div>
                <input
                  type="password"
                  placeholder={
                    selectedProvider === 'openai'
                      ? 'วาง OpenAI API Key ของคุณที่นี่ (sk-proj-...)'
                      : 'วาง Gemini API Key ของคุณที่นี่ (AIzaSy...)'
                  }
                  value={input.apiKey || ''}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 rounded-lg border border-neutral-300 dark:border-neutral-800 focus:border-orange-500 focus:outline-none font-mono placeholder:font-sans placeholder:text-neutral-400 shadow-inner"
                />
                <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                  {selectedProvider === 'openai'
                    ? 'ระบบจะใช้ ChatGPT (gpt-4o-mini) ประมวลผลและใช้ API Key ใน .env หากเว้นว่างไว้'
                    : 'ระบบจะใช้ Google Gemini (gemini-1.5-flash) ประมวลผล'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Product URL Input */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            <span className="flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-orange-500" />
              Affiliate Product URL <span className="text-rose-500">*</span>
            </span>
            {input.url && (
              <button
                type="button"
                onClick={() => onChange({ ...input, url: '' })}
                className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
              >
                <ClearIcon className="w-3 h-3" /> Clear
              </button>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="https://s.shopee.co.th/... or https://shopee.co.th/product/..."
              value={input.url}
              onChange={(e) => onChange({ ...input, url: e.target.value })}
              className={`w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-neutral-100 rounded-xl border ${
                errors.url
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-neutral-200 dark:border-neutral-800 focus:border-orange-500 dark:focus:border-orange-500'
              } focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:text-neutral-400`}
            />
          </div>
          {errors.url && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.url}
            </p>
          )}
        </div>

        {/* 3. Product Name / Category Input */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
              Product Name / Category (ชื่อสินค้าหรือประเภทสินค้า) <span className="text-rose-500">*</span>
            </span>
          </label>
          <input
            type="text"
            placeholder="เช่น รองเท้าแตะเพื่อสุขภาพ, เซรั่ม AMT, พรมปูพื้น 3D"
            value={input.productName || ''}
            onChange={(e) => onChange({ ...input, productName: e.target.value })}
            className={`w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-neutral-100 rounded-xl border ${
              errors.productName
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-neutral-200 dark:border-neutral-800 focus:border-orange-500 dark:focus:border-orange-500'
            } focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:text-neutral-400`}
          />
          {errors.productName ? (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.productName}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              ระบุชื่อสินค้าเพื่อให้ AI เขียนโพสต์เจาะจงสินค้าตรงปก 100% (เช่น รองเท้าแตะสุขภาพ, มอยเจอร์ไรเซอร์)
            </p>
          )}
        </div>

        {/* 4. Product Details & Highlights (Optional) */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              Product Details & Highlights <span className="text-neutral-400 font-normal">(Optional)</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-normal">
              {input.details.length}/300
            </span>
          </label>
          <textarea
            rows={3}
            maxLength={300}
            placeholder="Add key selling points, price drop details (เช่น ล่าสุดกดมาได้ 286 บาทเอง), or special voucher codes..."
            value={input.details}
            onChange={(e) => onChange({ ...input, details: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-neutral-100 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:text-neutral-400 resize-none"
          />
        </div>

        {/* 5. Platform Selector (X, Facebook, Threads) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-orange-500" />
              Target Platforms <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleSelectAllPlatforms}
              className="text-[11px] font-medium text-neutral-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
            >
              {input.platforms.length === 3 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* X (Twitter) */}
            <button
              type="button"
              onClick={() => handlePlatformToggle('x')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                input.platforms.includes('x')
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-sm'
                  : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <XTwitterIcon className="w-3.5 h-3.5 shrink-0" />
              <span>X (Twitter)</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handlePlatformToggle('facebook')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                input.platforms.includes('facebook')
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Facebook</span>
            </button>

            {/* Threads */}
            <button
              type="button"
              onClick={() => handlePlatformToggle('threads')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                input.platforms.includes('threads')
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <ThreadsIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Threads</span>
            </button>
          </div>

          {errors.platforms && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.platforms}
            </p>
          )}
        </div>

        {/* 6. Tone of Voice */}
        <div>
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2 block">
            Tone of Voice
          </label>
          <select
            value={input.tone}
            onChange={(e) => onChange({ ...input, tone: e.target.value as Tone })}
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-neutral-100 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all cursor-pointer font-medium"
          >
            <option value="friendly">Friendly & Natural (Default)</option>
            <option value="qa_answer">Real Human Reply / Recommendation (ฟีลคอมเมนต์ป้ายยาแบบคนจริง)</option>
            <option value="hard_sale">Hard Sale & Urgency</option>
            <option value="reviewer">Reviewer / Expert Analysis</option>
            <option value="storytelling">Storytelling & Personal Experience</option>
          </select>
        </div>

        {/* 7. Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating AI Posts...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200 fill-current" />
              <span>Generate Posts (Shopee Edition)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
