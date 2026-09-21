import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { FormInput, GeneratedResult, Tone, AIProvider } from '@/lib/types';

// Real URL scraper to extract real page title and description from the affiliate link
async function scrapeUrlMetadata(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const ogTitleMatch =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : '';

    const ogDescMatch =
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : '';

    return {
      title: ogTitle || title,
      description: ogDesc,
    };
  } catch {
    return null;
  }
}

// System prompt instructing AI to strictly use specified product name & user details
// Helper to extract string content from various possible AI JSON key names
function extractField(obj: any, keys: string[]): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj.trim();
  for (const k of keys) {
    if (typeof obj[k] === 'string' && obj[k].trim()) {
      return obj[k].trim();
    }
  }
  return '';
}

// System prompt instructing AI to strictly generate distinct, non-empty content for X, Facebook, and Threads
function buildSystemPrompt(
  url: string,
  productName: string | undefined,
  scrapedData: { title: string; description: string } | null,
  details: string,
  tone: Tone,
  platforms: string[]
) {
  const targetProduct = productName?.trim() || scrapedData?.title || 'สินค้าไอเทมเด็ด';
  const hasDetails = Boolean(details.trim());
  const webContext = scrapedData?.description ? `Scraped Web Meta: "${scrapedData.description}"` : '';

  let toneInstruction = '';
  switch (tone) {
    case 'qa_answer':
      toneInstruction = `Write as a REAL HUMAN social media comment/reply ("ป้ายยา"). DO NOT intro with meta-commentary like "มีคนถามเข้ามาว่า..." or "ขอตอบคำถามนะ...". Jump STRAIGHT into recommending with natural openings like "สิ่งนี้เลยค่ะ...", "ตัวนี้เลยค่า...", "อันนี้เลย!". Use real conversational Thai words like "คุ้มจริงงงง", "ป้ายยาความคุ้ม", "เค้าได้มาในราคา...", "ของเค้าดีจริงค่ะ".`;
      break;
    case 'hard_sale':
      toneInstruction = `Write with high urgency and deal focus. Highlight special pricing, limited vouchers, and reasons to buy right now.`;
      break;
    case 'reviewer':
      toneInstruction = `Write as an analytical product expert. Break down key features, practical performance, texture/materials, and real user pros.`;
      break;
    case 'storytelling':
      toneInstruction = `Write as a personal experience story. Tell a relatable before-and-after journey of discovering this product and how it solved a daily problem.`;
      break;
    case 'friendly':
    default:
      toneInstruction = `Write in a warm, casual, everyday modern Thai creator tone, like sharing a great discovery with close friends.`;
      break;
  }

  return `You are an expert Thai social media affiliate reviewer and copywriter. Your goal is to write 100% ORIGINAL, natural, authentic, human social media comments and posts for modern Thai readers across X (Twitter), Facebook, and Threads.

TARGET PRODUCT IDENTITY:
- Product Name/Category: "${targetProduct}"
${hasDetails ? `- User-provided Highlights & Deal Price: "${details.trim()}"` : '- User Highlights: None explicitly provided.'}
${webContext}
- Affiliate URL: ${url}
- Requested Tone of Voice: ${tone} (${toneInstruction})

STRICT HUMAN COPYWRITING RULES (/HUMAN THAI STYLE):
1. ABSOLUTELY NO ROBOT / META INTROS:
   - NEVER write robotic meta intros: ❌ "มีคนถามเข้ามาเยอะว่า...", ❌ "ขอตอบคำถามเรื่อง...", ❌ "ตอบคนที่กำลังหา...", ❌ "สวัสดีทุกคน", ❌ "เรามีปัญหา...กันไหม?".
   - In social media replies/posts, real humans NEVER state that they are answering a question. They jump DIRECTLY into recommending!
   - Open naturally like real human comments:
     ✅ "สิ่งนี้เลยค่ะ [ชื่อสินค้าแบบสั้น/เป็นธรรมชาติ] ถูกและดีมีอยู่จริง [รายละเอียดราคา/ดีล] เราได้มาราคานี้ คือคุ้มจริงงงง"
     ✅ "ตัวนี้เลยค่า อยากจะป้ายยาความคุ้มและความใช้ดีของสิ่งนี้ค่ะะะะ [จุดเด่น] เค้าได้มาในราคาที่ดีมาก ๆ อยากให้ทุกคนลอง ของเค้าดีจริงค่ะ"

2. AUTHENTIC HUMAN VOCABULARY & EXPRESSIONS:
   - Use real human creator vocabulary & Thai slang: "ป้ายยา", "คุ้มจริงงงง", "ถูกและดีมีอยู่จริง", "เค้าได้มาในราคา...", "ของเค้าดีจริงค่ะ", "ผิวนุ่มฟูสุดๆ", "เนื้อซึมไว".
   - You may use repeated Thai letters for natural human typing emphasis (e.g. "คุ้มจริงงงง", "ดีมากกก", "ค่าะะะ").

3. FLEXIBLE NATURAL PRODUCT NAMING:
   - You DO NOT need to copy-paste the exact string "${targetProduct}" word-for-word if it sounds awkward!
   - Mention the item naturally in Thai (e.g. if the input is "AMT Emulsion มอยเจอร์ไรเซอร์", say "มอยAMT", "มอยเจอร์ไรเซอร์ AMT", or "ตัว AMT Emulsion").

4. SINCERE PRODUCT RESEARCH & SPECIFIC DETAILS ("ดูจริงใจ"):
   - Perform virtual product research using your extensive knowledge base about "${targetProduct}".
   - Include realistic, specific details about this category of product (e.g., key ingredients, materials, texture, sensory feel, battery/spec details, target skin type or usage scenario).

5. STRICT CONSTRAINTS:
   - STRICT ZERO EMOJIS RULE: Do NOT use any emojis anywhere in any post. Zero emojis!
   - X (Twitter): "mainPost" MUST be 180-245 Thai characters (strictly under 280 limit). No URLs, no emojis.
   - Facebook: "fullPost" MUST be a detailed long-form review (3-4 paragraphs or dash bullet points -). Include rich product research details, benefits, pricing/promo, and CTA with affiliate link (${url}) at bottom. No emojis.
   - Threads: "mainPost" MUST be 250-400 Thai characters. Catchy, text-first post. No URLs, no emojis.

OUTPUT FORMAT:
Output ONLY a valid JSON object matching this exact structure:
{
  "x": {
    "mainPost": "Twitter main post text (180-245 chars)",
    "replyPost": "พิกัดตรงนี้เลย:\\n${url}"
  },
  "facebook": {
    "fullPost": "Full long-form Facebook review post with researched details and link at bottom"
  },
  "threads": {
    "mainPost": "Threads review post text (250-400 chars)",
    "replyPost": "พิกัดตรงนี้เลย:\\n${url}"
  },
  "productTitleHint": "${targetProduct}"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: FormInput = await req.json();
    const { url, productName, details, platforms, tone, provider: inputProvider, apiKey: clientApiKey } = body;

    if (!url) {
      return NextResponse.json({ error: 'Product URL is required' }, { status: 400 });
    }

    const cleanClientKey = clientApiKey?.trim();
    let provider: AIProvider = inputProvider || 'openai';

    // Auto-detect provider if client key is explicitly passed
    if (cleanClientKey) {
      if (cleanClientKey.startsWith('sk-')) provider = 'openai';
      if (cleanClientKey.startsWith('AIza')) provider = 'gemini';
    }

    const envKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY;
    const apiKey = cleanClientKey || envKey;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            provider === 'openai'
              ? 'ไม่พบ OpenAI API Key (ChatGPT) กรุณากรอก API Key (ขึ้นต้นด้วย sk-...) ในช่องตั้งค่า หรือตั้งค่า OPENAI_API_KEY ในไฟล์ .env ค่ะ'
              : 'ไม่พบ Gemini API Key กรุณากรอก API Key ในช่องตั้งค่า หรือตั้งค่า GEMINI_API_KEY ในไฟล์ .env ค่ะ',
        },
        { status: 400 }
      );
    }

    // 1. Scrape webpage metadata
    const scrapedData = await scrapeUrlMetadata(url);
    const targetProduct = productName?.trim() || scrapedData?.title || 'สินค้าไอเทมเด็ด';
    const systemPrompt = buildSystemPrompt(url, productName, scrapedData, details, tone, platforms);

    let parsed: any = {};
    let providerName = '';

    // 2. Call OpenAI (ChatGPT) or Google Gemini
    if (provider === 'openai') {
      providerName = 'ChatGPT (OpenAI gpt-4o-mini)';
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate social media posts for product "${targetProduct}" with promo details "${details}" for URL: ${url}` },
        ],
      });
      const rawText = completion.choices[0]?.message?.content || '{}';
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse OpenAI response:', rawText);
      }
    } else {
      providerName = 'Google Gemini (gemini-1.5-flash)';
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const rawText = response.text || '{}';
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse Gemini response:', rawText);
      }
    }

    const result: GeneratedResult = {
      metadata: {
        generatedAt: new Date().toISOString(),
        productTitleHint: targetProduct,
        url,
        tone,
        providerUsed: providerName,
      },
    };

    // Extract platform texts with multiple fallback key lookups
    const xMain = extractField(parsed.x, ['mainPost', 'post', 'content', 'text', 'main_post']);
    const fbPost = extractField(parsed.facebook, ['fullPost', 'post', 'content', 'full_post', 'text', 'mainPost']);
    const threadsMain = extractField(parsed.threads, ['mainPost', 'post', 'content', 'text', 'main_post']);

    const highlightText = details.trim() ? ` ${details.trim()}` : '';

    if (platforms.includes('x')) {
      result.x = {
        mainPost: xMain || `ใครกำลังมองหา ${targetProduct} บอกเลยว่าตัวนี้ตอบโจทย์มาก คุณภาพดีเกินคาด${highlightText} ใครเล็งอยู่แนะนำจัดเลย`,
        replyPost: `พิกัดตรงนี้เลย:\n${url}`,
      };
    }

    if (platforms.includes('facebook')) {
      result.facebook = {
        fullPost: fbPost || `ใครกำลังมองหา ${targetProduct} แนะนำตัวนี้เลยครับ!\n\nดีไซน์สวย ใช้งานสะดวก และคุ้มค่ามากๆ${highlightText ? `\n\nไฮไลท์เด็ด: ${highlightText}` : ''}\n\nพิกัดสั่งซื้อตรงนี้เลย:\n${url}`,
      };
    }

    if (platforms.includes('threads')) {
      result.threads = {
        mainPost: threadsMain || `ใครกำลังมองหา ${targetProduct} บอกเลยว่าตัวนี้ตอบโจทย์สุดๆ${highlightText} ใครสนใจดูพิกัดในคอมเมนต์ได้เลย`,
        replyPost: `พิกัดตรงนี้เลย:\n${url}`,
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'เกิดข้อผิดพลาดในการประมวลผลจาก AI' },
      { status: 500 }
    );
  }
}
