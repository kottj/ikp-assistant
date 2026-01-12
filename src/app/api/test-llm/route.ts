import { NextResponse } from 'next/server';
import { createLLMProvider } from '@/lib/llm/provider';
import type { LLMProvider } from '@/types';

export async function POST(request: Request) {
  try {
    const { provider, apiKey, model } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Brakuje wymaganych pól' },
        { status: 400 }
      );
    }

    const llmProvider = createLLMProvider({
      provider: provider as LLMProvider,
      apiKey,
      model: model || 'gpt-4o',
    });

    // Simple test message
    const result = await llmProvider.complete([
      { role: 'system', content: 'Odpowiedz jednym słowem: OK' },
      { role: 'user', content: 'Test połączenia' },
    ]);

    if (result.content) {
      return NextResponse.json({ success: true, message: 'Połączenie działa' });
    } else {
      return NextResponse.json(
        { error: 'Brak odpowiedzi od modelu' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('LLM test error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';

    // Parse common errors
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Nieprawidłowy klucz API' },
        { status: 401 }
      );
    }
    if (errorMessage.includes('429')) {
      return NextResponse.json(
        { error: 'Przekroczono limit zapytań' },
        { status: 429 }
      );
    }
    if (errorMessage.includes('model')) {
      return NextResponse.json(
        { error: 'Nieprawidłowy model lub brak dostępu' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Błąd: ${errorMessage.slice(0, 100)}` },
      { status: 500 }
    );
  }
}
