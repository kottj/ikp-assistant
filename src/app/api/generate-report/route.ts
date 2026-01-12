import { NextResponse } from 'next/server';
import { createLLMProvider, getDefaultProvider } from '@/lib/llm/provider';
import { REPORT_GENERATION_SYSTEM_PROMPT, createReportUserPrompt } from '@/lib/llm/prompts/report';
import type { ReportContent, LLMProvider } from '@/types';

export async function POST(request: Request) {
  try {
    const { phase1Responses, phase2Responses, sessionId, analysisNotes, llmSettings } = await request.json();

    if (!phase1Responses || !phase2Responses) {
      return NextResponse.json(
        { error: 'Invalid request: responses required' },
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
      { role: 'system', content: REPORT_GENERATION_SYSTEM_PROMPT },
      { role: 'user', content: createReportUserPrompt(phase1Responses, phase2Responses, analysisNotes) },
    ]);

    // Parse JSON from response
    let reportData;
    try {
      const jsonMatch = result.content.match(/```json\s*([\s\S]*?)\s*```/) ||
                       result.content.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, result.content];
      const jsonStr = jsonMatch[1] || result.content;
      reportData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse report response:', parseError);
      console.error('Raw response:', result.content);
      return NextResponse.json(
        { error: 'Failed to parse report response' },
        { status: 500 }
      );
    }

    // Build complete report content
    const reportContent: ReportContent = {
      patientSummary: {
        sessionId: sessionId || 'N/A',
        interviewDate: new Date().toLocaleDateString('pl-PL'),
        completionTime: new Date().toLocaleTimeString('pl-PL'),
      },
      triageSummary: reportData.triageSummary || {
        chiefComplaint: 'Brak danych',
        symptomDuration: 'Nieokreślony',
        urgencyLevel: 'routine',
        urgencyRationale: '',
      },
      riskFactors: reportData.riskFactors || {
        identifiedFactors: [],
        overallRiskLevel: 'moderate',
        riskRationale: '',
      },
      keyFindings: reportData.keyFindings || [],
      differentialConsiderations: reportData.differentialConsiderations || [],
      recommendations: reportData.recommendations || {
        physicalExamFocus: [],
        suggestedDiagnostics: [],
        areasForDeeperInvestigation: [],
      },
      interviewTranscript: {
        phase1: phase1Responses.map((r: { question: string; answer: string }) => ({
          questionId: '',
          questionText: r.question,
          answer: r.answer,
          category: 'chief_complaint' as const,
        })),
        phase2: phase2Responses.map((r: { question: string; answer: string }) => ({
          questionId: '',
          questionText: r.question,
          answer: r.answer,
          category: 'chief_complaint' as const,
        })),
      },
    };

    return NextResponse.json({ report: reportContent });
  } catch (error) {
    console.error('Report generation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Nieprawidłowy klucz API. Sprawdź konfigurację w ustawieniach.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
