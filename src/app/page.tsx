'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ClipboardList, FileText, Shield } from 'lucide-react';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { useInterviewStore, type PatientDemographics } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [age, setAge] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const { startSession } = useInterviewStore();

  const isFormValid = patientId.trim() && sex && age && parseInt(age) > 0 && parseInt(age) < 150;

  const handleStart = () => {
    if (!isFormValid) {
      return;
    }
    setIsStarting(true);
    const demographics: PatientDemographics = {
      sex: sex as 'male' | 'female',
      age: parseInt(age),
    };
    startSession(patientId.trim(), demographics);
    router.push('/interview');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="govpl-card p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="hidden md:flex w-16 h-16 bg-[var(--govpl-primary)]/10 rounded-xl items-center justify-center flex-shrink-0">
              <Heart className="w-8 h-8 text-[var(--govpl-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
                Wstępna kwalifikacja kardiologiczna
              </h1>
              <p className="text-[var(--foreground-muted)] text-lg leading-relaxed">
                Przygotuj się do wizyty u kardiologa. Ten asystent przeprowadzi z Tobą
                wstępny wywiad medyczny, który pomoże lekarzowi lepiej przygotować się
                do Twojej wizyty.
              </p>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="govpl-card p-6">
            <div className="w-10 h-10 bg-[var(--info-light)] rounded-lg flex items-center justify-center mb-4">
              <ClipboardList className="w-5 h-5 text-[var(--info)]" />
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              1. Wywiad wstępny
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Odpowiedz na pytania dotyczące objawów, historii medycznej i stylu życia.
            </p>
          </div>

          <div className="govpl-card p-6">
            <div className="w-10 h-10 bg-[var(--warning-light)] rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              2. Analiza i pogłębienie
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Na podstawie odpowiedzi otrzymasz dodatkowe pytania dopasowane do Twojej sytuacji.
            </p>
          </div>

          <div className="govpl-card p-6">
            <div className="w-10 h-10 bg-[var(--success-light)] rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-[var(--success)]" />
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              3. Raport dla lekarza
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Otrzymasz profesjonalny raport przygotowawczy do przekazania kardiologowi.
            </p>
          </div>
        </div>

        {/* Start Form */}
        <div className="govpl-card p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
            Dane pacjenta
          </h2>

          <div className="space-y-6">
            {/* Patient ID */}
            <div>
              <label
                htmlFor="patientId"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Identyfikator pacjenta (demo) <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                id="patientId"
                className="govpl-input max-w-md"
                placeholder="Wprowadź dowolny identyfikator..."
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                W wersji produkcyjnej logowanie odbywa się przez profil zaufany (pacjent.gov.pl)
              </p>
            </div>

            {/* Sex and Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Płeć <span className="text-[var(--error)]">*</span>
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 flex items-center justify-center p-4 rounded-lg border cursor-pointer transition-all ${
                      sex === 'male'
                        ? 'border-[var(--govpl-primary)] bg-blue-50'
                        : 'border-[var(--border)] hover:border-[var(--govpl-primary-light)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sex"
                      value="male"
                      checked={sex === 'male'}
                      onChange={(e) => setSex(e.target.value as 'male')}
                      className="sr-only"
                    />
                    <span className="font-medium">Mężczyzna</span>
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center p-4 rounded-lg border cursor-pointer transition-all ${
                      sex === 'female'
                        ? 'border-[var(--govpl-primary)] bg-blue-50'
                        : 'border-[var(--border)] hover:border-[var(--govpl-primary-light)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sex"
                      value="female"
                      checked={sex === 'female'}
                      onChange={(e) => setSex(e.target.value as 'female')}
                      className="sr-only"
                    />
                    <span className="font-medium">Kobieta</span>
                  </label>
                </div>
              </div>

              {/* Age */}
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Wiek (lata) <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  min="1"
                  max="150"
                  className="govpl-input"
                  placeholder="np. 55"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  Wiek jest istotny dla oceny ryzyka sercowo-naczyniowego
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStart}
                disabled={!isFormValid || isStarting}
                isLoading={isStarting}
              >
                Rozpocznij wywiad
              </Button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-[var(--info-light)] rounded-lg border border-[var(--info)]/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[var(--info)] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-[var(--info)]">
                Informacja o prywatności
              </h4>
              <p className="text-sm text-[var(--info)]/80 mt-1">
                Twoje odpowiedzi są przetwarzane bezpiecznie i służą wyłącznie do
                przygotowania raportu medycznego. Raport zostanie udostępniony
                tylko Tobie i wskazanemu lekarzowi.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-sm text-[var(--foreground-muted)] mt-8">
          Ten asystent ma charakter informacyjny i nie zastępuje konsultacji lekarskiej.
          W przypadku nagłych objawów skontaktuj się z pogotowiem (112) lub udaj się na SOR.
        </p>
      </main>
    </div>
  );
}
