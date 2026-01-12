// Session and Interview Types

export interface Session {
  id: string;
  patient_id: string;
  specialist_type: 'cardiology';
  status: 'in_progress' | 'phase_1_complete' | 'phase_2_complete' | 'completed';
  created_at: string;
  completed_at: string | null;
}

export interface Response {
  id: string;
  session_id: string;
  phase: 1 | 2;
  question_id: string;
  question_text: string;
  answer: string;
  created_at: string;
}

export interface Report {
  id: string;
  session_id: string;
  content: ReportContent;
  pdf_url: string | null;
  created_at: string;
}

// Question Types

export type QuestionType = 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'scale';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  placeholder?: string;
  helpText?: string;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  allowOther?: boolean;
  otherPlaceholder?: string;
}

export type QuestionCategory =
  | 'chief_complaint'
  | 'risk_factors'
  | 'medical_history'
  | 'medications'
  | 'lifestyle'
  | 'functional_status';

// Report Types

export interface ReportContent {
  patientSummary: PatientSummary;
  triageSummary: TriageSummary;
  riskFactors: RiskFactorAssessment;
  keyFindings: string[];
  differentialConsiderations: string[];
  recommendations: RecommendationSection;
  interviewTranscript: InterviewTranscript;
}

export interface PatientSummary {
  sessionId: string;
  interviewDate: string;
  completionTime: string;
}

export interface TriageSummary {
  chiefComplaint: string;
  symptomDuration: string;
  urgencyLevel: 'routine' | 'urgent' | 'immediate';
  urgencyRationale: string;
}

export interface RiskFactorAssessment {
  identifiedFactors: RiskFactor[];
  overallRiskLevel: 'low' | 'moderate' | 'high';
  riskRationale: string;
}

export interface RiskFactor {
  name: string;
  present: boolean;
  details?: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface RecommendationSection {
  physicalExamFocus: string[];
  suggestedDiagnostics: string[];
  areasForDeeperInvestigation: string[];
  additionalNotes?: string;
}

export interface InterviewTranscript {
  phase1: QuestionAnswer[];
  phase2: QuestionAnswer[];
}

export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  answer: string;
  category: QuestionCategory;
}

// LLM Types

export type LLMProvider = 'openai' | 'anthropic' | 'azure';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export interface AnalysisResult {
  followUpQuestions: Question[];
  preliminaryAssessment: {
    riskLevel: 'low' | 'moderate' | 'high';
    urgency: 'routine' | 'urgent' | 'immediate';
    keyFindings: string[];
    areasToExplore: string[];
  };
}

// Store Types

export interface InterviewState {
  session: Session | null;
  currentPhase: 1 | 2;
  currentQuestionIndex: number;
  phase1Responses: Response[];
  phase2Responses: Response[];
  phase2Questions: Question[];
  analysisResult: AnalysisResult | null;
  report: Report | null;
  isLoading: boolean;
  error: string | null;
}

export interface InterviewActions {
  startSession: (patientId: string) => Promise<void>;
  answerQuestion: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completePhase1: () => Promise<void>;
  completePhase2: () => Promise<void>;
  generateReport: () => Promise<void>;
  reset: () => void;
}
