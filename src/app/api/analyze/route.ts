import { NextResponse } from 'next/server';
import { createLLMProvider, getDefaultProvider } from '@/lib/llm/provider';
import { CARDIOLOGIST_ANALYSIS_SYSTEM_PROMPT, createAnalysisUserPrompt } from '@/lib/llm/prompts/analysis';
import type { Question, AnalysisResult, LLMProvider } from '@/types';

export async function POST(request: Request) {
  try {
    const { responses, llmSettings, demographics } = await request.json();

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Invalid request: responses array required' },
        { status: 400 }
      );
    }

    // Use client-provided settings or fall back to env variables
    let provider;
    if (llmSettings?.apiKey) {
      provider = createLLMProvider({
        provider: llmSettings.provider as LLMProvider,
        apiKey: llmSettings.apiKey,
        model: llmSettings.model,
      });
    } else {
      provider = getDefaultProvider();
    }

    const result = await provider.complete([
      { role: 'system', content: CARDIOLOGIST_ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content: createAnalysisUserPrompt(responses, demographics) },
    ]);

    // Parse JSON from response
    let analysisData;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = result.content.match(/```json\s*([\s\S]*?)\s*```/) ||
                       result.content.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, result.content];
      const jsonStr = jsonMatch[1] || result.content;
      analysisData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      console.error('Raw response:', result.content);
      return NextResponse.json(
        { error: 'Failed to parse analysis response' },
        { status: 500 }
      );
    }

    // Transform follow-up questions to match Question type
    const followUpQuestions: Question[] = (analysisData.followUpQuestions || []).map(
      (q: Record<string, unknown>, index: number) => ({
        id: (q.id as string) || `followup_${index}`,
        category: (q.category as string) || 'chief_complaint',
        text: q.text as string,
        type: (q.type as string) || 'text',
        options: q.options,
        required: q.required !== false,
        placeholder: q.placeholder,
        helpText: q.rationale as string,
      })
    );

    const analysisResult: AnalysisResult = {
      followUpQuestions,
      preliminaryAssessment: analysisData.preliminaryAssessment || {
        riskLevel: 'moderate',
        urgency: 'routine',
        keyFindings: [],
        areasToExplore: [],
      },
    };

    return NextResponse.json({
      analysis: analysisResult,
      clinicalNotes: analysisData.clinicalNotes,
    });
  } catch (error) {
    console.error('Analysis error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Nieprawidłowy klucz API. Sprawdź konfigurację w ustawieniach.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze responses' },
      { status: 500 }
    );
  }
}
