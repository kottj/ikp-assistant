/**
 * Prompt for generating final cardiology triage report
 * Creates comprehensive documentation for the cardiologist
 *
 * Prompts are loaded from /src/lib/prompts.json for easy editing
 */

import prompts from '@/lib/prompts.json';

export const REPORT_GENERATION_SYSTEM_PROMPT = prompts.report.system;

export function createReportUserPrompt(
  phase1Responses: Array<{ question: string; answer: string }>,
  phase2Responses: Array<{ question: string; answer: string }>,
  analysisNotes?: string
): string {
  const formatResponses = (responses: Array<{ question: string; answer: string }>) =>
    responses.map((r, i) => `${i + 1}. P: ${r.question}\n   O: ${r.answer}`).join('\n\n');

  const analysisSection = analysisNotes
    ? `=== NOTATKI Z ANALIZY ===\n${analysisNotes}`
    : '';

  return prompts.report.userTemplate
    .replace('{{phase1Responses}}', formatResponses(phase1Responses))
    .replace('{{phase2Responses}}', formatResponses(phase2Responses))
    .replace('{{analysisNotes}}', analysisSection);
}

/**
 * Template labels for the final PDF report in Polish
 * Loaded from prompts.json for easy editing
 */
export const REPORT_PDF_TEMPLATE = {
  title: prompts.pdf.title,
  subtitle: prompts.pdf.subtitle,
  sections: prompts.pdf.sections,
  urgencyLabels: prompts.labels.urgency,
  riskLabels: prompts.labels.risk,
  footer: prompts.pdf.footer,
};
