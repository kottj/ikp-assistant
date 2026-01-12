'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Download, Home, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { useInterviewStore } from '@/lib/store';
import type { ReportContent } from '@/types';
import jsPDF from 'jspdf';

export default function ReportPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const { status, report, sessionId, reset } = useInterviewStore();

  useEffect(() => {
    if (status !== 'completed' || !report) {
      router.push('/');
    }
  }, [status, report, router]);

  if (!report) {
    return null;
  }

  // Helper to convert Polish characters to ASCII for PDF
  const toAscii = (text: string): string => {
    const polishMap: Record<string, string> = {
      'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
      'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
      'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
      'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
    };
    return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => polishMap[char] || char);
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    const checkNewPage = (neededSpace: number) => {
      if (yPos + neededSpace > pageHeight - 25) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(toAscii(text), contentWidth);
      const lineHeight = fontSize * 0.4;
      checkNewPage(lines.length * lineHeight);
      doc.text(lines, margin, yPos);
      yPos += lines.length * lineHeight + 1;
    };

    const addSection = (title: string) => {
      checkNewPage(15);
      yPos += 4;
      doc.setDrawColor(0, 82, 165);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;
      addText(title, 12, true, [0, 82, 165]);
      yPos += 2;
    };

    const addBadge = (label: string, type: 'info' | 'warning' | 'error' | 'success') => {
      const colors: Record<string, [number, number, number]> = {
        info: [2, 136, 209],
        warning: [245, 127, 23],
        error: [211, 47, 47],
        success: [0, 135, 90],
      };
      addText(`[${label}]`, 10, true, colors[type]);
    };

    const addListItem = (text: string, indent: number = 0) => {
      const indentStr = '  '.repeat(indent);
      addText(`${indentStr}• ${text}`, 10);
    };

    // ===== HEADER =====
    doc.setFillColor(0, 82, 165);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(toAscii('RAPORT WSTEPNEJ KWALIFIKACJI KARDIOLOGICZNEJ'), margin, 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(toAscii('Dokumentacja przygotowawcza do wizyty specjalistycznej'), margin, 19);
    yPos = 35;

    // ===== SESSION INFO =====
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`ID: ${report.patientSummary.sessionId.slice(0, 8)}...  |  Data: ${report.patientSummary.interviewDate}  |  Godzina: ${report.patientSummary.completionTime}`, margin, yPos);
    yPos += 8;

    // ===== TRIAGE SUMMARY =====
    addSection('PODSUMOWANIE TRIAZU');
    const urgencyLabels: Record<string, { label: string; type: 'info' | 'warning' | 'error' }> = {
      routine: { label: 'Konsultacja rutynowa', type: 'info' },
      urgent: { label: 'Konsultacja pilna', type: 'warning' },
      immediate: { label: 'Konsultacja natychmiastowa', type: 'error' },
    };
    const urgency = urgencyLabels[report.triageSummary.urgencyLevel];
    addBadge(urgency.label, urgency.type);
    yPos += 2;
    addText(`Glowna dolegliwosc: ${report.triageSummary.chiefComplaint}`, 10, true);
    addText(`Czas trwania objawow: ${report.triageSummary.symptomDuration}`, 10);
    if (report.triageSummary.urgencyRationale) {
      addText(`Uzasadnienie pilnosci: ${report.triageSummary.urgencyRationale}`, 10);
    }

    // ===== RISK FACTORS =====
    addSection('CZYNNIKI RYZYKA SERCOWO-NACZYNIOWEGO');
    const riskLabels: Record<string, { label: string; type: 'success' | 'warning' | 'error' }> = {
      low: { label: 'Ryzyko niskie', type: 'success' },
      moderate: { label: 'Ryzyko umiarkowane', type: 'warning' },
      high: { label: 'Ryzyko wysokie', type: 'error' },
    };
    const risk = riskLabels[report.riskFactors.overallRiskLevel];
    addBadge(risk.label, risk.type);
    yPos += 2;
    if (report.riskFactors.riskRationale) {
      addText(report.riskFactors.riskRationale, 9);
    }
    const presentFactors = report.riskFactors.identifiedFactors.filter((f) => f.present);
    if (presentFactors.length > 0) {
      yPos += 2;
      addText('Zidentyfikowane czynniki:', 10, true);
      presentFactors.forEach((factor) => {
        addListItem(`${factor.name}${factor.details ? `: ${factor.details}` : ''}`);
      });
    }

    // ===== KEY FINDINGS =====
    if (report.keyFindings.length > 0) {
      addSection('KLUCZOWE USTALENIA');
      report.keyFindings.forEach((finding) => {
        addListItem(finding);
      });
    }

    // ===== DIFFERENTIAL =====
    if (report.differentialConsiderations.length > 0) {
      addSection('ROZPOZNANIA ROZNICOWE DO ROZWAZENIA');
      report.differentialConsiderations.forEach((diff) => {
        addListItem(diff);
      });
    }

    // ===== RECOMMENDATIONS =====
    addSection('REKOMENDACJE DLA LEKARZA');
    if (report.recommendations.physicalExamFocus.length > 0) {
      addText('Badanie fizykalne - obszary do poglebienia:', 10, true);
      report.recommendations.physicalExamFocus.forEach((item) => {
        addListItem(item, 1);
      });
      yPos += 2;
    }
    if (report.recommendations.suggestedDiagnostics.length > 0) {
      addText('Sugerowane badania diagnostyczne:', 10, true);
      report.recommendations.suggestedDiagnostics.forEach((item) => {
        addListItem(item, 1);
      });
      yPos += 2;
    }
    if (report.recommendations.areasForDeeperInvestigation.length > 0) {
      addText('Tematy do poglebionej rozmowy:', 10, true);
      report.recommendations.areasForDeeperInvestigation.forEach((item) => {
        addListItem(item, 1);
      });
    }
    if (report.recommendations.additionalNotes) {
      yPos += 2;
      addText('Dodatkowe uwagi:', 10, true);
      addText(report.recommendations.additionalNotes, 10);
    }

    // ===== INTERVIEW TRANSCRIPT =====
    if (report.interviewTranscript.phase1.length > 0 || report.interviewTranscript.phase2.length > 0) {
      addSection('PRZEBIEG WYWIADU');

      if (report.interviewTranscript.phase1.length > 0) {
        addText('Faza 1 - Wywiad wstepny:', 10, true);
        yPos += 1;
        report.interviewTranscript.phase1.forEach((qa, i) => {
          checkNewPage(12);
          addText(`${i + 1}. ${qa.questionText}`, 9, true);
          addText(`   Odpowiedz: ${qa.answer}`, 9);
          yPos += 1;
        });
      }

      if (report.interviewTranscript.phase2.length > 0) {
        yPos += 3;
        addText('Faza 2 - Pytania poglebione:', 10, true);
        yPos += 1;
        report.interviewTranscript.phase2.forEach((qa, i) => {
          checkNewPage(12);
          addText(`${i + 1}. ${qa.questionText}`, 9, true);
          addText(`   Odpowiedz: ${qa.answer}`, 9);
          yPos += 1;
        });
      }
    }

    // ===== FOOTER ON EACH PAGE =====
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      doc.text(
        toAscii('Niniejszy raport ma charakter informacyjny. Nie zastepuje badania lekarskiego ani diagnozy medycznej.'),
        margin,
        pageHeight - 15
      );
      doc.text(toAscii('IKP Asystent Kardiologiczny'), margin, pageHeight - 10);
      doc.text(`Strona ${i} z ${totalPages}`, pageWidth - margin - 25, pageHeight - 10);
    }

    // Save
    doc.save(`raport-kardiologiczny-${sessionId?.slice(0, 8) || 'unknown'}.pdf`);
  };

  const handleNewInterview = () => {
    reset();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Banner */}
        <div className="govpl-card p-6 mb-6 bg-[var(--success-light)] border-[var(--success)]">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-[var(--success)]" />
            <div>
              <h2 className="font-semibold text-[var(--success)]">
                Wywiad zakończony pomyślnie
              </h2>
              <p className="text-sm text-[var(--success)]">
                Twój raport jest gotowy do pobrania i przekazania kardiologowi.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button variant="primary" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Pobierz raport PDF
          </Button>
          <Button variant="secondary" onClick={handleNewInterview}>
            <Home className="w-4 h-4 mr-2" />
            Nowy wywiad
          </Button>
        </div>

        {/* Report Content */}
        <div ref={reportRef} className="space-y-6">
          {/* Header */}
          <div className="govpl-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-[var(--govpl-primary)]" />
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                Raport wstępnej kwalifikacji kardiologicznej
              </h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[var(--foreground-muted)]">ID sesji:</span>
                <p className="font-medium">{report.patientSummary.sessionId.slice(0, 8)}...</p>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)]">Data:</span>
                <p className="font-medium">{report.patientSummary.interviewDate}</p>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)]">Godzina:</span>
                <p className="font-medium">{report.patientSummary.completionTime}</p>
              </div>
            </div>
          </div>

          {/* Triage Summary */}
          <ReportSection title="Podsumowanie triażu">
            <UrgencyBadge level={report.triageSummary.urgencyLevel} />
            <div className="mt-4 space-y-3">
              <div>
                <span className="text-sm text-[var(--foreground-muted)]">Główna dolegliwość:</span>
                <p className="font-medium">{report.triageSummary.chiefComplaint}</p>
              </div>
              <div>
                <span className="text-sm text-[var(--foreground-muted)]">Czas trwania objawów:</span>
                <p className="font-medium">{report.triageSummary.symptomDuration}</p>
              </div>
              {report.triageSummary.urgencyRationale && (
                <div>
                  <span className="text-sm text-[var(--foreground-muted)]">Uzasadnienie pilności:</span>
                  <p>{report.triageSummary.urgencyRationale}</p>
                </div>
              )}
            </div>
          </ReportSection>

          {/* Risk Factors */}
          <ReportSection title="Czynniki ryzyka sercowo-naczyniowego">
            <RiskBadge level={report.riskFactors.overallRiskLevel} />
            {report.riskFactors.riskRationale && (
              <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                {report.riskFactors.riskRationale}
              </p>
            )}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">
                Zidentyfikowane czynniki:
              </h4>
              <ul className="space-y-2">
                {report.riskFactors.identifiedFactors
                  .filter((f) => f.present)
                  .map((factor, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>{factor.name}</strong>
                        {factor.details && `: ${factor.details}`}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </ReportSection>

          {/* Key Findings */}
          {report.keyFindings.length > 0 && (
            <ReportSection title="Kluczowe ustalenia">
              <ul className="space-y-2">
                {report.keyFindings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--govpl-primary)] rounded-full mt-2 flex-shrink-0" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </ReportSection>
          )}

          {/* Differential */}
          {report.differentialConsiderations.length > 0 && (
            <ReportSection title="Rozpoznania różnicowe do rozważenia">
              <ul className="space-y-2">
                {report.differentialConsiderations.map((diff, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--foreground-muted)] rounded-full mt-2 flex-shrink-0" />
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </ReportSection>
          )}

          {/* Recommendations */}
          <ReportSection title="Rekomendacje dla lekarza">
            {report.recommendations.physicalExamFocus.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                  Badanie fizykalne - obszary do pogłębienia:
                </h4>
                <ul className="space-y-1 text-sm">
                  {report.recommendations.physicalExamFocus.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--govpl-primary)]">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.recommendations.suggestedDiagnostics.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                  Sugerowane badania diagnostyczne:
                </h4>
                <ul className="space-y-1 text-sm">
                  {report.recommendations.suggestedDiagnostics.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--govpl-primary)]">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.recommendations.areasForDeeperInvestigation.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                  Tematy do pogłębionej rozmowy:
                </h4>
                <ul className="space-y-1 text-sm">
                  {report.recommendations.areasForDeeperInvestigation.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--govpl-primary)]">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.recommendations.additionalNotes && (
              <div className="mt-4 p-3 bg-[var(--background)] rounded-lg">
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                  Dodatkowe uwagi:
                </h4>
                <p className="text-sm">{report.recommendations.additionalNotes}</p>
              </div>
            )}
          </ReportSection>

          {/* Disclaimer */}
          <div className="p-4 bg-[var(--warning-light)] rounded-lg border border-[var(--warning)]/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--warning)]">
                Niniejszy raport ma charakter informacyjny i stanowi materiał pomocniczy
                dla lekarza specjalisty. Nie zastępuje badania lekarskiego ani diagnozy
                medycznej.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper Components

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="govpl-card p-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function UrgencyBadge({ level }: { level: 'routine' | 'urgent' | 'immediate' }) {
  const config = {
    routine: {
      label: 'Konsultacja rutynowa',
      className: 'govpl-badge-info',
    },
    urgent: {
      label: 'Konsultacja pilna',
      className: 'govpl-badge-warning',
    },
    immediate: {
      label: 'Konsultacja natychmiastowa',
      className: 'govpl-badge-error',
    },
  };

  const { label, className } = config[level];

  return <span className={`govpl-badge ${className}`}>{label}</span>;
}

function RiskBadge({ level }: { level: 'low' | 'moderate' | 'high' }) {
  const config = {
    low: {
      label: 'Ryzyko niskie',
      className: 'govpl-badge-success',
    },
    moderate: {
      label: 'Ryzyko umiarkowane',
      className: 'govpl-badge-warning',
    },
    high: {
      label: 'Ryzyko wysokie',
      className: 'govpl-badge-error',
    },
  };

  const { label, className } = config[level];

  return <span className={`govpl-badge ${className}`}>{label}</span>;
}
