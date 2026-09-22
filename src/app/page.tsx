'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { NavigationTabs } from '@/components/NavigationTabs';
import { InputForm } from '@/components/InputForm';
import { StoryThreadForm } from '@/components/StoryThreadForm';
import { XThreadCard } from '@/components/cards/XThreadCard';
import { FacebookCard } from '@/components/cards/FacebookCard';
import { ThreadsCard } from '@/components/cards/ThreadsCard';
import { StoryThreadCard } from '@/components/cards/StoryThreadCard';
import { SkeletonLoader, EmptyState } from '@/components/SkeletonLoader';
import { Toast } from '@/components/Toast';
import { AppMode, FormInput, GeneratedResult, StoryThreadInput, StoryThreadResult } from '@/lib/types';
import { generateAIContent, generateStoryThreadContent } from '@/lib/aiGenerator';
import { copyToClipboard } from '@/lib/clipboard';
import { Sparkles, Layers, CheckCircle, BookOpen } from 'lucide-react';

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>('post_generator');

  // Single Post Generator State
  const [input, setInput] = useState<FormInput>({
    url: '',
    productName: '',
    details: '',
    platforms: ['x', 'facebook', 'threads'],
    tone: 'friendly',
  });
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [errors, setErrors] = useState<{ url?: string; productName?: string; platforms?: string }>({});

  // Story Thread Generator State
  const [storyInput, setStoryInput] = useState<StoryThreadInput>({
    topic: '',
    category: 'horror',
    details: '',
    url: '',
    threadLength: 4,
    tone: 'qa_answer',
  });
  const [storyResult, setStoryResult] = useState<StoryThreadResult | null>(null);
  const [storyErrors, setStoryErrors] = useState<{ topic?: string }>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopyText = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setToastMessage(label);
    } else {
      setToastMessage('ไม่สามารถคัดลอกข้อความได้');
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Validation for Single Post Generator
  const validateForm = (): boolean => {
    const newErrors: { url?: string; productName?: string; platforms?: string } = {};

    if (!input.url.trim()) {
      newErrors.url = 'Please enter a valid product affiliate URL';
    } else {
      try {
        new URL(input.url.trim());
      } catch {
        if (!input.url.toLowerCase().startsWith('http')) {
          newErrors.url = 'URL must start with http:// or https://';
        }
      }
    }

    if (!input.productName || !input.productName.trim()) {
      newErrors.productName = 'กรุณาระบุชื่อสินค้า เช่น รองเท้าแตะเพื่อสุขภาพ, เซรั่ม AMT, หูฟังไร้สาย';
    }

    if (input.platforms.length === 0) {
      newErrors.platforms = 'Select at least one social media platform';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for Story Thread Generator
  const validateStoryForm = (): boolean => {
    const newErrors: { topic?: string } = {};
    if (!storyInput.topic || !storyInput.topic.trim()) {
      newErrors.topic = 'กรุณาระบุหัวข้อเรื่องที่ต้องการเล่า เช่น เรื่องเล่าสยองขวัญหอพักเก่า, สรุปดราม่าล่าสุด';
    }
    setStoryErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Generate Single Post
  const handleGeneratePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const generated = await generateAIContent(input);
      setResult(generated);
    } catch (err: any) {
      console.error(err);
      handleCopyText('', err?.message || 'Error generating content. Please check API Key & URL.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Generate Story Thread
  const handleGenerateStoryThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStoryForm()) return;

    setIsLoading(true);
    setStoryResult(null);

    try {
      const generated = await generateStoryThreadContent(storyInput);
      setStoryResult(generated);
    } catch (err: any) {
      console.error(err);
      handleCopyText('', err?.message || 'Error generating story thread. Please check API Key.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Data Loader
  const handleLoadSample = () => {
    if (appMode === 'post_generator') {
      const sampleInput: FormInput = {
        url: 'https://s.shopee.co.th/affiliate_sample_headphone_2026',
        productName: 'หูฟังไร้สาย Bluetooth 5.4',
        details: 'มีระบบ ANC ตัดเสียงรบกวน 35dB แบตอึด 40 ชม. ล่าสุดกดมาได้ 286 บาทเองงง',
        platforms: ['x', 'facebook', 'threads'],
        tone: 'friendly',
      };
      setInput(sampleInput);
      setErrors({});
      handleCopyText('', 'Loaded demo product link & metadata!');
    } else {
      const sampleStory: StoryThreadInput = {
        topic: 'เรื่องเล่าสยองขวัญในหอพักเก่าชั้น 4 ที่ไม่มีใครกล้าขึ้นไปคนเดียว',
        category: 'horror',
        details: 'เรื่องเกิดขึ้นตอนย้ายเข้าหอพักใหม่ย่านมหาวิทยาลัย มีเสียงเคาะประตูตอนเที่ยงคืนทุกวัน',
        url: '',
        threadLength: 4,
        tone: 'storytelling',
      };
      setStoryInput(sampleStory);
      setStoryErrors({});
      handleCopyText('', 'Loaded demo horror story thread topic!');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      <Header onLoadSample={handleLoadSample} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Tabs Mode Switcher */}
        <NavigationTabs mode={appMode} onModeChange={setAppMode} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ----------------- LEFT PANEL: INPUT FORM ----------------- */}
          <div className="lg:col-span-5 space-y-6">
            {appMode === 'post_generator' ? (
              <InputForm
                input={input}
                onChange={setInput}
                onSubmit={handleGeneratePost}
                isLoading={isLoading}
                errors={errors}
              />
            ) : (
              <StoryThreadForm
                input={storyInput}
                onChange={setStoryInput}
                onSubmit={handleGenerateStoryThread}
                isLoading={isLoading}
                errors={storyErrors}
              />
            )}

            {/* Quick Tip Box */}
            <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  {appMode === 'post_generator'
                    ? 'Zero-Emoji & Natural Thai Copy Engine'
                    : 'Universal Storytelling Thread Engine (/Human Style)'}
                </span>
              </div>
              <p className="leading-relaxed text-amber-700 dark:text-amber-300/80">
                {appMode === 'post_generator' ? (
                  <>
                    • <strong className="font-semibold text-amber-900 dark:text-amber-200">Natural Spoken Thai</strong>: Writes like real modern social media creators (no stiff old TV commercials).
                    <br />
                    • <strong className="font-semibold text-amber-900 dark:text-amber-200">Working Clipboard Copy</strong>: Click copy on any block to copy text to clipboard.
                  </>
                ) : (
                  <>
                    • <strong className="font-semibold text-amber-900 dark:text-amber-200">Multi-Step Threading</strong>: Generates connected blocks (เรื่องผี, ข่าว, สาระ, ป้ายยา) without robotic intros.
                    <br />
                    • <strong className="font-semibold text-amber-900 dark:text-amber-200">Copy Entire Thread</strong>: One-click copy for the entire thread formatted for X & Threads.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* ----------------- RIGHT PANEL: GENERATED MOCKUP CARDS ----------------- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                {appMode === 'post_generator' ? (
                  <Layers className="w-4 h-4 text-neutral-500" />
                ) : (
                  <BookOpen className="w-4 h-4 text-neutral-500" />
                )}
                <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                  {appMode === 'post_generator' ? 'Generated Social Preview Cards' : 'Generated Story Thread Preview'}
                </h2>
              </div>
              {appMode === 'post_generator' && result && (
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Generated {result.metadata.productTitleHint}
                </span>
              )}
              {appMode === 'story_thread' && storyResult && (
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Generated {storyResult.blocks.length} Thread Blocks
                </span>
              )}
            </div>

            {/* State 1: Loading */}
            {isLoading && <SkeletonLoader />}

            {/* State 2: Empty State */}
            {!isLoading && appMode === 'post_generator' && !result && (
              <EmptyState onDemoClick={handleLoadSample} />
            )}
            {!isLoading && appMode === 'story_thread' && !storyResult && (
              <EmptyState onDemoClick={handleLoadSample} />
            )}

            {/* State 3: Display Single Post Results */}
            {!isLoading && appMode === 'post_generator' && result && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {result.x && (
                  <XThreadCard
                    data={result.x}
                    onCopy={(text, label) => handleCopyText(text, label)}
                  />
                )}
                {result.facebook && (
                  <FacebookCard
                    data={result.facebook}
                    onCopy={(text, label) => handleCopyText(text, label)}
                  />
                )}
                {result.threads && (
                  <ThreadsCard
                    data={result.threads}
                    onCopy={(text, label) => handleCopyText(text, label)}
                  />
                )}
              </div>
            )}

            {/* State 4: Display Story Thread Results */}
            {!isLoading && appMode === 'story_thread' && storyResult && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <StoryThreadCard
                  data={storyResult}
                  onCopy={(text, label) => handleCopyText(text, label)}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Product Post Generator &copy; {new Date().getFullYear()} — Powered by Natural AI Copywriting & Storytelling Engine
        </div>
      </footer>

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
