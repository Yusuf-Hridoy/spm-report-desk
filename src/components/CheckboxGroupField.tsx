import { useId } from 'react';
import { FieldHelpText } from './FieldHelpText';

export interface CheckboxOption {
  value: string;
  label: string;
  helpText?: string;
}

interface CheckboxGroupFieldProps {
  legend: string;
  helpText?: string;
  options: readonly CheckboxOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function CheckboxGroupField({
  legend,
  helpText,
  options,
  selected,
  onChange,
}: CheckboxGroupFieldProps) {
  const id = useId();
  const helpId = `${id}-help`;

  function toggle(value: string, checked: boolean) {
    // Keep the order of the option list, so the report is always in the same order.
    const next = new Set(selected);
    if (checked) next.add(value);
    else next.delete(value);
    onChange(options.map((option) => option.value).filter((optionValue) => next.has(optionValue)));
  }

  return (
    <fieldset aria-describedby={helpText ? helpId : undefined}>
      <legend className="field-label">{legend}</legend>
      {helpText && <FieldHelpText id={helpId}>{helpText}</FieldHelpText>}
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-accent"
              checked={selected.includes(option.value)}
              onChange={(event) => toggle(option.value, event.target.checked)}
            />
            <span>
              {option.label}
              {option.helpText && (
                <span className="block text-sm text-gray-700">{option.helpText}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
