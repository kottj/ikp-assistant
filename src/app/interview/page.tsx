'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewStore } from '@/lib/store';
import { Header } from '@/components/ui/Header';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { Button } from '@/components/ui/Button';
import { questionCategories } from '@/lib/questions/cardiology';
import { getLLMSettings } from '@/lib/llm-config';
import type { AnalysisResult, Question } from '@/types';

export default function InterviewPage() {
  const router = useRouter();
  const {
    status,
    currentQuestionIndex,
    responses,
    isLoading,
    error,
    setResponse,
    nextQuestion,
    previousQuestion,
    completePhase1,
    setPhase2Questions,
    completePhase2,
    setReport,
    setError,
    getCurrentQuestion,
    getCurrentPhaseQuestions,
    getTotalQuestions,
    isCurrentQuestionAnswered,
    getPhase1Responses,
    getPhase2Responses,
    reset,
  } = useInterviewStore();

  const currentQuestion = getCurrentQuestion();
  const questions = getCurrentPhaseQuestions();
  const totalQuestions = getTotalQuestions();
  const isAnswered = isCurrentQuestionAnswered();
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Redirect if no session
  useEffect(() => {
    if (status === 'idle') {
      router.push('/');
    }
  }, [status, router]);

  // Handle phase 1 completion and analysis
  useEffect(() => {
    if (status === 'analyzing') {
      performAnalysis();
    }
  }, [status]);

  // Handle report generation
  useEffect(() => {
    if (status === 'generating_report') {
      generateReport();
    }
  }, [status]);

  // Redirect to report when completed
  useEffect(() => {
    if (status === 'completed') {
      router.push('/report');
    }
  }, [status, router]);

  const performAnalysis = async () => {
    try {
      const phase1Responses = getPhase1Responses();
      const formattedResponses = phase1Responses.map((r) => ({
        question: r.question_text,
        answer: r.answer,
      }));

      const llmSettings = getLLMSettings();
      const patientDemographics = useInterviewStore.getState().patientDemographics;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: formattedResponses,
          llmSettings,
          demographics: patientDemographics,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      const analysis: AnalysisResult = data.analysis;

      // If no follow-up questions, generate some defaults
      const followUpQuestions: Question[] = analysis.followUpQuestions.length > 0
        ? analysis.followUpQuestions
        : generateDefaultFollowUpQuestions();

      setPhase2Questions(followUpQuestions, analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      const message = err instanceof Error ? err.message : 'Wystąpił błąd podczas analizy.';
      setError(message.includes('API') ? message : 'Wystąpił błąd podczas analizy. Sprawdź konfigurację AI w ustawieniach.');
    }
  };

  const generateReport = async () => {
    try {
      const phase1 = getPhase1Responses().map((r) => ({
        question: r.question_text,
        answer: r.answer,
      }));

      const phase2 = getPhase2Responses().map((r) => ({
        question: r.question_text,
        answer: r.answer,
      }));

      const llmSettings = getLLMSettings();

      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase1Responses: phase1,
          phase2Responses: phase2,
          sessionId: useInterviewStore.getState().sessionId,
          llmSettings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Report generation failed');
      }

      const data = await response.json();
      setReport(data.report);
    } catch (err) {
      console.error('Report generation error:', err);
      const message = err instanceof Error ? err.message : 'Wystąpił błąd podczas generowania raportu.';
      setError(message.includes('API') ? message : 'Wystąpił błąd podczas generowania raportu. Sprawdź konfigurację AI w ustawieniach.');
    }
  };

  const generateDefaultFollowUpQuestions = (): Question[] => {
    return [
      {
        id: 'followup_clarification',
        category: 'chief_complaint',
        text: 'Czy są jakieś dodatkowe objawy, które chciałby/chciałaby Pan/Pani zgłosić?',
        type: 'textarea',
        required: false,
        placeholder: 'Opisz dodatkowe objawy...',
      },
      {
        id: 'followup_recent_changes',
        category: 'chief_complaint',
        text: 'Czy Pana/Pani objawy zmieniły się w ciągu ostatnich dni?',
        type: 'radio',
        options: [
          { value: 'improved', label: 'Poprawiły się' },
          { value: 'same', label: 'Pozostają bez zmian' },
          { value: 'worsened', label: 'Pogorszyły się' },
        ],
        required: true,
      },
      {
        id: 'followup_concerns',
        category: 'chief_complaint',
        text: 'Co najbardziej Pana/Panią niepokoi w związku ze zdrowiem serca?',
        type: 'textarea',
        required: false,
        placeholder: 'Opisz swoje obawy...',
      },
    ];
  };

  const handleNext = () => {
    if (isLastQuestion) {
      if (status === 'phase1') {
        completePhase1();
      } else if (status === 'phase2') {
        completePhase2();
      }
    } else {
      nextQuestion();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0) {
      if (confirm('Czy na pewno chcesz przerwać wywiad?')) {
        reset();
        router.push('/');
      }
    } else {
      previousQuestion();
    }
  };

  if (status === 'idle') {
    return null;
  }

  if (status === 'analyzing') {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="govpl-card p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--govpl-primary)] border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              Analizuję Twoje odpowiedzi...
            </h2>
            <p className="text-[var(--foreground-muted)]">
              Przygotowuję pytania pogłębiające na podstawie przekazanych informacji.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'generating_report') {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="govpl-card p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--govpl-primary)] border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              Generuję raport...
            </h2>
            <p className="text-[var(--foreground-muted)]">
              Przygotowuję dokumentację dla Twojego kardiologa.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const category = questionCategories[currentQuestion.category];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header showBack onBack={handleBack} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Phase indicator */}
        <div className="mb-4">
          <span className={`govpl-badge ${status === 'phase1' ? 'govpl-badge-info' : 'govpl-badge-success'}`}>
            {status === 'phase1' ? 'Faza 1: Wywiad wstępny' : 'Faza 2: Pytania pogłębiające'}
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-[var(--error-light)] text-[var(--error)] rounded-lg">
            {error}
          </div>
        )}

        {/* Progress */}
        <ProgressBar
          current={currentQuestionIndex + 1}
          total={totalQuestions}
          label={category?.name || 'Pytania'}
          className="mb-6"
        />

        {/* Question */}
        <QuestionCard
          question={currentQuestion}
          value={responses[currentQuestion.id] || (currentQuestion.type === 'multiselect' ? [] : '')}
          onChange={(value) => setResponse(currentQuestion.id, value)}
          disabled={isLoading}
        />

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={isLoading}
          >
            {currentQuestionIndex === 0 ? 'Anuluj' : 'Wstecz'}
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!isAnswered || isLoading}
            isLoading={isLoading}
          >
            {isLastQuestion
              ? status === 'phase1'
                ? 'Zakończ i analizuj'
                : 'Generuj raport'
              : 'Dalej'}
          </Button>
        </div>

        {/* Question counter */}
        <p className="text-center text-sm text-[var(--foreground-muted)] mt-4">
          Pytanie {currentQuestionIndex + 1} z {totalQuestions}
        </p>
      </main>
    </div>
  );
}
