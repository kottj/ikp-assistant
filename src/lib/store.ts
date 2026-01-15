import { create } from 'zustand';
import type { Question, Response, ReportContent, AnalysisResult } from '@/types';
import { cardiologyQuestions } from './questions/cardiology';

export interface PatientDemographics {
  sex: 'male' | 'female';
  age: number;
}

interface InterviewStore {
  // Session state
  sessionId: string | null;
  patientId: string | null;
  patientDemographics: PatientDemographics | null;
  status: 'idle' | 'phase1' | 'analyzing' | 'phase2' | 'generating_report' | 'completed';

  // Questions and responses
  phase1Questions: Question[];
  phase2Questions: Question[];
  currentQuestionIndex: number;
  responses: Record<string, string | string[]>;

  // Analysis and report
  analysisResult: AnalysisResult | null;
  report: ReportContent | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  startSession: (patientId: string, demographics: PatientDemographics) => void;
  setResponse: (questionId: string, value: string | string[]) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completePhase1: () => Promise<void>;
  setPhase2Questions: (questions: Question[], analysis: AnalysisResult) => void;
  completePhase2: () => Promise<void>;
  setReport: (report: ReportContent) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;

  // Computed
  getCurrentQuestion: () => Question | null;
  getCurrentPhaseQuestions: () => Question[];
  getTotalQuestions: () => number;
  isCurrentQuestionAnswered: () => boolean;
  getPhase1Responses: () => Response[];
  getPhase2Responses: () => Response[];
}

const initialState = {
  sessionId: null,
  patientId: null,
  patientDemographics: null,
  status: 'idle' as const,
  phase1Questions: cardiologyQuestions,
  phase2Questions: [],
  currentQuestionIndex: 0,
  responses: {},
  analysisResult: null,
  report: null,
  isLoading: false,
  error: null,
};

export const useInterviewStore = create<InterviewStore>((set, get) => ({
  ...initialState,

  startSession: (patientId: string, demographics: PatientDemographics) => {
    const sessionId = crypto.randomUUID();
    set({
      sessionId,
      patientId,
      patientDemographics: demographics,
      status: 'phase1',
      currentQuestionIndex: 0,
      responses: {},
      error: null,
    });
  },

  setResponse: (questionId: string, value: string | string[]) => {
    set((state) => ({
      responses: {
        ...state.responses,
        [questionId]: value,
      },
    }));
  },

  nextQuestion: () => {
    const { currentQuestionIndex, status, phase1Questions, phase2Questions } = get();
    const questions = status === 'phase1' ? phase1Questions : phase2Questions;

    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  completePhase1: async () => {
    set({ status: 'analyzing', isLoading: true, error: null });
  },

  setPhase2Questions: (questions: Question[], analysis: AnalysisResult) => {
    set({
      phase2Questions: questions,
      analysisResult: analysis,
      status: 'phase2',
      currentQuestionIndex: 0,
      isLoading: false,
    });
  },

  completePhase2: async () => {
    set({ status: 'generating_report', isLoading: true, error: null });
  },

  setReport: (report: ReportContent) => {
    set({
      report,
      status: 'completed',
      isLoading: false,
    });
  },

  setError: (error: string | null) => {
    const { status } = get();
    // Reset status back to the phase that failed, so error message can be displayed
    let newStatus = status;
    if (status === 'analyzing') {
      newStatus = 'phase1';
    } else if (status === 'generating_report') {
      newStatus = 'phase2';
    }
    set({ error, isLoading: false, status: newStatus });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  reset: () => {
    set(initialState);
  },

  getCurrentQuestion: () => {
    const { status, phase1Questions, phase2Questions, currentQuestionIndex } = get();
    const questions = status === 'phase1' ? phase1Questions : phase2Questions;
    return questions[currentQuestionIndex] || null;
  },

  getCurrentPhaseQuestions: () => {
    const { status, phase1Questions, phase2Questions } = get();
    return status === 'phase1' ? phase1Questions : phase2Questions;
  },

  getTotalQuestions: () => {
    const { status, phase1Questions, phase2Questions } = get();
    return status === 'phase1' ? phase1Questions.length : phase2Questions.length;
  },

  isCurrentQuestionAnswered: () => {
    const { responses, currentQuestionIndex, status, phase1Questions, phase2Questions } = get();
    const questions = status === 'phase1' ? phase1Questions : phase2Questions;
    const question = questions[currentQuestionIndex];

    if (!question) return false;

    const response = responses[question.id];

    if (!question.required) return true;

    if (Array.isArray(response)) {
      return response.length > 0;
    }

    return !!response && response.trim() !== '';
  },

  getPhase1Responses: () => {
    const { phase1Questions, responses, sessionId } = get();
    return phase1Questions
      .filter((q) => responses[q.id] !== undefined)
      .map((q) => ({
        id: crypto.randomUUID(),
        session_id: sessionId || '',
        phase: 1 as const,
        question_id: q.id,
        question_text: q.text,
        answer: Array.isArray(responses[q.id]) ? (responses[q.id] as string[]).join(', ') : (responses[q.id] as string),
        created_at: new Date().toISOString(),
      }));
  },

  getPhase2Responses: () => {
    const { phase2Questions, responses, sessionId } = get();
    return phase2Questions
      .filter((q) => responses[q.id] !== undefined)
      .map((q) => ({
        id: crypto.randomUUID(),
        session_id: sessionId || '',
        phase: 2 as const,
        question_id: q.id,
        question_text: q.text,
        answer: Array.isArray(responses[q.id]) ? (responses[q.id] as string[]).join(', ') : (responses[q.id] as string),
        created_at: new Date().toISOString(),
      }));
  },
}));
