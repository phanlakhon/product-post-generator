import { FormInput, GeneratedResult } from './types';

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
