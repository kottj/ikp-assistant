'use client';

import { useState } from 'react';
import type { Question, QuestionOption } from '@/types';
import { clsx } from 'clsx';

interface QuestionCardProps {
  question: Question;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
}

export function QuestionCard({ question, value, onChange, disabled = false }: QuestionCardProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: string | string[]) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="govpl-card p-6">
      <div className="mb-4">
        <label className="block text-lg font-medium text-[var(--foreground)] mb-2">
          {question.text}
          {question.required && <span className="text-[var(--error)] ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-sm text-[var(--foreground-muted)]">{question.helpText}</p>
        )}
      </div>

      <div className="mt-4">
        {question.type === 'text' && (
          <TextInput
            value={localValue as string}
            onChange={handleChange}
            placeholder={question.placeholder}
            disabled={disabled}
          />
        )}

        {question.type === 'textarea' && (
          <TextareaInput
            value={localValue as string}
            onChange={handleChange}
            placeholder={question.placeholder}
            disabled={disabled}
          />
        )}

        {question.type === 'select' && question.options && (
          <SelectInput
            options={question.options}
            value={localValue as string}
            onChange={handleChange}
            disabled={disabled}
          />
        )}

        {question.type === 'radio' && question.options && (
          <RadioInput
            options={question.options}
            value={localValue as string}
            onChange={handleChange}
            name={question.id}
            disabled={disabled}
            allowOther={question.allowOther}
            otherPlaceholder={question.otherPlaceholder}
          />
        )}

        {question.type === 'multiselect' && question.options && (
          <MultiselectInput
            options={question.options}
            value={Array.isArray(localValue) ? localValue : []}
            onChange={handleChange}
            disabled={disabled}
            allowOther={question.allowOther}
            otherPlaceholder={question.otherPlaceholder}
          />
        )}

        {question.type === 'scale' && (
          <ScaleInput
            min={question.scaleMin || 1}
            max={question.scaleMax || 10}
            labels={question.scaleLabels}
            value={localValue as string}
            onChange={handleChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}

// Text Input
function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled: boolean;
}) {
  return (
    <input
      type="text"
      className="govpl-input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

// Textarea Input
function TextareaInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled: boolean;
}) {
  return (
    <textarea
      className="govpl-input min-h-[120px] resize-y"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={4}
    />
  );
}

// Select Input
function SelectInput({
  options,
  value,
  onChange,
  disabled,
}: {
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <select
      className="govpl-input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Wybierz opcję...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Radio Input
function RadioInput({
  options,
  value,
  onChange,
  name,
  disabled,
  allowOther,
  otherPlaceholder,
}: {
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  disabled: boolean;
  allowOther?: boolean;
  otherPlaceholder?: string;
}) {
  const stringValue = typeof value === 'string' ? value : '';
  const isOtherSelected = stringValue.startsWith('other:');
  const otherText = isOtherSelected ? stringValue.slice(6) : '';

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={clsx(
            'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
            stringValue === option.value
              ? 'border-[var(--govpl-primary)] bg-blue-50'
              : 'border-[var(--border)] hover:border-[var(--govpl-primary-light)]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={stringValue === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-4 h-4 text-[var(--govpl-primary)] focus:ring-[var(--govpl-primary)]"
          />
          <span className="ml-3 text-[var(--foreground)]">{option.label}</span>
        </label>
      ))}
      {allowOther && (
        <div className="space-y-2">
          <label
            className={clsx(
              'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
              isOtherSelected
                ? 'border-[var(--govpl-primary)] bg-blue-50'
                : 'border-[var(--border)] hover:border-[var(--govpl-primary-light)]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name={name}
              value="other:"
              checked={isOtherSelected}
              onChange={() => onChange('other:')}
              disabled={disabled}
              className="w-4 h-4 text-[var(--govpl-primary)] focus:ring-[var(--govpl-primary)]"
            />
            <span className="ml-3 text-[var(--foreground)]">Inne</span>
          </label>
          {isOtherSelected && (
            <input
              type="text"
              className="govpl-input ml-7"
              value={otherText}
              onChange={(e) => onChange(`other:${e.target.value}`)}
              placeholder={otherPlaceholder || 'Proszę podać szczegóły...'}
              disabled={disabled}
              autoFocus
            />
          )}
        </div>
      )}
    </div>
  );
}

// Multiselect Input (Checkboxes)
function MultiselectInput({
  options,
  value,
  onChange,
  disabled,
  allowOther,
  otherPlaceholder,
}: {
  options: QuestionOption[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  allowOther?: boolean;
  otherPlaceholder?: string;
}) {
  const otherValue = value.find((v) => v.startsWith('other:'));
  const hasOther = !!otherValue;
  const otherText = hasOther ? otherValue!.slice(6) : '';

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleOtherToggle = () => {
    if (hasOther) {
      onChange(value.filter((v) => !v.startsWith('other:')));
    } else {
      onChange([...value, 'other:']);
    }
  };

  const handleOtherTextChange = (text: string) => {
    const filteredValues = value.filter((v) => !v.startsWith('other:'));
    onChange([...filteredValues, `other:${text}`]);
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={clsx(
            'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
            value.includes(option.value)
              ? 'border-[var(--govpl-primary)] bg-blue-50'
              : 'border-[var(--border)] hover:border-[var(--govpl-primary-light)]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            type="checkbox"
            checked={value.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            disabled={disabled}
            className="w-4 h-4 text-[var(--govpl-primary)] rounded focus:ring-[var(--govpl-primary)]"
          />
          <span className="ml-3 text-[var(--foreground)]">{option.label}</span>
        </label>
      ))}
      {allowOther && (
        <div className="space-y-2">
          <label
            className={clsx(
              'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
              hasOther
                ? 'border-[var(--govpl-primary)] bg-blue-50'
                : 'border-[var(--border)] hover:border-[var(--govpl-primary-light)]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="checkbox"
              checked={hasOther}
              onChange={handleOtherToggle}
              disabled={disabled}
              className="w-4 h-4 text-[var(--govpl-primary)] rounded focus:ring-[var(--govpl-primary)]"
            />
            <span className="ml-3 text-[var(--foreground)]">Inne</span>
          </label>
          {hasOther && (
            <input
              type="text"
              className="govpl-input ml-7"
              value={otherText}
              onChange={(e) => handleOtherTextChange(e.target.value)}
              placeholder={otherPlaceholder || 'Proszę podać szczegóły...'}
              disabled={disabled}
              autoFocus
            />
          )}
        </div>
      )}
    </div>
  );
}

// Scale Input (1-10 slider)
function ScaleInput({
  min,
  max,
  labels,
  value,
  onChange,
  disabled,
}: {
  min: number;
  max: number;
  labels?: { min: string; max: string };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const numValue = parseInt(value) || min;
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2">
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => onChange(step.toString())}
            disabled={disabled}
            className={clsx(
              'w-10 h-10 rounded-lg font-medium transition-all',
              numValue === step
                ? 'bg-[var(--govpl-primary)] text-white'
                : 'bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--govpl-primary-light)] hover:text-white',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {step}
          </button>
        ))}
      </div>
      {labels && (
        <div className="flex justify-between text-sm text-[var(--foreground-muted)]">
          <span>{labels.min}</span>
          <span>{labels.max}</span>
        </div>
      )}
    </div>
  );
}
