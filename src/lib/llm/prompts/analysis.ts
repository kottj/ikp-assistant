/**
 * Prompt for analyzing patient interview responses
 * Used to generate follow-up questions based on initial interview
 *
 * Prompts are loaded from /src/lib/prompts.json for easy editing
 */

import prompts from '@/lib/prompts.json';
import { cardiologyQuestions, questionCategories } from '@/lib/questions/cardiology';

export const CARDIOLOGIST_ANALYSIS_SYSTEM_PROMPT = prompts.analysis.system;

export interface PatientDemographicsForPrompt {
  sex: 'male' | 'female';
  age: number;
}

// Category display order for clinical relevance
const CATEGORY_ORDER = [
  'chief_complaint',
  'risk_factors',
  'medical_history',
  'medications',
  'lifestyle',
  'functional_status',
];

export function createAnalysisUserPrompt(
  responses: Array<{ questionId?: string; question: string; answer: string }>,
  demographics?: PatientDemographicsForPrompt
): string {
  // Build a map of questionId -> category
  const questionCategoryMap = new Map<string, string>();
  cardiologyQuestions.forEach((q) => {
    questionCategoryMap.set(q.id, q.category);
  });

  // Group responses by category
  const responsesByCategory = new Map<string, Array<{ question: string; answer: string }>>();

  // Initialize all categories
  CATEGORY_ORDER.forEach((cat) => {
    responsesByCategory.set(cat, []);
  });

  // Assign responses to categories
  responses.forEach((r) => {
    const category = r.questionId ? questionCategoryMap.get(r.questionId) : null;
    const targetCategory = category || 'chief_complaint'; // fallback
    const catResponses = responsesByCategory.get(targetCategory) || [];
    catResponses.push({ question: r.question, answer: r.answer });
    responsesByCategory.set(targetCategory, catResponses);
  });

  // Format responses grouped by category
  const formattedSections: string[] = [];

  CATEGORY_ORDER.forEach((categoryKey) => {
    const catResponses = responsesByCategory.get(categoryKey);
    if (!catResponses || catResponses.length === 0) return;

    const categoryInfo = questionCategories[categoryKey];
    const categoryName = categoryInfo?.name || categoryKey;

    const section = [
      `═══ ${categoryName.toUpperCase()} ═══`,
      ...catResponses.map((r) => `• ${r.question}\n  → ${r.answer}`),
    ].join('\n');

    formattedSections.push(section);
  });

  const formattedResponses = formattedSections.join('\n\n');

  let demographicsInfo = '';
  if (demographics) {
    demographicsInfo = prompts.analysis.demographicsTemplate
      .replace('{{sex}}', prompts.labels.sex[demographics.sex])
      .replace('{{age}}', demographics.age.toString());
  }

  return prompts.analysis.userTemplate
    .replace('{{demographics}}', demographicsInfo)
    .replace('{{responses}}', formattedResponses);
}
