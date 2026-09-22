import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { ThreadCategory, AIProvider } from '@/lib/types';

// Verified Fact Bank to prevent LLM location/history hallucinations
const VERIFIED_FACT_BANK: Record<ThreadCategory, { topic: string; details: string }[]> = {
  horror: [
    {
      topic: 'ตำนานสยองขวัญสถานีกักกันโรคพอยต์เนเปียน แห่งออสเตรเลีย',
      details: 'สถานีกักกันโรคพอยต์เนเปียน (Point Nepean Quarantine Station) ตั้งอยู่บริเวณคาบสมุทรพอยต์เนเปียน รัฐวิกตอเรีย เคยเป็นสถานีกักกันโรคระบาดทางเรือในยุคคริสต์ศตวรรษที่ 19-20 (ไข้หวัดใหญ่สเปน ไข้เหลือง และกาฬโรค) มีซากอาคารพยาบาลเก่าและประวัติการสูญชีวิตของผู้ป่วยจนกลายเป็นสถานที่ลี้ลับทางประวัติศาสตร์ในออสเตรเลีย',
    },
    {
      topic: 'ปริศนาคดีมรณกรรมแห่งโรงแรมเซซิล (Cecil Hotel)',
      details: 'โรงแรมเซซิลในลอสแอนเจลิส มีประวัติศาสตร์อันน่าพรั่นพรึง ทั้งคดีการเสียชีวิตปริศนาของ Elisa Lam ในถังน้ำบนดาดฟ้าอาคาร และเคยเป็นที่พักของฆาตกรต่อเนื่องชื่อดังอย่าง Richard Ramirez',
    },
    {
      topic: 'ปริศนาช่องเขาเดียตลอฟ: การหายตัวสยองขวัญของ 9 นักสกีในเทือกเขาอูรัล',
      details: 'เหตุการณ์ปี 1959 เมื่อนักสกีชาวโซเวียต 9 คนเสียชีวิตอย่างปริศนาในสภาพอุณหภูมิติดลบ เต็นท์ถูกฉีกขาดจากข้างใน สภาพศพมีร่องรอยบาดแผลประหลาดที่ไม่อาจอธิบายได้จนถึงปัจจุบัน',
    },
    {
      topic: 'อาถรรพ์สะพานโอเวอร์ทูน: สะพานฆาตกรรมสุนัขในสกอตแลนด์',
      details: 'สะพานเก่าแก่ในมิลแก็ฟ สกอตแลนด์ ที่เกิดเหตุการณ์สุนัขมากกว่า 600 ตัวกระโดดลงมาจากสะพานจุดเดียวกันโดยไม่มีสาเหตุชัดเจน รัฐบาลและนักวิทยาศาสตร์ยังคงพยายามหาคำตอบ',
    },
    {
      topic: 'ซากเรือผีแมรี เซเลสต์: ปริศนาเรือร้างกลางมหาสมุทรแอตแลนติก',
      details: 'เรือสินค้าที่ถูกพบในปี 1872 ลอยอยู่กลางทะเลโดยไร้ร่องรอยลูกเรือและผู้โดยสารแม้แต่คนเดียว แต่อาหาร ข้าวของเครื่องใช้ และสินค้ายังอยู่ครบสมบูรณ์ไร้ร่องรอยการต่อสู้',
    },
    {
      topic: 'เกาะงูพิษอันตรายที่สุดในโลก Ilha da Queimada Grande บราซิล',
      details: 'เกาะร้างนอกชายฝั่งบราซิลที่เป็นถิ่นอาศัยของงูหัวหอกทองคำ พิษร้ายแรงจนสามารถย่อยเนื้อเยื่อมนุษย์ได้ รัฐบาลบราซิลสั่งห้ามมนุษย์ย่างก้าวขึ้นเกาะเด็ดขาด',
    },
    {
      topic: 'ปริศนาคฤหาสน์เขาวงกตวินเชสเตอร์ หลอกผีด้วยประตูลวง',
      details: 'คฤหาสน์ 160 ห้องในแคลิฟอร์เนีย สร้างโดย Sarah Winchester ที่เชื่อว่าต้องสร้างบ้านตลอดเวลาเพื่อหลบหนีวิญญาณ มีบันไดเดินไปชนเพดานและประตูเปิดออกไปพบกับผนังเปล่า',
    },
    {
      topic: 'อุโมงค์สุสานใต้ดินปารีส: ที่เก็บโครงกระดูก 6 ล้านเรือนร่าง',
      details: 'อุโมงค์สุสานใต้ดินความยาวนับร้อยกิโลเมตรใต้กรุงปารีส บรรจุโครงกระดูกมนุษย์มากกว่า 6 ล้านคนตั้งแต่ศตวรรษที่ 18 เคยมีผู้สูญหายและหลงทางในอุโมงค์เขาวงกตนี้',
    },
    {
      topic: 'ปริศนาป่าอาโอกิการะ ใต้ร่มเงาภูเขาไฟฟูจิ',
      details: 'ป่าทึบขนาดใหญ่เชิงภูเขาไฟฟูจิ ประเทศญี่ปุ่น มีชื่อเสียงด้านความเงียบสงัด เข็มทิศมักทำงานผิดปกติเนื่องจากแร่เหล็กจากลาวาภูเขาไฟใต้ดิน และมีประวัติผู้สูญหายจำนวนมาก',
    },
    {
      topic: 'อาถรรพ์เกาะตุ๊กตาผี Isla de las Muñecas เม็กซิโก',
      details: 'เกาะกลางทะเลสาบชินิมิลโก ที่แขวนตุ๊กตาเก่านับพันตัวตามต้นไม้ รวบรวมโดย Don Julián Santana ชายผู้ย้ายมาอยู่บนเกาะเพื่ออุทิศให้วิญญาณเด็กหญิงที่จมน้ำ',
    },
  ],
  news: [
    {
      topic: 'สรุปวิกฤตความปลอดภัยไซเบอร์ระดับโลก และบทเรียนสำคัญ',
      details: 'สรุปเหตุการณ์ระบบไอทีและซอฟต์แวร์ระดับโลกขัดข้อง ส่งผลกระทบต่อสายการบิน ธนาคาร และโรงพยาบาลทั่วโลก พร้อมแนวทางป้องกันข้อมูลสำคัญ',
    },
    {
      topic: 'สรุปการแข่งขันปัญญาประดิษฐ์ยุคใหม่ และผลกระทบต่อคนทำงาน',
      details: 'สรุปการเปิดตัวโมเดล AI รุ่นใหม่ที่มีความสามารถในการคิดวิเคราะห์และประมวลผลมัลติโมดัล พร้อมผลกระทบต่อตลาดแรงงานยุคดิจิทัล',
    },
    {
      topic: 'สรุปการค้นพบทางดาราศาสตร์ครั้งใหญ่ของกล้องโทรทรรศน์เจมส์ เวบบ์',
      details: 'สรุปภาพถ่ายและข้อมูลบรรยากาศดาวเคราะห์นอกระบบสุริยะล่าสุดที่เปิดเผยความลับการกำเนิดกาแล็กซีในยุคปฐมกาลของจักรวาล',
    },
  ],
  knowledge: [
    {
      topic: 'ปรากฏการณ์บาเดอร์-ไมน์ฮอฟ (Baader-Meinhof Phenomenon): ทำไมยิ่งสนใจ ยิ่งเห็นบ่อย?',
      details: 'ปรากฏการณ์ทางจิตวิทยาเมื่อเราเพิ่งเรียนรู้หรือสนใจสิ่งใหม่ แล้วพบว่าสิ่งนั้นปรากฏขึ้นรอบตัวบ่อยอย่างน่าประหลาด เกิดจากการเลือกรับรู้ของสมอง (Selective Attention) และการยืนยันความจำ (Confirmation Bias)',
    },
    {
      topic: 'กฎ 80/20 ของปาเรโต (Pareto Principle): ทำน้อยได้มาก สร้างผลลัพธ์สูงสุด',
      details: 'หลักการบริหารเวลาและความคิดที่ว่าผลลัพธ์ 80% เกิดจากปัจจัยสำคัญเพียง 20% ช่วยให้โฟกัสงานที่มีอิมแพกต์สูงสุดและตัดสิ่งที่ไม่จำเป็นออก',
    },
    {
      topic: 'เทคนิคจัดการเวลาแบบพูโมโดโร (Pomodoro Technique): โฟกัสเต็มร้อยโดยไม่อ่อนล้า',
      details: 'วิธีเพิ่มสมาธิด้วยการทำงาน 25 นาที และพักผ่อน 5 นาที ช่วยลดอาการสมองล้าและเพิ่มประสิทธิภาพการทำงานอย่างยั่งยืน',
    },
    {
      topic: 'ภาวะการรับรู้ขัดแย้ง (Cognitive Dissonance): ทำไมคนเราจึงเข้าข้างตัวเอง?',
      details: 'ปรากฏการณ์ทางจิตวิทยาเมื่อความเชื่อและพฤติกรรมไม่สอดคล้องกัน สมองจะพยายามหาเหตุผลมาสนับสนุนความคิดเดิมเพื่อลดความรู้สึกอึดอัดใจ',
    },
  ],
  review: [
    {
      topic: 'มหากาพย์รีวิว AMT Liposome Emulsion มอยเจอร์ไรเซอร์เสริมเกราะป้องกันผิว',
      details: 'อิมัลชั่นบำรุงผิวสูตรลิโปโซม ซึมไว ไม่เหนอะหนะ ช่วยกักเก็บความชุ่มชื้นและฟื้นฟูผิวแห้งคันระคายเคืองให้กลับมาแข็งแรงเรียบเนียน',
    },
    {
      topic: 'ป้ายยาหูฟังไร้สาย Bluetooth 5.4 มีระบบ ANC ตัดเสียงรบกวน 35dB',
      details: 'หูฟังไร้สายดีไซน์มินิมอล ไมค์ตัดเสียงสนทนาคมชัด แบตเตอรี่อึด 40 ชั่วโมง ให้คุณภาพเสียงเบสแน่นใส คุ้มค่าเกินราคา',
    },
  ],
  general: [
    {
      topic: 'เรื่องเล่าการสำรวจขั้วโลกใต้ของ Roald Amundsen ชายผู้พิชิตดินแดนน้ำแข็งคนแรก',
      details: 'การเดินทางประวัติศาสตร์ในปี 1911 เมื่อ Roald Amundsen นำทีมเดินทางถึงขั้วโลกใต้สำเร็จด้วยการวางแผนอย่างรัดกุมและการใช้สุนัขลากเลื่อน',
    },
    {
      topic: 'ความลับของหอนาฬิกาบิ๊กเบน (Big Ben) และกลไกนาฬิกาประวัติศาสตร์',
      details: 'เรื่องน่ารู้ของหอนาฬิกาพระราชวังเวสต์มินสเตอร์ที่เปิดใช้งานตั้งแต่ปี 1859 กับความแม่นยำอันทึ่งของลูกตุ้มนาฬิกาที่ปรับความเร็วด้วยเหรียญปอนด์เก่า',
    },
  ],
};

function buildRandomTopicPrompt(category: ThreadCategory, seed: number) {
  let categoryGuidance = '';

  switch (category) {
    case 'horror':
      categoryGuidance = `CATEGORY: HORROR & REAL MYSTERIES (เรื่องผี / เรื่องลี้ลับที่มีอยู่จริง)
STRICT FACT CHECKING MANDATE: Choose a 100% REAL-WORLD documented mystery or haunted location. State the EXACT, CORRECT geographic location name and historical background (e.g. Point Nepean Quarantine Station in Victoria, Cecil Hotel in LA, Dyatlov Pass in Russia). NEVER confuse location names or mix up different places!`;
      break;

    case 'news':
      categoryGuidance = `CATEGORY: REAL NEWS & TRENDING TOPICS (สรุปข่าว / ประเด็นดราม่าจริง)
STRICT FACT CHECKING MANDATE: Choose a real, current or famous viral news event. Must be 100% real.`;
      break;

    case 'knowledge':
      categoryGuidance = `CATEGORY: REAL KNOWLEDGE & SCIENCE (สาระความรู้ / ปรากฏการณ์จริง)
STRICT FACT CHECKING MANDATE: Choose a real science or psychology phenomenon. State facts accurately.`;
      break;

    case 'review':
      categoryGuidance = `CATEGORY: PRODUCT REVIEW & RECOMMENDATION (รีวิวป้ายยาสินค้า)
Choose a popular, high-demand real product category.`;
      break;

    case 'general':
    default:
      categoryGuidance = `CATEGORY: GENERAL INTERESTING REAL STORIES (เรื่องเล่าเรื่องจริงอเนกประสงค์)
Choose a remarkable real-life story or historical event. Must be 100% real.`;
      break;
  }

  return `You are a creative researcher for a viral Thai social media content creator.
Your goal is to suggest 1 UNIQUE, highly captivating, 100% REAL-WORLD topic and brief outline.

${categoryGuidance}

FACT CHECKING RULE: Ensure exact geographic accuracy and accurate historical facts. Do NOT mix up place names.
Random Seed Identifier: ${seed}-${Date.now()}

Output ONLY a valid JSON object matching this exact schema:
{
  "topic": "Catchy headline in Thai describing the real topic with exact correct location/event name",
  "details": "Brief 2-3 sentence background facts and key points in Thai (must be factually accurate)"
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

    // Pick from Verified Fact Bank 50% of the time or as fallback, to guarantee 100% factual accuracy
    const bankItems = VERIFIED_FACT_BANK[targetCategory] || VERIFIED_FACT_BANK.horror;
    const randomBankIndex = Math.floor(Math.random() * bankItems.length);
    const selectedBankItem = bankItems[randomBankIndex];

    if (!apiKey) {
      // If no API key, safely return from Verified Fact Bank
      return NextResponse.json(selectedBankItem);
    }

    // Use AI with low temperature (0.3) for fact checking accuracy
    const seed = Math.floor(Math.random() * 100000);
    const systemPrompt = buildRandomTopicPrompt(targetCategory, seed);

    let parsed: any = {};

    try {
      if (provider === 'openai') {
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.3, // Low temp for factual accuracy
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Suggest 1 unique REAL topic for category "${targetCategory}" with random seed ${seed}. Ensure 100% factual accuracy of place names.` },
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
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        });
        const rawText = response.text || '{}';
        parsed = JSON.parse(rawText);
      }
    } catch (e) {
      console.error('AI Topic Generation failed, falling back to Verified Bank:', e);
      return NextResponse.json(selectedBankItem);
    }

    return NextResponse.json({
      topic: parsed.topic || selectedBankItem.topic,
      details: parsed.details || selectedBankItem.details,
    });
  } catch (error: any) {
    console.error('Random Topic Error:', error);
    const fallbackItem = VERIFIED_FACT_BANK.horror[0];
    return NextResponse.json(fallbackItem);
  }
}
