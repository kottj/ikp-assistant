'use client';

import { useState, useEffect } from 'react';
import { Heart, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { isLLMConfigured } from '@/lib/llm-config';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ showBack, onBack }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isLLMConfigured());
  }, [showSettings]);

  return (
    <>
      <header className="bg-[var(--govpl-primary)] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBack && onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Wróć"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              )}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">IKP Asystent</h1>
                  <p className="text-xs text-white/70">Kwalifikacja kardiologiczna</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={isConfigured ? 'AI skonfigurowane' : 'Skonfiguruj AI'}
              >
                <Settings className="w-5 h-5" />
                {isConfigured ? (
                  <CheckCircle className="w-4 h-4 text-green-300" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-300" />
                )}
              </button>

              <div className="text-right hidden sm:block">
                <p className="text-sm text-white/70">pacjent.gov.pl</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
