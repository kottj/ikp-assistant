import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider, LLMConfig } from '@/types';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

abstract class BaseLLMProvider {
  abstract complete(messages: LLMMessage[]): Promise<LLMResponse>;
}

class OpenAIProvider extends BaseLLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o', baseUrl?: string) {
    super();
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });
    this.model = model;
  }

  async complete(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }
}

class AnthropicProvider extends BaseLLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-sonnet-4-20250514') {
    super();
    this.client = new Anthropic({
      apiKey,
    });
    this.model = model;
  }

  async complete(messages: LLMMessage[]): Promise<LLMResponse> {
    const systemMessage = messages.find((m) => m.role === 'system');
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemMessage?.content || '',
      messages: nonSystemMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const textContent = response.content.find((c) => c.type === 'text');

    return {
      content: textContent?.text || '',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }
}

export function createLLMProvider(config: LLMConfig): BaseLLMProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config.apiKey, config.model, config.baseUrl);
    case 'anthropic':
      return new AnthropicProvider(config.apiKey, config.model);
    case 'azure':
      // Azure OpenAI uses the same API as OpenAI but with a different base URL
      return new OpenAIProvider(config.apiKey, config.model, config.baseUrl);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}

// Default provider from environment variables
export function getDefaultProvider(): BaseLLMProvider {
  const provider = (process.env.LLM_PROVIDER || 'openai') as LLMProvider;

  const config: LLMConfig = {
    provider,
    model: process.env.LLM_MODEL || (provider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4o'),
    apiKey: process.env.LLM_API_KEY || '',
    baseUrl: process.env.LLM_BASE_URL,
  };

  return createLLMProvider(config);
}
