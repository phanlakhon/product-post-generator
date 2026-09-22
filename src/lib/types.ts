export type AppMode = 'post_generator' | 'story_thread';

export type Platform = 'x' | 'facebook' | 'threads';

export type Tone = 'friendly' | 'hard_sale' | 'reviewer' | 'storytelling' | 'qa_answer';

export type ThreadCategory = 'horror' | 'news' | 'knowledge' | 'review' | 'general';

export type AIProvider = 'openai' | 'gemini';

export interface XPostContent {
  mainPost: string;
  replyPost: string;
}

export interface FacebookPostContent {
  fullPost: string;
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
  productName?: string;
  details: string;
  platforms: Platform[];
  tone: Tone;
  provider?: AIProvider;
  apiKey?: string;
}

// ----------------- STORY THREAD TYPES -----------------
export interface StoryThreadInput {
  topic: string;
  category: ThreadCategory;
  details: string;
  url?: string;
  threadLength: number; // 3, 4, 5, 6
  tone: Tone;
  provider?: AIProvider;
  apiKey?: string;
}

export interface StoryThreadBlock {
  stepIndex: number;
  label: string; // e.g., "Block 1: Hook เปิดหัว", "Block 2: เริ่มเรื่อง/ปัญหา"
  content: string;
  hasLink?: boolean;
}

export interface StoryThreadResult {
  title: string;
  category: ThreadCategory;
  blocks: StoryThreadBlock[];
  metadata: {
    generatedAt: string;
    tone: Tone;
    providerUsed?: string;
    url?: string;
  };
}
