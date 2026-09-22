import { FormInput, GeneratedResult, StoryThreadInput, StoryThreadResult } from './types';

export async function generateAIContent(input: FormInput & { apiKey?: string }): Promise<GeneratedResult> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate posts from AI backend');
  }

  const data: GeneratedResult = await res.json();
  return data;
}

export async function generateStoryThreadContent(input: StoryThreadInput): Promise<StoryThreadResult> {
  const res = await fetch('/api/generate-story-thread', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate story thread from AI backend');
  }

  const data: StoryThreadResult = await res.json();
  return data;
}

export async function fetchRandomTopic(
  category: string,
  provider?: string,
  apiKey?: string
): Promise<{ topic: string; details: string }> {
  const res = await fetch('/api/random-topic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ category, provider, apiKey }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch random topic');
  }

  const data = await res.json();
  return data;
}
