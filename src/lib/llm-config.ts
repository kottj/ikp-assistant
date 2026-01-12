import type { LLMProvider } from '@/types';

export interface LLMSettings {
  provider: LLMProvider;
  apiKey: string;
  model: string;
}

const STORAGE_KEY = 'ikp-llm-settings';

const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  azure: 'gpt-4o',
};

export function getLLMSettings(): LLMSettings | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveLLMSettings(settings: LLMSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function clearLLMSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isLLMConfigured(): boolean {
  const settings = getLLMSettings();
  return !!(settings?.apiKey && settings.apiKey.trim().length > 0);
}

export function getDefaultModel(provider: LLMProvider): string {
  return DEFAULT_MODELS[provider];
}

export const PROVIDER_INFO: Record<LLMProvider, { name: string; description: string; keyPrefix: string }> = {
  openai: {
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo',
    keyPrefix: 'sk-',
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Claude Sonnet, Claude Opus',
    keyPrefix: 'sk-ant-',
  },
  azure: {
    name: 'Azure OpenAI',
    description: 'Azure-hosted OpenAI models',
    keyPrefix: '',
  },
};

export const MODEL_OPTIONS: Record<LLMProvider, { value: string; label: string }[]> = {
  openai: [
    { value: 'chatgpt-5', label: 'ChatGPT-5 (Latest)' },
    { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Faster, cheaper)' },
  ],
  anthropic: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Recommended)' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most capable)' },
  ],
  azure: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4', label: 'GPT-4' },
  ],
};
