export type Platform = 'x' | 'facebook' | 'threads';

export type Tone = 'friendly' | 'hard_sale' | 'reviewer' | 'storytelling' | 'qa_answer';

export type AIProvider = 'openai' | 'gemini';

export interface XPostContent {
  mainPost: string; // MUST NOT contain any link or emojis
  replyPost: string; // Contains "📍 พิกัดตรงนี้เลย 👇" + URL
}

export interface FacebookPostContent {
  fullPost: string; // Long form post without emojis, with bullet points & CTA at bottom
}

export interface ThreadsPostContent {
  mainPost: string;
  replyPost: string;
}

export interface GeneratedResult {
  x?: XPostContent;
  facebook?: FacebookPostContent;
  threads?: ThreadsPostContent;
  metadata: {
    generatedAt: string;
    productTitleHint?: string;
    url: string;
    tone: Tone;
    providerUsed?: string;
  };
}

export interface FormInput {
  url: string;
  productName?: string; // Explicit product name (e.g. รองเท้าแตะเพื่อสุขภาพ, เซรั่ม AMT)
  details: string;
  platforms: Platform[];
  tone: Tone;
  provider?: AIProvider;
  apiKey?: string;
}
