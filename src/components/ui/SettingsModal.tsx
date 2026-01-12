'use client';

import { useState, useEffect } from 'react';
import { X, Settings, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import {
  getLLMSettings,
  saveLLMSettings,
  clearLLMSettings,
  getDefaultModel,
  PROVIDER_INFO,
  MODEL_OPTIONS,
  type LLMSettings,
} from '@/lib/llm-config';
import type { LLMProvider } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [provider, setProvider] = useState<LLMProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const settings = getLLMSettings();
      if (settings) {
        setProvider(settings.provider);
        setApiKey(settings.apiKey);
        setModel(settings.model);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    // Update model when provider changes
    setModel(getDefaultModel(provider));
  }, [provider]);

  const handleSave = () => {
    const settings: LLMSettings = {
      provider,
      apiKey: apiKey.trim(),
      model,
    };
    saveLLMSettings(settings);
    onClose();
  };

  const handleClear = () => {
    clearLLMSettings();
    setProvider('openai');
    setApiKey('');
    setModel('gpt-4o');
    setTestStatus('idle');
    setTestMessage('');
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Wprowadź klucz API');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testowanie połączenia...');

    try {
      const response = await fetch('/api/test-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: apiKey.trim(), model }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('Połączenie działa poprawnie!');
      } else {
        setTestStatus('error');
        setTestMessage(data.error || 'Błąd połączenia');
      }
    } catch {
      setTestStatus('error');
      setTestMessage('Błąd sieci');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--govpl-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Konfiguracja AI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--border)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Dostawca AI
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PROVIDER_INFO) as LLMProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    provider === p
                      ? 'border-[var(--govpl-primary)] bg-blue-50'
                      : 'border-[var(--border)] hover:border-[var(--govpl-primary-light)]'
                  }`}
                >
                  <div className="font-medium text-sm">{PROVIDER_INFO[p].name}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    {PROVIDER_INFO[p].description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Klucz API
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus('idle');
                }}
                placeholder={`${PROVIDER_INFO[provider].keyPrefix}...`}
                className="govpl-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              Klucz jest przechowywany lokalnie w przeglądarce
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="govpl-input"
            >
              {MODEL_OPTIONS[provider].map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Test Connection */}
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTest}
              disabled={!apiKey.trim() || testStatus === 'testing'}
              isLoading={testStatus === 'testing'}
              className="w-full"
            >
              Testuj połączenie
            </Button>

            {testStatus !== 'idle' && testStatus !== 'testing' && (
              <div
                className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-sm ${
                  testStatus === 'success'
                    ? 'bg-[var(--success-light)] text-[var(--success)]'
                    : 'bg-[var(--error-light)] text-[var(--error)]'
                }`}
              >
                {testStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {testMessage}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-3 bg-[var(--info-light)] rounded-lg text-sm">
            <p className="text-[var(--info)]">
              <strong>Jak uzyskać klucz API:</strong>
            </p>
            <ul className="mt-1 text-[var(--info)]/80 list-disc list-inside space-y-1">
              {provider === 'openai' && (
                <li>
                  Utwórz konto na{' '}
                  <a
                    href="https://platform.openai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    platform.openai.com
                  </a>
                </li>
              )}
              {provider === 'anthropic' && (
                <li>
                  Utwórz konto na{' '}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    console.anthropic.com
                  </a>
                </li>
              )}
              {provider === 'azure' && (
                <li>Skonfiguruj Azure OpenAI w portalu Azure</li>
              )}
              <li>Wygeneruj klucz API w ustawieniach konta</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Wyczyść ustawienia
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Anuluj
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!apiKey.trim()}>
              Zapisz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
