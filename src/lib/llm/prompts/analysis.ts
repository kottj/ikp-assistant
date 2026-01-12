/**
 * Prompt for analyzing patient interview responses
 * Used to generate follow-up questions based on initial interview
 *
 * Prompts are loaded from /src/lib/prompts.json for easy editing
 */

import prompts from '@/lib/prompts.json';

export const CARDIOLOGIST_ANALYSIS_SYSTEM_PROMPT = prompts.analysis.system;

export interface PatientDemographicsForPrompt {
  sex: 'male' | 'female';
  age: number;
}

export function createAnalysisUserPrompt(
  responses: Array<{ question: string; answer: string }>,
  demographics?: PatientDemographicsForPrompt
): string {
  const formattedResponses = responses
    .map((r, i) => `${i + 1}. Pytanie: ${r.question}\n   Odpowiedź: ${r.answer}`)
    .join('\n\n');

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
