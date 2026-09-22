import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { StoryThreadInput, StoryThreadResult, ThreadCategory, AIProvider } from '@/lib/types';

function trimToMaxChars(text: string, maxLen = 270): string {
  if (!text || text.length <= maxLen) return text;
  let trimmed = text.slice(0, maxLen);
  const lastBoundary = Math.max(
    trimmed.lastIndexOf(' '),
    trimmed.lastIndexOf('.'),
    trimmed.lastIndexOf('!'),
    trimmed.lastIndexOf('ๆ'),
    trimmed.lastIndexOf('\n')
  );
  if (lastBoundary > 180) {
    trimmed = trimmed.slice(0, lastBoundary);
  }
  return trimmed.trim();
}

function buildStoryThreadPrompt(input: StoryThreadInput) {
  const { topic, category, details, url, threadLength, tone } = input;
  const hasUrl = Boolean(url && url.trim());
  const hasDetails = Boolean(details && details.trim());

  let categoryInstruction = '';
  switch (category) {
    case 'horror':
      categoryInstruction = `CATEGORY: HORROR & MYSTERY (เรื่องผี / เรื่องลี้ลับ)
Style & Flow:
- Block 1: Hook the reader with a terrifying, intriguing opening that leaves them wanting to read more in the thread.
- Middle Blocks: Build atmospheric suspense, eerie details, strange sounds/events, suspenseful escalation.
- Final Block: Chilling climax or resolution/warning for readers.`;
      break;

    case 'news':
      categoryInstruction = `CATEGORY: NEWS & DRAMA SUMMARY (สรุปข่าว / ประเด็นดราม่า)
Style & Flow:
- Block 1: Catchy headline hook summarizing the drama/news event.
- Middle Blocks: Clear timeline breakdown of what happened step 1, step 2, key evidence/facts, public reactions.
- Final Block: Current status, conclusion, or key takeaway.`;
      break;

    case 'knowledge':
      categoryInstruction = `CATEGORY: KNOWLEDGE & LIFE HACKS (สาระความรู้ / How-to)
Style & Flow:
- Block 1: High-value hook promising practical benefit or hacks.
- Middle Blocks: Actionable tips (1-2-3), practical breakdown, how to apply.
- Final Block: Summary and takeaway tip.`;
      break;

    case 'review':
      categoryInstruction = `CATEGORY: PRODUCT REVIEW & AFFILIATE (รีวิวป้ายยา)
Style & Flow:
- Block 1: Human recommendation hook ("สิ่งนี้เลยค่ะ...", "ตัวนี้เลยค่า อยากป้ายยา...").
- Middle Blocks: Real experience, problem solved, texture/specs, results after using.
- Final Block: Summary and call to action ${hasUrl ? `with affiliate link: ${url}` : ''}.`;
      break;

    case 'general':
    default:
      categoryInstruction = `CATEGORY: GENERAL STORYTELLING (เรื่องเล่าทั่วไป / ประสบการณ์ชีวิต)
Style & Flow:
- Block 1: Engaging hook about a memorable experience, fun story, or interesting topic.
- Middle Blocks: Narrative progression, funny/relatable moments, key insights.
- Final Block: Conclusion and final thought.`;
      break;
  }

  return `You are an expert Thai social media thread creator writing authentic, viral, and engaging threads for modern Thai readers on X (Twitter) and Meta Threads.

TOPIC / TITLE: "${topic}"
${categoryInstruction}
${hasDetails ? `STORY OUTLINE & DETAILS TO WEAVE IN:\n"${details.trim()}"` : ''}
${hasUrl ? `OPTIONAL LINK TO INCLUDE IN FINAL BLOCK:\n${url?.trim()}` : ''}
THREAD LENGTH: Exactly ${threadLength} connected blocks.

STRICT WRITING RULES:
1. NO ROBOTIC META INTROS:
   - Do NOT write robotic openers like ❌ "มีคนถามเข้ามาเยอะว่า...", ❌ "ขอเล่าเรื่อง...", ❌ "สวัสดีทุกคน".
   - Start Block 1 naturally with a strong hook that makes readers click to open the thread.
2. AUTHENTIC HUMAN THAI STYLE:
   - Use everyday modern spoken Thai. Natural, catchy, and readable phrasing.
   - For horror: use suspenseful language (สยองขวัญ, บรรยากาศเงียบสงัด, เสียงประหลาด).
   - For review/general: use natural spoken Thai slang ("คุ้มจริงงงง", "ป้ายยาความคุ้ม", "ลองดูตัวนี้").
3. STRICT ZERO EMOJIS RULE:
   - ABSOLUTELY NO EMOJIS AT ALL in any block. Zero emojis!
4. EXACT BLOCK COUNT & SCHEMA:
   - You MUST generate exactly ${threadLength} blocks.
   - Block 1 label: "Block 1: Hook (เปิดหัว)"
   - Middle blocks labels: e.g. "Block 2: เริ่มเรื่อง/ที่มา", "Block 3: เหตุการณ์พีค", etc.
   - Final block label: "Block ${threadLength}: บทสรุป${hasUrl ? ' & พิกัด' : ''}"
5. STRICT BLOCK LENGTH & HARD CHARACTER LIMIT (ห้ามเกิน 270 ตัวอักษรเด็ดขาด!):
   - TARGET LENGTH: Write BETWEEN 200 - 250 THAI CHARACTERS per block.
   - HARD MAXIMUM LIMIT: ABSOLUTELY NEVER EXCEED 270 THAI CHARACTERS per block! (Twitter hard limit is 280 chars).
   - Keep sentences concise, punchy, and under 250 characters so it never cuts off or gets blocked on Twitter/X.

6. STRICT FACT-BASED REAL-WORLD ACCURACY (ห้ามมั่วสถานที่ ชื่อเฉพาะ หรือประวัติศาสตร์เด็ดขาด):
   - This thread MUST be based on REAL documented facts about: "${topic}".
   - Keep real-world proper names (ชื่อสถานที่, ชื่อเมือง, ชื่อสถานี, ชื่อบุคคล) 100% exact and accurate based on real history.
   - Do NOT mix up place names or fabricate fake history (e.g. NEVER confuse Phillip Island with Point Nepean Quarantine Station).
   - If specific details/outline are provided in the input, follow those exact historical facts strictly.
   - Storytelling can be dramatic, suspenseful, and atmospheric, BUT ALL core facts, historical events, geographic locations, and scientific details MUST be 100% real and accurate according to documented history.

7. STRICT YEAR, DATE & NUMBER FIDELITY (ปี ค.ศ. / ตัวเลข ต้องตรงตามข้อเท็จจริง 100%):
   - If a specific year (e.g. ปี ค.ศ. 1924, ปี ค.ศ. 1852, ปี 2013), date, or number is mentioned in the STORY OUTLINE & DETAILS, you MUST use that EXACT year/number in the generated thread. NEVER invent, modify, or approximate a different year (e.g. NEVER change 1924 to 1927!).
   - If no specific year is provided in the input, do NOT make up or state specific numbers/years unless you are 100% historically certain of the exact real-world date.

OUTPUT FORMAT:
Output ONLY a valid JSON object matching this exact structure:
{
  "title": "${topic}",
  "blocks": [
    {
      "stepIndex": 1,
      "label": "Block 1: Hook (เปิดหัว)",
      "content": "Rich detailed opening hook post here between 200-250 Thai characters (no emojis, no URLs)"
    }
  ]
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: StoryThreadInput = await req.json();
    const { topic, category, details, url, threadLength, tone, provider: inputProvider, apiKey: clientApiKey } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Topic / Title is required' }, { status: 400 });
    }

    const cleanClientKey = clientApiKey?.trim();
    let provider: AIProvider = inputProvider || 'openai';

    if (cleanClientKey) {
      if (cleanClientKey.startsWith('sk-')) provider = 'openai';
      if (cleanClientKey.startsWith('AIza')) provider = 'gemini';
    }

    const envKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY;

    let apiKey = '';
    // Priority: Valid format client key > Environment variable key > Client key fallback
    if (cleanClientKey && (cleanClientKey.startsWith('sk-') || cleanClientKey.startsWith('AIza'))) {
      apiKey = cleanClientKey;
    } else if (envKey) {
      apiKey = envKey;
    } else if (cleanClientKey) {
      apiKey = cleanClientKey;
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            provider === 'openai'
              ? 'ไม่พบ OpenAI API Key (ChatGPT) กรุณากรอก API Key ในช่องตั้งค่า หรือตั้งค่า OPENAI_API_KEY ในไฟล์ .env ค่ะ'
              : 'ไม่พบ Gemini API Key กรุณากรอก API Key ในช่องตั้งค่า หรือตั้งค่า GEMINI_API_KEY ในไฟล์ .env ค่ะ',
        },
        { status: 400 }
      );
    }

    const systemPrompt = buildStoryThreadPrompt(body);
    let parsed: any = {};
    let providerName = '';

    if (provider === 'openai') {
      providerName = 'ChatGPT (OpenAI gpt-4o-mini)';
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a ${threadLength}-part story thread about topic: "${topic}" (${category})` },
        ],
      });
      const rawText = completion.choices[0]?.message?.content || '{}';
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse OpenAI story thread response:', rawText);
      }
    } else {
      providerName = 'Google Gemini (gemini-1.5-flash)';
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: systemPrompt,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      });
      const rawText = response.text || '{}';
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse Gemini story thread response:', rawText);
      }
    }

    const rawBlocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];

    const result: StoryThreadResult = {
      title: parsed.title || topic,
      category,
      blocks: rawBlocks.map((b: any, index: number) => ({
        stepIndex: index + 1,
        label: b.label || `Block ${index + 1}`,
        content: trimToMaxChars(b.content || '', 270),
        hasLink: index === rawBlocks.length - 1 && Boolean(url),
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        tone,
        providerUsed: providerName,
        url: url?.trim() || undefined,
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Story Thread Generation Error:', error);
    const errMessage = error?.message || '';
    const is401 = error?.status === 401 || error?.statusCode === 401 || errMessage.includes('401') || errMessage.includes('Incorrect API key') || errMessage.includes('invalid_api_key');

    const userFriendlyMessage = is401
      ? `API Key ไม่ถูกต้อง (401 Unauthorized): กรุณาลบหรือแก้ไข API Key ในช่องตั้งค่า "AI Model Settings" ค่ะ`
      : errMessage || 'เกิดข้อผิดพลาดในการสร้างเธรตเล่าเรื่อง';

    return NextResponse.json(
      { error: userFriendlyMessage },
      { status: is401 ? 401 : 500 }
    );
  }
}
