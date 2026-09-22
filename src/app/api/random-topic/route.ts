import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { ThreadCategory, AIProvider } from '@/lib/types';

function buildRandomTopicPrompt(category: ThreadCategory, seed: number) {
  let categoryGuidance = '';

  switch (category) {
    case 'horror':
      categoryGuidance = `CATEGORY: HORROR & REAL MYSTERIES (เรื่องผี / เรื่องลี้ลับที่มีอยู่จริง)
STRICT RULE: You MUST choose a 100% REAL-WORLD documented mystery, haunted location, or famous historical urban legend (e.g., Cecil Hotel, Dyatlov Pass Incident, Mary Celeste ghost ship, Overtoun Bridge, Winchester Mystery House, Snake Island, Aokigahara, Paris Catacombs, etc.). NEVER invent a fake fictional story!`;
      break;

    case 'news':
      categoryGuidance = `CATEGORY: REAL NEWS & TRENDING TOPICS (สรุปข่าว / ประเด็นดราม่าจริง)
STRICT RULE: Choose a real, current or famous viral news event, technology breakthrough, or trending global issue. Must be real.`;
      break;

    case 'knowledge':
      categoryGuidance = `CATEGORY: REAL KNOWLEDGE & SCIENCE (สาระความรู้ / ปรากฏการณ์จริง)
STRICT RULE: Choose a real, fascinating science, psychology phenomenon, or productivity concept (e.g., Baader-Meinhof Phenomenon, Pareto Principle, Pomodoro technique, Cognitive Dissonance, Theory of Relativity).`;
      break;

    case 'review':
      categoryGuidance = `CATEGORY: PRODUCT REVIEW & RECOMMENDATION (รีวิวป้ายยาสินค้า)
Choose a popular, high-demand real product category (e.g., มอยเจอร์ไรเซอร์ AMT Liposome, หูฟังไร้สาย Bluetooth 5.4 ANC, เซรั่มไฮยาลูรอน, กระทะมินิมอลเตาไฟฟ้า).`;
      break;

    case 'general':
    default:
      categoryGuidance = `CATEGORY: GENERAL INTERESTING REAL STORIES (เรื่องเล่าเรื่องจริงอเนกประสงค์)
Choose a remarkable real-life story, famous historical event, or incredible human achievement. Must be real.`;
      break;
  }

  return `You are a creative researcher for a viral Thai social media content creator.
Your goal is to suggest 1 UNIQUE, highly captivating, 100% REAL-WORLD topic and brief outline.

${categoryGuidance}

Random Seed Identifier: ${seed}-${Date.now()}
Ensure the suggestion is fresh, unique, and intriguing for Thai social media readers on X (Twitter) and Threads.

Output ONLY a valid JSON object matching this exact schema:
{
  "topic": "Catchy headline in Thai describing the real topic (e.g., ปริศนาคดีมรณกรรมแห่งโรงแรม Cecil Hotel)",
  "details": "Brief 2-3 sentence background facts and key points in Thai"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, provider: inputProvider, apiKey: clientApiKey } = body;

    const targetCategory: ThreadCategory = category || 'horror';
    const cleanClientKey = clientApiKey?.trim();
    let provider: AIProvider = inputProvider || 'openai';

    if (cleanClientKey) {
      if (cleanClientKey.startsWith('sk-')) provider = 'openai';
      if (cleanClientKey.startsWith('AIza')) provider = 'gemini';
    }

    const envKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY;

    let apiKey = '';
    if (cleanClientKey && (cleanClientKey.startsWith('sk-') || cleanClientKey.startsWith('AIza'))) {
      apiKey = cleanClientKey;
    } else if (envKey) {
      apiKey = envKey;
    } else if (cleanClientKey) {
      apiKey = cleanClientKey;
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ไม่พบ API Key สำหรับสุ่มหัวข้อ' },
        { status: 400 }
      );
    }

    const seed = Math.floor(Math.random() * 100000);
    const systemPrompt = buildRandomTopicPrompt(targetCategory, seed);

    let parsed: any = {};

    if (provider === 'openai') {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.9, // Higher temp for creative variety
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Suggest 1 unique REAL topic for category "${targetCategory}" with random seed ${seed}` },
        ],
      });
      const rawText = completion.choices[0]?.message?.content || '{}';
      parsed = JSON.parse(rawText);
    } else {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: systemPrompt,
        config: {
          temperature: 0.9,
          responseMimeType: 'application/json',
        },
      });
      const rawText = response.text || '{}';
      parsed = JSON.parse(rawText);
    }

    return NextResponse.json({
      topic: parsed.topic || 'เรื่องเล่าปริศนารอบโลก',
      details: parsed.details || '',
    });
  } catch (error: any) {
    console.error('Random Topic Error:', error);
    return NextResponse.json(
      { error: error?.message || 'เกิดข้อผิดพลาดในการสุ่มหัวข้อเรื่อง' },
      { status: 500 }
    );
  }
}
