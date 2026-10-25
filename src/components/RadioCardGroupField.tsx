import { useId } from 'react';
import { FieldHelpText } from './FieldHelpText';

export interface RadioCardOption<T extends string> {
  value: T;
  label: string;
  helpText?: string;
}

interface RadioCardGroupFieldProps<T extends string> {
  legend: string;
  helpText?: string;
  options: readonly RadioCardOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3;
}

const COLUMN_CLASSES = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' } as const;

export function RadioCardGroupField<T extends string>({
  legend,
  helpText,
  options,
  value,
  onChange,
  columns = 1,
}: RadioCardGroupFieldProps<T>) {
  const name = useId();
  const helpId = `${name}-help`;
  return (
    <fieldset aria-describedby={helpText ? helpId : undefined}>
      <legend className="field-label">{legend}</legend>
      {helpText && <FieldHelpText id={helpId}>{helpText}</FieldHelpText>}
      <div className={`mt-2 grid gap-3 ${COLUMN_CLASSES[columns]}`}>
        {options.map((option) => (
          <label key={option.value} className="choice-card">
            <input
              type="radio"
              name={name}
              value={option.value}
              className="mt-1 size-4 shrink-0 accent-accent"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <span className="block font-medium">{option.label}</span>
              {option.helpText && (
                <span className="mt-1 block text-sm text-gray-700">{option.helpText}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
